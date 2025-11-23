// app/api/chat/email/route.ts
import { NextResponse } from "next/server";
import { getEmailAgent } from "@/lib/agents/emailAgent";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(req: Request) {
    try {
        // ✅ Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Check Gmail token exists
        const gmailToken = (session.user as any)?.gmailToken;
        if (!gmailToken?.access_token) {
            return NextResponse.json(
                { error: "Gmail not connected. Please sign in with Google." },
                { status: 401 }
            );
        }

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

        console.log("[Email Agent] User query:", userQuery);

        const agent = await getEmailAgent();

        let result: any;
        try {
            result = await agent.invoke({
                messages: [{ role: "user", content: userQuery }],
            });
        } catch (err) {
            console.error("[Email Agent] Error:", err);
            return NextResponse.json(
                { error: "agent execution failed", detail: String(err) },
                { status: 500 }
            );
        }

        const response = result.messages[result.messages.length - 1]?.content || "No response";

        return NextResponse.json({
            assistant: response,
        });
    } catch (err) {
        console.error("[Email Agent] Route error:", err);
        return NextResponse.json(
            { error: "internal server error", detail: String(err) },
            { status: 500 }
        );
    }
}