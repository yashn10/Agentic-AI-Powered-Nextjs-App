// app/api/tools/email.ts
import { tool } from "langchain";
import * as z from "zod";
import { google } from "googleapis";
import nodemailer from "nodemailer";

/*
  Notes:
  - This file expects GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env.
  - Tools accept a second `context` argument (in LangChain) which must include
    the user's refresh token (context.gmailToken.refresh_token) or
    header 'x-gmail-token' (stringified JSON) containing refresh_token.
  - Primary send method uses Gmail API messages.send so emails are sent
    from the logged-in user's account.
*/
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
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


/**
 * getUserGmailClient(context)
 * - context.gmailToken: { refresh_token, access_token?, expiry_date? }
 * - or context.headers['x-gmail-token'] (stringified JSON)
 * - or env SERVICE_GMAIL_TOKEN for dev (stringified JSON)
 */
async function getUserGmailClient(context: any = {}) {
    const maybeEnvToken = process.env.SERVICE_GMAIL_TOKEN ? safeParseJson(process.env.SERVICE_GMAIL_TOKEN) : null;
    const headerToken = context?.headers?.["x-gmail-token"] || context?.headers?.["x-gmail-token"];

    let userToken =
        context?.gmailToken ||
        (typeof headerToken === "string" ? safeParseJson(headerToken) : headerToken) ||
        context?.body?.gmailToken ||
        maybeEnvToken ||
        null;

    if (!userToken || !userToken.refresh_token) {
        throw new Error("User Gmail authorization required. Provide context.gmailToken.refresh_token or header 'x-gmail-token'.");
    }

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oauth2Client.setCredentials({
        refresh_token: userToken.refresh_token,
        access_token: userToken.access_token,
        expiry_date: userToken.expiry_date,
    });

    // google library will refresh automatically when needed
    return google.gmail({ version: "v1", auth: oauth2Client });
}

/* ------------------------
   Nodemailer OAuth2 helper (optional)
   ------------------------ */
async function createTransportWithOAuth2(userRecord: { refresh_token: any; email: any }) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET for OAuth2 SMTP transport.");
    }

    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oAuth2Client.setCredentials({ refresh_token: userRecord.refresh_token });

    const atRes: any = await oAuth2Client.getAccessToken();
    const accessToken = typeof atRes === "string" ? atRes : atRes?.token;

    if (!accessToken) throw new Error("Failed to obtain access token for SMTP transport.");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: userRecord.email,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: userRecord.refresh_token,
            accessToken,
        },
    });

    return transporter;
}


export const askForInfoTool = tool(
    async ({ info_needed }: any) => {
        return {
            action: "ask_user",
            needs: info_needed,
            waiting: true,
        };
    },
    {
        name: "ask_for_info",
        description: "Ask the user for missing information needed for the email.",
        schema: z.object({ info_needed: z.string() }),
    }
);


