// app/api/tools/news.ts
import axios from "axios";
import { TavilySearch } from "@langchain/tavily";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";


// Create Tavily client - for direct API calls
export const tavilyClient = new TavilySearch({
    apiKey: process.env.TAVILY_API_KEY,
    maxResults: 6,
});


export const duckduckgoClient = new DuckDuckGoSearch({
    maxResults: 6,
});


export async function searchTavilyNews(query: string) {
    try {
        console.log("[Tavily] Searching for:", query);

        const response = await axios.post(
            "https://api.tavily.com/search",
            {
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                max_results: 5,
                include_answer: true,
            }
        );

        console.log("[Tavily] Found results:", response.data?.results?.length || 0);
        return response.data;
    } catch (err) {
        console.error("[Tavily] Search error:", err);
        throw err;
    }
}