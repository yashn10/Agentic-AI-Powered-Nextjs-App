// lib/agents/emailAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { readEmailsTool, sendEmailTool, searchEmailsTool, draftEmailTool } from "@/app/api/tools/email";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.3,
    maxTokens: 1500,
});


export async function getEmailAgent() {
    const agent = createAgent({
        model: llm,
        tools: [readEmailsTool, sendEmailTool, searchEmailsTool, draftEmailTool],
        systemPrompt: `
You are Email Mastery Agent. Help users with:
- Reading and summarizing emails
- Searching for specific emails
- Drafting professional emails
- Sending emails
- Organizing inbox

Always be professional and clear.
    `.trim(),
    });

    return agent;
}


export default getEmailAgent;