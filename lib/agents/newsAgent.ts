// lib/agents/newsAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { searchTavilyNews } from "@/app/api/tools/news";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL_2,
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
                newsItems = response.results.slice(0, 5).map((item: any) => ({
                    title: item.title || "Untitled",
                    url: item.url || "",
                    source: item.source || new URL(item.url).hostname,
                    description: item.content || item.snippet || item.description || "No description",
                    content: item.content || ""  // Store full content for details
                }));
                newsContent = newsItems
                    .map((item, idx) =>
                        `${idx + 1}. **${item.title}** (${item.source})\n${item.description}\n`
                    )
                    .join("\n\n");
            }
        } catch (err) {
            console.error("[newsAgent] News fetch error:", err);
            newsContent = "Failed to fetch news. Please try again.";
        }
    }

    const agent = createAgent({
        model: llm,
        tools: [], // Keep empty - no tools needed for analysis
        systemPrompt: `
You are NewsForge — a professional news analyst.

**MANDATORY: Analyze conversation history and user intent, then respond in EXACT format below.**

**INTENT DETECTION** (check LAST user message + conversation context):
SUMMARY REQUESTS (respond with type: "summary"):
- "top news", "latest", "headlines", "today's news", "what's happening"
- First message about news topics

DETAILED REQUESTS (respond with type: "detailed"):  
- "tell me more", "explain", "details", "in depth", "background", "why", "how"
- References specific articles: "#1", "#2", "IndiGo", "Putin", etc.
- Follow-up questions about news topics

**RESPONSE FORMAT - ALWAYS use this EXACT structure:**

Summary requests:
{
  "type": "summary",
  "data": {
    "summary": "3-5 sentences covering main stories",
    "sentiment": "positive|negative|neutral", 
    "sources": [{"title": "...", "url": "...", "source": "..."}]
  }
}

Detail requests:
{
  "type": "detailed", 
  "content": "Detailed explanation/analysis (3-8 paragraphs)"
}

**RULES:**
1. NO OTHER TEXT - ONLY valid JSON object above
2. Check conversation HISTORY for context/follow-ups  
3. Use news articles below for all analysis
4. Sources must include title/url/source for ALL articles referenced

Available news articles:
${newsContent}
`.trim(),
    });

    // Store full news context for conversation
    (agent as any).__newsContext = { newsItems, newsContent };
    (agent as any).__conversationState = "initial";

    return agent;
}


export default getNewsAgent;