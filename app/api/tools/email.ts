// app/api/tools/email.ts
import { tool } from "langchain";
import * as z from "zod";
import { google } from "googleapis";


const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn("Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set in env.");
}


function safeParseJson(s: string | undefined | null) {
    if (!s) return null;
    try {
        return JSON.parse(s as string);
    } catch {
        return null;
    }
}

function base64UrlEncode(input: string) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function validateEmail(email: any) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { valid: false, error: "Email is empty" };
    if (!regex.test(email)) return { valid: false, error: "Invalid email format" };
    if (String(email).length > 254) return { valid: false, error: "Email too long" };
    return { valid: true };
}

function formatEmailHTML(text: string) {
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
      <div style="white-space: pre-wrap; margin: 20px 0;">
        ${text.split("\n").map((line) => (line.trim() ? line : "&nbsp;")).join("<br>")}
      </div>
    </div>
  `;
}


async function getUserGmailClient(config: any = {}) {
    console.log("[getUserGmailClient] Retrieving Gmail client...");

    let userToken = config?.configurable?.gmailToken;

    if (!userToken || (!userToken.refresh_token && !userToken.access_token)) {
        throw new Error("User Gmail authorization required.");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL
    );

    // ✅ Set credentials with refresh token
    const credentials: any = {};
    if (userToken.refresh_token) {
        credentials.refresh_token = userToken.refresh_token;
    }
    if (userToken.access_token) {
        credentials.access_token = userToken.access_token;
    }
    if (userToken.expiry_date) {
        credentials.expiry_date = userToken.expiry_date;
    }

    oauth2Client.setCredentials(credentials);

    // ✅ CRITICAL: Let googleapis handle token refresh automatically
    // When the token expires, googleapis will use the refresh_token to get a new one
    return google.gmail({ version: "v1", auth: oauth2Client });
}


export const generateEmailTool = tool(
    async ({ subject, body, tone = "professional" }: any) => {
        console.log(`[generate_email] subject="${subject}", tone="${tone}"`);
        return {
            status: "ready",
            message: "Email draft generated",
            draft: {
                subject: subject || "Untitled",
                body: body || "Your email body here"
            },
            tone
        };
    },
    {
        name: "generate_email",
        description: "Generate a professional email draft for the user.",
        schema: z.object({
            subject: z.string()
                .describe("Email subject line")
                .min(1),
            body: z.string()
                .describe("Email body content")
                .min(1),
            tone: z.string()
                .describe("Email tone: professional, casual, formal, or friendly")
                .optional()
                .default("professional"),
        }),
    }
);


export const askForInfoTool = tool(
    async ({ info_type }: any) => {
        console.log(`[ask_for_info] info_type="${info_type}"`);
        return {
            action: "ask_user",
            needs: info_type,
            waiting: true,
        };
    },
    {
        name: "ask_for_info",
        description: "Ask user for additional information needed to complete the task.",
        schema: z.object({
            info_type: z.string()
                .describe("Type of info needed like 'recipient email', 'subject', 'body'")
                .min(1),
        }),
    }
);


export const readEmailsTool = tool(
    async ({ query = "is:unread", maxResults = 5 }: any, config: any = {}) => {
        try {
            console.log(`[read_emails] query="${query}", maxResults=${maxResults}`);
            console.log(`[read_emails] config received:`, config?.configurable ? "✓ Yes" : "✗ No");

            // ✅ Pass config (not context) to getUserGmailClient
            const gmail = await getUserGmailClient(config);

            const safeQuery = (typeof query === "string" && query.trim().length > 0)
                ? query
                : "in:inbox";

            const response = await gmail.users.messages.list({
                userId: "me",
                q: safeQuery,
                maxResults
            });

            if (!response.data.messages || response.data.messages.length === 0) {
                return {
                    emails: [],
                    count: 0,
                    message: "No emails found"
                };
            }

            const messages = response.data.messages.slice(0, Math.min(5, response.data.messages.length));

            const emails = await Promise.all(
                messages.map(async (msg: any) => {
                    const fullMsg = await gmail.users.messages.get({
                        userId: "me",
                        id: msg.id,
                        format: "metadata",
                        metadataHeaders: ["From", "To", "Subject", "Date"]
                    });
                    const headers: any[] = fullMsg.data.payload?.headers || [];
                    const getHeader = (name: string) =>
                        headers.find((h: any) => h.name === name)?.value || "Unknown";

                    return {
                        id: msg.id,
                        from: String(getHeader("From")).split("<")[0].trim(),
                        to: String(getHeader("To")).split("<")[0].trim(),
                        subject: getHeader("Subject"),
                        date: getHeader("Date"),
                        snippet: fullMsg.data.snippet || "",
                    };
                })
            );

            return {
                emails,
                count: emails.length,
                total: response.data.resultSizeEstimate,
                message: `Found ${emails.length} matching emails`
            };
        } catch (err: any) {
            console.error("Read emails error:", err);
            return {
                error: true,
                errorMessage: err?.message || String(err),
                suggestion: "Ensure Gmail token is provided and valid."
            };
        }
    },
    {
        name: "read_emails",
        description: "Read recent emails from Gmail inbox. Fetch unread messages or search inbox.",
        schema: z.object({
            query: z.string()
                .describe("Gmail search query like 'is:unread', 'from:user@example.com'")
                .optional()
                .default("is:unread"),
            maxResults: z.number()
                .describe("Max emails to return (1-10)")
                .optional()
                .default(5),
        }),
    }
);


export const sendEmailTool = tool(
    async ({ to, subject, body }: any, config: any = {}) => {
        try {
            const validation = validateEmail(to);
            if (!validation.valid) {
                return {
                    success: false,
                    error: `Invalid recipient: ${validation.error}`
                };
            }

            const gmail = await getUserGmailClient(config); // ✅ Pass config

            let fromEmail = config?.configurable?.user?.email || null;

            if (!fromEmail) {
                try {
                    const oauth2 = google.oauth2({ auth: (gmail as any).auth, version: "v2" });
                    const profile = await oauth2.userinfo.get();
                    fromEmail = profile?.data?.email || fromEmail;
                } catch (e) {
                    // fallback
                }
            }

            const finalFrom = fromEmail || "me";
            let finalBody = body ?? "";
            if (!/Best regards|Sincerely|Regards/.test(finalBody)) {
                finalBody += "\n\nBest regards";
            }

            const html = formatEmailHTML(finalBody);
            const rawMessage = [
                `From: ${finalFrom}`,
                `To: ${to}`,
                `Subject: ${subject}`,
                `MIME-Version: 1.0`,
                `Content-Type: text/html; charset=UTF-8`,
                "",
                html,
            ].join("\r\n");

            const raw = base64UrlEncode(rawMessage);
            const sendRes = await gmail.users.messages.send({
                userId: "me",
                requestBody: { raw }
            });

            return {
                success: true,
                message: `Email sent to ${to}`,
                recipient: to,
                subject,
                messageId: sendRes.data.id,
                threadId: sendRes.data.threadId
            };
        } catch (err: any) {
            console.error("Send email error:", err);
            return {
                success: false,
                error: err?.message || String(err)
            };
        }
    },
    {
        name: "send_email",
        description: "Send an email from the user's Gmail account.",
        schema: z.object({
            to: z.string()
                .describe("Recipient email address"),
            subject: z.string()
                .describe("Email subject line")
                .min(1),
            body: z.string()
                .describe("Email body content")
                .min(1),
        }),
    }
);


export const searchEmailsTool = tool(
    async ({ query }: any, config: any = {}) => {
        try {
            if (!query || query.trim().length === 0) {
                return {
                    error: "Search query required",
                    emails: []
                };
            }

            console.log(`[search_emails] query="${query}"`);
            const gmail = await getUserGmailClient(config); // ✅ Pass config

            const response = await gmail.users.messages.list({
                userId: "me",
                q: query,
                maxResults: 10
            });

            if (!response.data.messages || response.data.messages.length === 0) {
                return {
                    emails: [],
                    count: 0,
                    message: `No emails found matching "${query}"`
                };
            }

            const messages = response.data.messages.slice(0, Math.min(5, response.data.messages.length));

            const emails = await Promise.all(
                messages.map(async (msg: any) => {
                    const fullMsg = await gmail.users.messages.get({
                        userId: "me",
                        id: msg.id,
                        format: "metadata",
                        metadataHeaders: ["From", "Subject"]
                    });
                    const headers: any[] = fullMsg.data.payload?.headers || [];
                    const from = headers.find((h: any) => h.name === "From")?.value || "Unknown";
                    const subject = headers.find((h: any) => h.name === "Subject")?.value || "(No Subject)";

                    return {
                        id: msg.id,
                        from: String(from).split("<")[0].trim(),
                        subject,
                        snippet: fullMsg.data.snippet || ""
                    };
                })
            );

            return {
                emails,
                count: emails.length,
                total: response.data.resultSizeEstimate,
                query
            };
        } catch (err: any) {
            console.error("Search emails error:", err);
            return {
                error: `Search failed: ${err?.message || String(err)}`,
                emails: []
            };
        }
    },
    {
        name: "search_emails",
        description: "Search Gmail for emails by sender, subject, date, or keywords.",
        schema: z.object({
            query: z.string()
                .describe("Gmail search query like 'from:alice@example.com'")
                .min(1),
        }),
    }
);
