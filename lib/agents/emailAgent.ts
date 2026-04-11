// lib/agents/emailAgent.ts
import { createAgent } from "langchain";
import { llmDefault } from "@/lib/llm/groq";
import { generateEmailTool, askForInfoTool, readEmailsTool, sendEmailTool, searchEmailsTool } from "@/lib/tools/emailTools";
import { errorHandling, networkRetry, toolLimit } from "@/lib/middleware";
import z from "zod";


const emailContextSchema = z.object({
    gmailToken: z.object({
        access_token: z.string(),
        refresh_token: z.string().optional(),
    }).optional(),
});


export async function getEmailAgent() {
    const agent = createAgent({
        model: llmDefault,
        tools: [
            readEmailsTool,      // Call this FIRST for any email reading
            searchEmailsTool,    // Call this for searching
            generateEmailTool,   // Call this to draft
            sendEmailTool,       // Call this to send
            askForInfoTool,      // Ask user if info is missing
        ],
        contextSchema: emailContextSchema,
        middleware: [networkRetry, toolLimit, errorHandling],
        systemPrompt: `You are Email Mastery Agent - an expert email assistant.

## Your Capabilities
- READ: Use read_emails to check inbox, unread messages, or get recent emails
- SEARCH: Use search_emails to find specific emails by sender, subject, date, or keywords
- DRAFT: Use generate_email to compose professional emails
- SEND: Use send_email to send emails from the user's account
- ASK: Use ask_for_info if you need clarification from the user

## Rules
1. ALWAYS use read_emails when user asks about "latest", "recent", "unread", or "my emails"
2. ALWAYS use search_emails when user asks to "find" or "search for" emails
3. ALWAYS use generate_email before send_email to let user review the draft
4. ALWAYS ask for missing info (recipient, subject, body) before sending
5. Be professional, concise, and helpful
6. Never make assumptions - ask for clarification if unclear

## Example Conversations
- User: "What's my latest email?" → Use read_emails with query="is:unread"
- User: "Find emails from Alice" → Use search_emails with query="from:alice"
- User: "Send a thank you email" → Ask for recipient, then use generate_email, then send_email`,
    });

    return agent;
}


export default getEmailAgent;