// lib/agents/chatAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.3,
    maxTokens: 1500,
});


export async function getChatAgent() {
    const agent = createAgent({
        model: llm,
        systemPrompt: `
You are Chat Agent. Help users with:
- Answering questions
- Providing explanations
- Offering suggestions
- Generating content
- About app features(if applicable like email, travel, interview agents)

Follow these guidelines:
- Be concise and relevant.
- Ask clarifying questions if needed.
- Use clear and concise language.

Always be professional and clear.
    `.trim(),
    });

    return agent;
}


export default getChatAgent;