export const readEmailsTool = tool(
    async ({ query = "is:unread", maxResults = 10 }: any, context: any = {}) => {
        try {
            const gmail = await getUserGmailClient(context);

            const response = await gmail.users.messages.list({ userId: "me", q: query, maxResults });

            if (!response.data.messages || response.data.messages.length === 0) {
                return { emails: [], count: 0, message: "No emails found" };
            }

            const messages = response.data.messages.slice(0, Math.min(5, response.data.messages.length));

            const emails = await Promise.all(
                messages.map(async (msg: any) => {
                    const fullMsg = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "metadata", metadataHeaders: ["From", "To", "Subject", "Date"] });
                    const headers: any[] = fullMsg.data.payload?.headers || [];
                    const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || "Unknown";

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

            return { emails, count: emails.length, total: response.data.resultSizeEstimate, message: `Found ${emails.length} matching emails` };
        } catch (err: any) {
            console.error("Read emails error:", err);
            return { error: `Failed to read emails: ${err?.message || String(err)}`, emails: [], suggestion: "Please ensure Gmail authorization is active and tokens are valid." };
        }
    },
    {
        name: "read_emails",
        description: "Read recent emails from your Gmail inbox.",
        schema: z.object({ query: z.string().optional(), maxResults: z.number().optional() }),
    }
);


export const generateEmailTool = tool(
    async ({ user_request, tone, email_type }: any) => {
        // Placeholder: replace with LLM-based generation
        const subject = (user_request || "").slice(0, 80) || "No Subject";
        const body = `Hello,\n\n${user_request}\n\nBest regards,`;
        return { status: "ready", message: "Draft generated.", draft: { subject, body }, tone, email_type };
    },
    {
        name: "generate_email",
        description: "Generate a professional email draft.",
        schema: z.object({ user_request: z.string(), tone: z.string().optional(), email_type: z.string().optional() }),
    }
);


export const sendEmailTool = tool(
    async ({ subject, body, recipient_email }: any, context: any = {}) => {
        try {
            const validation = validateEmail(recipient_email);
            if (!validation.valid) return { success: false, error: `Invalid recipient: ${validation.error}` };

            const gmail = await getUserGmailClient(context);

            // resolve sender email (prefer context.user.email if provided)
            let fromEmail = context?.user?.email || context?.headers?.["x-user-email"] || null;
            if (!fromEmail) {
                // try to fetch profile via oauth2 (safe-guard)
                try {
                    const oauth2 = google.oauth2({ auth: (gmail as any).auth, version: "v2" });
                    const profile = await oauth2.userinfo.get();
                    fromEmail = profile?.data?.email || fromEmail;
                } catch (e) {
                    // ignore: we'll fallback to 'me'
                }
            }

            const finalFrom = fromEmail || "me";

            let finalBody = body ?? "";
            if (!/Best regards|Sincerely|Regards/.test(finalBody)) finalBody += "\n\nBest regards";
            const html = formatEmailHTML(finalBody);

            const rawMessage = [
                `From: ${finalFrom}`,
                `To: ${recipient_email}`,
                `Subject: ${subject}`,
                `MIME-Version: 1.0`,
                `Content-Type: text/html; charset=UTF-8`,
                "",
                html,
            ].join("\r\n");

            const raw = base64UrlEncode(rawMessage);

            const sendRes = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });

            return { success: true, message: `Email sent to ${recipient_email}`, recipient: recipient_email, subject, messageId: sendRes.data.id, threadId: sendRes.data.threadId };
        } catch (err: any) {
            console.error("Send email error:", err);
            const isAuthError = String(err?.message || "").includes("invalid_grant") || String(err?.message || "").includes("invalid_request");
            return { success: false, error: err?.message || String(err), user_message: isAuthError ? "Authorization failed. Please re-authorize Gmail access." : "Failed to send email.", suggest_reauth: isAuthError };
        }
    },
    {
        name: "send_email",
        description: "Send an email from the logged-in user's Gmail via the Gmail API (requires user's refresh_token in context).",
        schema: z.object({ subject: z.string().min(1), body: z.string().min(1), recipient_email: z.string().min(5) }),
    }
);


export const searchEmailsTool = tool(
    async ({ query }: any, context: any = {}) => {
        try {
            const gmail = await getUserGmailClient(context);
            const response = await gmail.users.messages.list({ userId: "me", q: query, maxResults: 10 });

            if (!response.data.messages || response.data.messages.length === 0) return { emails: [], count: 0, message: `No emails found matching "${query}"` };

            const messages = response.data.messages.slice(0, Math.min(5, response.data.messages.length));

            const emails = await Promise.all(
                messages.map(async (msg: any) => {
                    const fullMsg = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "metadata", metadataHeaders: ["From", "Subject"] });
                    const headers: any[] = fullMsg.data.payload?.headers || [];
                    const fromHeader = headers.find((h: any) => h.name === "From");
                    const subjectHeader = headers.find((h: any) => h.name === "Subject");
                    const from = fromHeader?.value || "Unknown";
                    const subject = subjectHeader?.value || "(No Subject)";
                    return { id: msg.id, from: String(from).split("<")[0].trim(), subject, snippet: fullMsg.data.snippet || "" };
                })
            );

            return { emails, count: emails.length, total: response.data.resultSizeEstimate, query };
        } catch (err: any) {
            console.error("Search emails error:", err);
            return { error: `Search failed: ${err?.message || String(err)}`, emails: [], suggestion: "Check Gmail authorization" };
        }
    },
    { name: "search_emails", description: "Search your Gmail for specific emails.", schema: z.object({ query: z.string() }) }
);
