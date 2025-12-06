// app/api/chat/interview/route.ts
import { NextResponse } from "next/server";
import { getInterviewAgent } from "@/lib/agents/interviewAgent";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return NextResponse.json(
                { error: "messages array required" },
                { status: 400 }
            );
        }

        const lastUser = messages[messages.length - 1];
        const userQuery = String(lastUser?.content ?? "").trim();

        if (!userQuery) {
            return NextResponse.json({ error: "empty query" }, { status: 400 });
        }

        console.log("[Interview Agent] User query:", userQuery);
        console.log("[Interview Agent] Conversation history:", messages.length, "messages");

        const agent = await getInterviewAgent();

        let result: any;
        try {
            // ✅ FIXED: Pass ALL messages for conversation continuity
            result = await agent.invoke({
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            });
        } catch (err) {
            console.error("[Interview Agent] Error:", err);
            return NextResponse.json(
                { error: "agent execution failed", detail: String(err) },
                { status: 500 }
            );
        }

        const response =
            result.messages[result.messages.length - 1]?.content || "No response";

        console.log("[Interview Agent] Response:", response.slice(0, 200));

        return NextResponse.json({
            assistant: response,
        });
    } catch (err) {
        console.error("[Interview Agent] Route error:", err);
        return NextResponse.json(
            { error: "internal server error", detail: String(err) },
            { status: 500 }
        );
    }
}