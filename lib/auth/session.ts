// lib/auth/session.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUserGmailToken() {
    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error("Not authenticated");
    }

    const gmailToken = (session.user as any)?.gmailToken;

    if (!gmailToken?.access_token) {
        throw new Error("Gmail not connected");
    }

    return gmailToken;
}

export async function getSession() {
    return await getServerSession(authOptions);
}