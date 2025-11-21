// app/api/tools/news.ts
import * as z from "zod";
import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";



export const tavilyClient = new TavilySearch({
    apiKey: process.env.TAVILY_API_KEY ?? "",
    maxResults: 6,
});


export const duckduckgoClient = new DuckDuckGoSearch({
    maxResults: 6,
});


/** normalize item */
function normalizeItem(it: any) {
    return {
        title: (it?.title ?? it?.headline ?? it?.name ?? "").toString().slice(0, 300),
        summary: (it?.summary ?? it?.snippet ?? it?.description ?? it?.excerpt ?? it?.text ?? "").toString().slice(0, 800),
        url: (it?.url ?? it?.link ?? it?.href ?? "").toString(),
        publishedAt: (it?.publishedAt ?? it?.date ?? it?.time ?? "").toString(),
        source: (it?.source ?? "").toString(),
    };
}



function parseToolInput(input: any) {
    if (typeof input === "string") return { query: input, limit: 5 };
    if (!input) return { query: "", limit: 5 };
    // If input may be JSON stringified, try parse
    if (typeof input === "object") {
        return { query: String(input.query ?? input.q ?? input.prompt ?? ""), limit: input.limit ?? 5 };
    }
    try {
        const maybe = JSON.parse(String(input));
        return { query: String(maybe.query ?? maybe.q ?? maybe), limit: maybe.limit ?? 5 };
    } catch {
        return { query: String(input ?? ""), limit: 5 };
    }
}



async function tryInvokeWithBackoff(fn: () => Promise<any>, retries = 2, delayMs = 600) {
    let lastErr: any;
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (i < retries) await new Promise((res) => setTimeout(res, delayMs * (i + 1)));
        }
    }
    throw lastErr;
}



export const tavilyTool = tool(
    async (input: any) => {
        const { query, limit } = parseToolInput(input);
        if (!query) return JSON.stringify([]);
        try {
            // some versions use .invoke(), others .run(); using invoke() — adjust if needed.
            const raw = await tryInvokeWithBackoff(() => tavilyClient.invoke(query), 1, 300);
            const arr = Array.isArray(raw) ? raw.slice(0, limit) : [];
            const items = arr.map(normalizeItem);
            return JSON.stringify(items);
        } catch (err) {
            console.warn("Tavily tool error:", err);
            // Return empty array (string) — agent will interpret no results
            return JSON.stringify([]);
        }
    },
    {
        name: "tavily_search",
        description: "Search recent news with Tavily. Input: string or {query,limit}. Returns JSON array [{title,summary,url,publishedAt,source}].",
        schema: z.any(), // accept any to avoid strict schema mismatch; validation is done inside
    }
);



export const duckduckgoTool = tool(
    async (input: any) => {
        const { query, limit } = parseToolInput(input);
        if (!query) return JSON.stringify([]);
        try {
            const raw = await tryInvokeWithBackoff(() => duckduckgoClient.invoke(query), 2, 700);
            const arr = Array.isArray(raw) ? raw.slice(0, limit) : [];
            const items = arr.map(normalizeItem);
            return JSON.stringify(items);
        } catch (err) {
            console.warn("DuckDuckGo tool error:", err);
            return JSON.stringify([]);
        }
    },
    {
        name: "duckduckgo_search",
        description: "Fallback search via DuckDuckGo. Input: string or {query,limit}. Returns JSON array like tavily.",
        schema: z.any(),
    }
);
