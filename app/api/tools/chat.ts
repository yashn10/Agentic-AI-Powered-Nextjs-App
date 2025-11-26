// app/api/tools/chat.ts
import { ChatGroq } from "@langchain/groq";
import { tool } from "langchain";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL_4,
    temperature: 0.4,
    maxTokens: 3000
});


export const readChatTool = tool(
    async (input: any) => {
        try {

        } catch (err: any) {

        }
    },
    {
        name: "read_chat_tool",
        description: "Use this tool to read chat messages based on specific criteria.",
    }
);
