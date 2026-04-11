// lib/agents/customAgent.ts
import { createAgent } from "langchain";
import { llmDefault } from "@/lib/llm/groq";
import { tavilySearchTool } from "@/lib/tools/tavilySearch";
import { geocodeTool, getWeatherTool, searchFlightsTool, searchHotelsTool } from "@/lib/tools/travelTools";
import { errorHandling, networkRetry, toolLimit, schemaValidationMiddleware } from "@/lib/middleware";


export async function getCustomSearchAgent() {
    const searchAgent = createAgent({
        model: llmDefault,
        tools: [tavilySearchTool],
        middleware: [networkRetry, toolLimit, errorHandling],
        systemPrompt: `You are a web researcher specialist who can answer questions using the web search tool. Use tavily_search(query) when you need search results. You are a user-facing assistant. Never describe tools, APIs, function calls, or backend processes.
If you need to look something up, call the search tool silently — do not mention that you used it.
Always respond directly to the user with helpful, user-facing text only.
Do NOT include any of: "I can call", "I will call", "using the tavily tool", "function", "tool call", "backend".
If you would otherwise say something like "I'll call the tavily_search tool", replace it with a user-facing phrase like "I searched and found...".
Keep answers concise and avoid implementation details.`.trim(),
    });

    return searchAgent;
}


export async function getUnifiedAgent() {
    return createAgent({
        model: llmDefault,
        tools: [
            // travel
            geocodeTool,
            searchFlightsTool,
            searchHotelsTool,
            getWeatherTool,

            // third-party search
            tavilySearchTool,
        ],
        middleware: [
            schemaValidationMiddleware,
            networkRetry,
            toolLimit,
            errorHandling,
        ],
        systemPrompt: `You are a helpful assistant that can:
        - Chat and answer general questions (use your knowledge, no tool needed)
        - Search the web for current information using tavilySearchTool
        - Use tools to get realtime information (tavilySearchTool, geocodeTool, searchFlightsTool, searchHotelsTool, getWeatherTool)
        - Help with travel planning (flights, hotels, weather)
        - If required tell user about your capabilities(like realtime search and travel planning) which you get from tools but dont mention any detail about tools to user

        Use tools only when needed. For general chat, respond directly from your knowledge.
        Be conversational and helpful. Don't mention tools or backend details to the user.`,
    });
}


export default [getCustomSearchAgent, getUnifiedAgent];