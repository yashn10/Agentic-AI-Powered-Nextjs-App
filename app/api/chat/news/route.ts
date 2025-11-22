// app/api/chat/news/route.ts
import { NextResponse } from "next/server";
import { getNewsAgent } from "../../../../lib/agents/newsAgent";


export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return NextResponse.json({ error: "messages array required" }, { status: 400 });
        }

        const lastUser = (() => {
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i]?.role === "user") return messages[i];
            }
            return messages[messages.length - 1];
        })();

        const userQuery = String(lastUser?.content ?? "").trim();
        if (!userQuery) return NextResponse.json({ error: "empty query" }, { status: 400 });

        const agent = await getNewsAgent(userQuery);

        let result: any;
        try {
            result = await agent.invoke({
                messages: [{ role: "user", content: userQuery }],
            });
        } catch (err) {
            console.error("Agent execution error:", err);
            return NextResponse.json({ error: "agent execution failed", detail: String(err) }, { status: 500 });
        }

        // Extract JSON from last message
        let structuredResponse = { summary: "No news found", sentiment: "neutral" };
        try {
            const lastMessage = result.messages[result.messages.length - 1];
            if (lastMessage?.content) {
                // Find JSON in response (handle case where model adds extra text)
                const jsonMatch = lastMessage.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    structuredResponse = JSON.parse(jsonMatch[0]);
                }
            }
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
        }

        return NextResponse.json({
            assistant: structuredResponse.summary,
        });
    } catch (err) {
        console.error("news route error:", err);
        return NextResponse.json({ error: "internal server error", detail: String(err) }, { status: 500 });
    }
}