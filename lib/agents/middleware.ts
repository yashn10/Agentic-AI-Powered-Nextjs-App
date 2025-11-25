// lib/agents/middleware.ts
import { createMiddleware, toolCallLimitMiddleware, ToolMessage, toolRetryMiddleware } from "langchain";


export const errorHandling = createMiddleware({
    name: "APIErrorHandler",
    wrapToolCall: async (request, handler) => {
        try {
            return await handler(request);
        } catch (error: any) {
            const toolName = request.toolCall.name;
            const status = error.response?.status;
            const amadeusError = error.response?.data;

            // 👇 THIS IS KEY - Log everything
            console.error(`[${toolName}] FULL ERROR:`, {
                status,
                statusText: error.response?.statusText,
                amadeusError,
                requestConfig: {
                    url: error.config?.url,
                    params: error.config?.params,
                },
                toolCallArgs: request.toolCall.args,
            });

            let message = "";

            if (status === 400) {
                if (toolName === "search_flights") {
                    // Log the specific error from Amadeus
                    const amadeusDetail = amadeusError?.errors?.[0]?.detail;
                    console.error("[searchFlights] Amadeus error detail:", amadeusDetail);

                    message =
                        `Flight search failed (400 Bad Request).\n` +
                        `Amadeus response: ${amadeusDetail || amadeusError?.error_description || error.message}\n\n` +
                        `Check that:\n` +
                        `- From/To are airport codes (DEL, BOM, JFK, LHR) not city names\n` +
                        `- Departure date is in YYYY-MM-DD format (2024-12-10)\n` +
                        `- Departure date is in the future\n` +
                        `- Number of adults is a positive number`;
                } else if (toolName === "search_hotels") {
                    const amadeusDetail = amadeusError?.errors?.[0]?.detail;
                    console.error("[searchHotels] Amadeus error detail:", amadeusDetail);

                    message =
                        `Hotel search failed (400 Bad Request).\n` +
                        `Amadeus response: ${amadeusDetail || error.message}\n\n` +
                        `Check that:\n` +
                        `- City code is valid (DEL, BOM, NYC, LON, PAR)\n` +
                        `- Check-in and check-out are YYYY-MM-DD format\n` +
                        `- Check-in is before check-out\n` +
                        `- Check-out is at least 1 day after check-in`;
                }
            } else if (status === 401) {
                message = `Authentication failed (401): Invalid Amadeus API credentials.`;
            } else if (status === 429) {
                message = `Rate limited (429): Too many requests. Try again in a moment.`;
            } else if (status === 500) {
                message = `Server error (500): Amadeus service temporarily unavailable.`;
            } else {
                message = `Tool error (${status || "unknown"}): ${error.message}`;
            }

            return new ToolMessage({
                content: message,
                tool_call_id: request.toolCall.id!,
            });
        }
    },
});


export const networkRetry = toolRetryMiddleware({
    maxRetries: 2,
    retryOn: (err: Error) => {
        const code = (err as any)?.code;
        return ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(code);
    },
});


export const toolLimit = toolCallLimitMiddleware({
    runLimit: 5, // Max 10 tool calls per user query
    exitBehavior: "continue", // Continue with error message instead of throwing
});


export const schemaValidationMiddleware = createMiddleware({
    name: "SchemaValidation",
    wrapToolCall: async (request, handler) => {
        try {
            // Validate and fix parameter types
            const toolName = request.toolCall.name;
            const args = request.toolCall.args || {};

            // Fix search_flights parameters
            if (toolName === "search_flights") {
                if (args.adults && typeof args.adults === "string") {
                    args.adults = parseInt(args.adults, 10);
                }
                if (args.nonStop && typeof args.nonStop === "string") {
                    args.nonStop = args.nonStop.toLowerCase() === "true";
                }
            }

            // Fix search_hotels parameters
            if (toolName === "search_hotels") {
                if (args.adults && typeof args.adults === "string") {
                    args.adults = parseInt(args.adults, 10);
                }
            }

            // Update the tool call with corrected args
            request.toolCall.args = args;

            return await handler(request);
        } catch (error: any) {
            const toolName = request.toolCall.name;
            console.error(`[schemaValidation] Error in ${toolName}:`, error.message);

            return new ToolMessage({
                content: `Schema validation error: ${error.message}`,
                tool_call_id: request.toolCall.id!,
            });
        }
    },
});