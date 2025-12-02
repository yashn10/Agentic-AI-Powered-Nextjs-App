// app/api/tools/custom.ts
import axios from "axios";
import { tool } from "langchain";
import z from "zod";


export const tavilySearchTool = tool(
    async ({ query, maxResults = 5 }: { query: string; maxResults?: number }) => {
        try {
            const res = await axios.post("https://api.tavily.com/search", {
                api_key: process.env.TAVILY_API_KEY,
                query,
                max_results: maxResults,
                include_answer: true,
            });

            // Normalize to a concise string the agent can consume
            if (!res?.data) return `No results for "${query}"`;
            const items = (res.data.results || []).slice(0, maxResults);
            const summary = items.map((it: any, i: number) => `${i + 1}. ${it.title} — ${it.url}`).join("\n");
            return `Search results for "${query}":\n${summary || "No results found."}`;
        } catch (err: any) {
            console.error("[tavily_search] FULL ERROR:", {
                status: err?.response?.status,
                statusText: err?.response?.statusText,
                data: err?.response?.data,
                message: err?.message,
                toolCallArgs: { query, maxResults }
            });
            // Return friendly error string (do not throw) so agent can continue
            return `Tavily search failed for "${query}": ${String(err?.message || err)}`;
        }
    },
    {
        name: "tavily_search",
        description: "Run a Tavily search for news/web results. Args: { query, maxResults }",
        schema: z.object({
            query: z.string().describe("Search query"),
            maxResults: z.number().optional(),
        }),
    }
);