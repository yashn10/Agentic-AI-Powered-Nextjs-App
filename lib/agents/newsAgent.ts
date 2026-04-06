// lib/agents/newsAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { searchTavilyNews } from "@/app/api/tools/news";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL_3,
    temperature: 0.2,
    maxTokens: 1000,
});


function isNewsQuery(query: string): boolean {
    const newsKeywords = [
        "news", "latest", "today", "breaking", "current", "headline", "update",
        "report", "story", "coverage", "happening", "events", "developments",
        "top", "trending", "what's happening", "what is happening"
    ];

    const lowerQuery = query.toLowerCase();
    return newsKeywords.some(keyword => lowerQuery.includes(keyword));
}


interface NewsItem {
    title: string;
    url: string;
    source: string;
    description: string;
}


export async function getNewsAgent(userQuery: string) {
    let newsContent = "No recent coverage found.";
    let newsItems: NewsItem[] = [];
    let isValidNewsQuery = isNewsQuery(userQuery);

    if (!isValidNewsQuery) {
        newsContent = "User query is not about news. Cannot provide news analysis.";
    } else {
        try {
            const response = await searchTavilyNews(userQuery);

            if (response?.results && Array.isArray(response.results) && response.results.length > 0) {
                const results = response.results.slice(0, 3);

                // ✅ Store news items with URLs for later use
                newsItems = results.map((item: any) => {
                    const title = item.title || "Untitled";
                    const description = item.content ||
                        item.snippet ||
                        item.description ||
                        "No description";
                    const url = item.url || "";
                    const source = item.source ||
                        (url ? new URL(url).hostname : "Unknown");

                    return { title, url, source, description };
                });

                // Format for LLM
                newsContent = newsItems
                    .map((item, idx) =>
                        `${idx + 1}. **${item.title}** (${item.source})\n   ${item.description}\n   Source: ${item.url}`
                    )
                    .join("\n\n");

            }
        } catch (err) {
            console.error("[newsAgent] News fetch error:", err);
            newsContent = "Failed to fetch news. Please try again.";
        }
    }

    // Create agent with news already loaded
    const agent = createAgent({
        model: llm,
        tools: [],
        systemPrompt: `
You are NewsForge — an expert AI news analyst.

Your task: Analyze the provided news data and respond with ONLY valid JSON.

IMPORTANT: 
- If the news data looks empty or generic, respond with the suggestion format
- Otherwise, analyze and summarize the key news points
- Include source URLs in your analysis

Respond with ONLY valid JSON in this format (no other text):
{
  "summary": "5-10 sentence summary of the key news points",
  "sentiment": "positive or negative or neutral",
  "sources": [
    {
      "title": "Article title",
      "url": "https://example.com",
      "source": "example.com"
    }
  ]
}

Rules:
- Respond with ONLY the JSON object, no markdown or explanations
- Summary should be 5-10 sentences, clear and informative
- Sentiment must be: positive, negative, or neutral
- Include 5-10 most relevant sources from the news data
- Each source must have title, url, and source fields

News data to analyze:
${newsContent}
        `.trim(),
    });

    // ✅ Attach news items to agent for later retrieval
    (agent as any).__newsItems = newsItems;

    return agent;
}


export default getNewsAgent;