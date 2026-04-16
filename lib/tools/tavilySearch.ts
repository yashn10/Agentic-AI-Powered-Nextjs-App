// lib/tools/tavilySearch.ts — Unified Tavily search tools
import axios from "axios";
import { tool } from "langchain";
import z from "zod";


/**
 * General web search tool — used by Chat Agent, Custom Agent
 */
export const tavilySearchTool = tool(
    async ({ query }: { query: string }) => {
        try {
            const res = await axios.post("https://api.tavily.com/search", {
                api_key: process.env.TAVILY_API_KEY,
                query,
                max_results: 5,
                include_answer: true,
            });

            if (!res?.data) return `No results for "${query}"`;

            const items = (res.data.results || []).slice(0, 5);
            const summary = items
                .map((it: any, i: number) => `${i + 1}. ${it.title} — ${it.url}`)
                .join("\n");

            return `Search results for "${query}":\n${summary || "No results found."}`;
        } catch (err: any) {
            console.error("[tavily_search] Error:", err?.message);
            return `Search failed for "${query}": ${String(err?.message || err)}`;
        }
    },
    {
        name: "tavily_search",
        description: "Search the web for current information, facts, or answers to questions. Use this when users ask about recent events, need factual information, or want to look something up.",
        schema: z.object({
            query: z.string().describe("Search query"),
        }),
    }
);


/**
 * News-specific search tool — used by News Agent
 * Uses Tavily's advanced search depth for better news results
 */
export const tavilyNewsSearchTool = tool(
    async ({ query }: { query: string }) => {
        try {
            const res = await axios.post("https://api.tavily.com/search", {
                api_key: process.env.TAVILY_API_KEY,
                query,
                max_results: 5,
                include_answer: true,
                search_depth: "advanced",
            });

            if (!res?.data?.results || res.data.results.length === 0) {
                return JSON.stringify({
                    results: [],
                    message: `No news found for "${query}"`,
                });
            }

            const results = res.data.results.slice(0, 5).map((item: any) => ({
                title: item.title || "Untitled",
                url: item.url || "",
                source: item.source || (item.url ? new URL(item.url).hostname : "Unknown"),
                description: item.content || item.snippet || item.description || "No description",
            }));

            return JSON.stringify({ results, count: results.length });
        } catch (err: any) {
            console.error("[tavily_news_search] Error:", err?.message);
            return JSON.stringify({
                results: [],
                error: `News search failed: ${err?.message || err}`,
            });
        }
    },
    {
        name: "tavily_news_search",
        description: "Search for the latest news articles on any topic. Returns news headlines, descriptions, sources, and URLs. Use this for any query about current events, breaking news, recent developments, or trending stories.",
        schema: z.object({
            query: z.string().describe("News search query (e.g., 'AI developments', 'Ukraine conflict', 'stock market today')"),
        }),
    }
);
