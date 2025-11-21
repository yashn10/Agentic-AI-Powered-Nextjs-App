// lib/agents/newsAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { tavilyTool, duckduckgoTool } from "@/app/api/tools/news";


const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    maxTokens: 1000,
});


let _agent: any = null;

export function getNewsAgent() {
    if (_agent) return _agent;

    _agent = createAgent({
        model: llm as any,
        tools: [tavilyTool, duckduckgoTool], // langchain will decide when to call which tool
        systemPrompt: `
You are NewsForge — an expert, concise real-time news curator.
When asked for current or factual information, DO NOT hallucinate.
Preferred tool order: tavily_search then duckduckgo_search.
Tools return JSON arrays of items. Use at most top 3 items and format answer as:
• Headline — Source (relative time)
→ 1-sentence summary

If tools return no results, reply: "No recent coverage found. Want a deep dive on any story?"
    `.trim(),
    });

    return _agent;
}


export default getNewsAgent;
