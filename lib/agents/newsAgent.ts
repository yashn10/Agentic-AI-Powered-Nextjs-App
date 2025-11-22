// lib/agents/newsAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { searchTavilyNews } from "@/app/api/tools/news";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.2,
    maxTokens: 1000,
});


export async function getNewsAgent(userQuery: string) {
    let newsContent = "No recent coverage found.";

    try {
        const response = await searchTavilyNews(userQuery);

        if (response?.results && Array.isArray(response.results) && response.results.length > 0) {
            const newsItems = response.results.slice(0, 3);
            newsContent = newsItems
                .map((item: any) => {
                    const title = item.title || "Untitled";
                    const snippet = item.snippet || item.description || "No description";
                    const source = item.source || "Unknown";
                    return `• **${title}** (${source})\n  ${snippet}`;
                })
                .join("\n\n");
        }
    } catch (err) {
        console.error("[newsAgent] News fetch error:", err);
    }

    // Create agent with news already loaded
    const agent = createAgent({
        model: llm,
        tools: [],  // No tools - news is pre-fetched
        systemPrompt: `
You are NewsForge — an expert AI news analyst.

Analyze the following news data and respond with ONLY valid JSON (no other text):
{
  "summary": "2-3 sentence summary of the key points",
  "sentiment": "positive or negative or neutral"
}

Rules:
- Respond with ONLY the JSON object
- No markdown, explanations, or extra text
- Sentiment must be: positive, negative, or neutral

News data:
${newsContent}
        `.trim(),
    });

    return agent;
}


export default getNewsAgent;