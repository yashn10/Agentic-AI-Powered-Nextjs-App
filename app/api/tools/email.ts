// app/api/tools/email.ts
import { tool } from "langchain";
import * as z from "zod";
import { google } from "googleapis";
import { getUserGmailToken } from "@/lib/auth/session";


// ✅ CORRECT: Get user's token, not hardcoded
async function getGmailClient() {
    const userToken = await getUserGmailToken();

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
        access_token: userToken.access_token,
        refresh_token: userToken.refresh_token,
        expiry_date: userToken.expiry_date,
    });

    return google.gmail({ version: "v1", auth });
}


export const readEmailsTool = tool(
    async (input: any) => {
        try {
            const gmail = await getGmailClient();

            const response = await gmail.users.messages.list({
                userId: "me",
                q: input.query || "is:unread",
                maxResults: 5,
            });

            if (!response.data.messages) {
                return JSON.stringify({ emails: [], count: 0 });
            }

            // Get full message details
            const emails = await Promise.all(
                response.data.messages.slice(0, 5).map(async (msg: any) => {
                    const fullMsg = await gmail.users.messages.get({
                        userId: "me",
                        id: msg.id!,
                        format: "full",
                    });

                    const headers = fullMsg.data.payload?.headers || [];
                    const from = headers.find((h: any) => h.name === "From")?.value || "Unknown";
                    const subject = headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
                    const snippet = fullMsg.data.snippet || "";

                    return {
                        id: msg.id,
                        from,
                        subject,
                        snippet,
                        timestamp: fullMsg.data.internalDate,
                    };
                })
            );

            return JSON.stringify({ emails, count: emails.length });
        } catch (err: any) {
            console.error("Read emails error:", err);
            return JSON.stringify({
                error: `Failed to read emails: ${err.message}`,
                emails: [],
            });
        }
    },
    {
        name: "read_emails",
        description: "Read emails from Gmail inbox",
        schema: z.object({
            query: z.string().optional().describe("Gmail search query"),
        }),
    }
);


export const sendEmailTool = tool(
    async (input: any) => {
        try {
            const gmail = await getGmailClient();

            // Create email message
            const message = [
                `To: ${input.to}`,
                `Subject: ${input.subject}`,
                `Content-Type: text/plain; charset="UTF-8"`,
                `MIME-Version: 1.0`,
                ``,
                input.body,
            ].join("\n");

            // Base64 encode
            const base64Message = Buffer.from(message)
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=/g, "");

            const response = await gmail.users.messages.send({
                userId: "me",
                requestBody: {
                    raw: base64Message,
                },
            });

            return JSON.stringify({
                success: true,
                message: `Email sent to ${input.to}`,
                messageId: response.data.id,
            });
        } catch (err: any) {
            console.error("Send email error:", err);
            return JSON.stringify({
                success: false,
                error: `Failed to send email: ${err.message}`,
            });
        }
    },
    {
        name: "send_email",
        description: "Send an email via Gmail",
        schema: z.object({
            to: z.string().describe("Recipient email address"),
            subject: z.string().describe("Email subject"),
            body: z.string().describe("Email body content"),
        }),
    }
);


export const searchEmailsTool = tool(
    async (input: any) => {
        try {
            const gmail = await getGmailClient();

            const response = await gmail.users.messages.list({
                userId: "me",
                q: input.query,
                maxResults: 10,
            });

            if (!response.data.messages) {
                return JSON.stringify({ emails: [], count: 0 });
            }

            const emails = response.data.messages.map((msg: any) => ({
                id: msg.id,
                snippet: msg.snippet,
            }));

            return JSON.stringify({
                emails,
                count: emails.length,
                total: response.data.resultSizeEstimate,
            });
        } catch (err: any) {
            console.error("Search emails error:", err);
            return JSON.stringify({
                error: `Search failed: ${err.message}`,
                emails: [],
            });
        }
    },
    {
        name: "search_emails",
        description: "Search emails in Gmail",
        schema: z.object({
            query: z.string().describe("Search query"),
        }),
    }
);


export const draftEmailTool = tool(
    async (input: any) => {
        try {
            const gmail = await getGmailClient();

            const message = [
                `To: ${input.to}`,
                `Subject: ${input.subject}`,
                `Content-Type: text/plain; charset="UTF-8"`,
                `MIME-Version: 1.0`,
                ``,
                input.body,
            ].join("\n");

            const base64Message = Buffer.from(message)
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=/g, "");

            const response = await gmail.users.drafts.create({
                userId: "me",
                requestBody: {
                    message: {
                        raw: base64Message,
                    },
                },
            });

            return JSON.stringify({
                success: true,
                message: "Draft created successfully",
                draftId: response.data.id,
            });
        } catch (err: any) {
            console.error("Draft email error:", err);
            return JSON.stringify({
                success: false,
                error: `Failed to create draft: ${err.message}`,
            });
        }
    },
    {
        name: "draft_email",
        description: "Create a draft email",
        schema: z.object({
            to: z.string().describe("Recipient email"),
            subject: z.string().describe("Email subject"),
            body: z.string().describe("Email body"),
        }),
    }
);
