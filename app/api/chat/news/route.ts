// app/api/chat/news/route.ts
import { NextResponse } from "next/server";
import { getNewsAgent } from "@/lib/agents/newsAgent";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return NextResponse.json({ error: "messages array required" }, { status: 400 });
        }

        const lastUser = messages[messages.length - 1];
        const userQuery = String(lastUser?.content ?? "").trim();

        if (!userQuery) {
            return NextResponse.json({ error: "empty query" }, { status: 400 });
        }

        // Agent now has its own search tool — no need to pre-fetch news
        const agent = await getNewsAgent();

        let result: any;
        try {
            result = await agent.invoke({
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            });
        } catch (err) {
            console.error("[News Agent] Error:", err);
            return NextResponse.json(
                { error: "agent execution failed", detail: String(err) },
                { status: 500 }
            );
        }

        // Extract JSON from last message
        let structuredResponse = {
            summary: "Unable to process your request",
            sentiment: "neutral",
            sources: []
        };

        try {
            const lastMessage = result.messages[result.messages.length - 1];

            if (lastMessage?.content) {
                // Find JSON in response
                const jsonMatch = lastMessage.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    structuredResponse = {
                        summary: parsed.summary || "No summary available",
                        sentiment: parsed.sentiment || "neutral",
                        sources: Array.isArray(parsed.sources) ? parsed.sources : []
                    };
                }
            }
        } catch (parseErr) {
            console.error("[API] JSON parse error:", parseErr);
        }

        return NextResponse.json({
            assistant: response,
        });

    } catch (err) {
        console.error("[News Agent] Route error:", err);
        return NextResponse.json(
            { error: "internal server error", detail: String(err) },
            { status: 500 }
        );
    }
}