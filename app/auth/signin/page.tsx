// app/auth/signin/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignIn() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
            <Card className="p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
                <Button
                    onClick={() =>
                        signIn("google", {
                            redirect: true,
                            callbackUrl: "/dashboard",
                        })
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                    Sign in with Google
                </Button>
            </Card>
        </div>
    );
}