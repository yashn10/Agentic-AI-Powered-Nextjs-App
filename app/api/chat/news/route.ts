// app/api/chat/news/route.ts
import { NextResponse } from "next/server";
import { getNewsAgent } from "../../../../lib/agents/newsAgent";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return NextResponse.json({ error: "messages array required" }, { status: 400 });
        }

        const lastUser = messages[messages.length - 1];
        const userQuery = String(lastUser?.content ?? "").trim();

        // ✅ PASS FULL CONVERSATION HISTORY
        const agent = await getNewsAgent(userQuery);

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

        const lastMessage = result.messages[result.messages.length - 1];
        let response = lastMessage?.content || "No response";

        // ✅ Detect JSON vs detailed response
        const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                response = {
                    type: "summary",
                    data: parsed
                };
            } catch (e) {
                // Not valid JSON, treat as text
            }
        } else {
            response = {
                type: "detailed",
                content: response
            };
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