// app/api/chat/travel/route.ts
import { NextResponse } from "next/server";
import { getTravelAgent } from "@/lib/agents/travelAgent";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(req: Request) {
    try {
        // ✅ Check authentication
        // const session = await getServerSession(authOptions);
        // if (!session?.user) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

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

        console.log("[Travel Agent] User query:", userQuery);

        const agent = await getTravelAgent();

        let result: any;
        try {
            // ✅ FIXED: Pass ALL messages, not just the latest
            result = await agent.invoke({
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            });
        } catch (err) {
            console.error("[Travel Agent] Error:", err);
            return NextResponse.json(
                { error: "agent execution failed", detail: String(err) },
                { status: 500 }
            );
        }

        const response = result.messages[result.messages.length - 1]?.content || "No response";

        console.log("[Travel Agent] Response:", response.slice(0, 200));

        return NextResponse.json({
            assistant: response,
        });
    } catch (err) {
        console.error("[Travel Agent] Route error:", err);
        return NextResponse.json(
            { error: "internal server error", detail: String(err) },
            { status: 500 }
        );
    }
}