// app/api/chat/chat/route.ts
import { NextResponse } from "next/server";
import { getChatAgent } from "@/lib/agents/chatAgent";


export async function POST(req: Request) {
    const body = await req.json();

    const messages = body.messages ? body.messages : [];

    const agent = await getChatAgent();

    let result: any;
    try {
        result = await agent.invoke({
            messages: messages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
        });
    } catch (error) {
        console.error("Error invoking chat agent:", error);
        return NextResponse.json(
            { error: "agent execution failed", detail: String(error) },
            { status: 500 }
        );
    }

    const response =
        result.messages[result.messages.length - 1]?.content || "No response";

    console.log("[Chat Agent] Response:", response.slice(0, 200));

    return NextResponse.json({
        assistant: response,
    });
}