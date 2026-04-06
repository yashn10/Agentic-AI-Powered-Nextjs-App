// app/auth/signin/page.tsx
"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import userContext from "@/components/userContext";
import { toast } from "sonner";


interface SigninProps {
    openDialogue: boolean;
    closeDialogue: (open: boolean) => void;
}

const Signin = ({ openDialogue, closeDialogue }: SigninProps) => {

    const router = useRouter();
    const { user, setUser } = useContext(userContext);


    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse: any) => {
            try {
                console.log("[Google Login] Authorization code received");

                const backendResponse = await axios.post('/api/auth', {
                    code: tokenResponse.code,
                });

                const { access_token, refresh_token, expiry_date } = backendResponse.data;

                console.log("[Google Login] Tokens received:", {
                    access_token: access_token ? "✓ Yes" : "✗ No",
                    refresh_token: refresh_token ? "✓ Yes" : "✗ No",
                });

                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            Accept: 'application/json'
                        }
                    },
                );

                const userData = userInfo?.data;

                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify({
                        data: userData,
                        tokenResponse: {
                            access_token,
                            refresh_token,
                            expiry_date,
                        }
                    }));
                }

                setUser(userData);
                toast.success("Signed in successfully!");
                closeDialogue(true);
                router.push('/dashboard');
            } catch (err) {
                console.error("[Google Login] Error:", err);
                toast.error("Failed to complete sign in");
            }
        },
        onError: (errorResponse: any) => {
            console.error("[Google Login] Error:", errorResponse);
            toast.error("Failed to sign in with Google");
        },
        auth_type: "reauthenticate", // Optional: Force reauth
        prompt: "consent",
        scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send openid email profile",
    } as any);


    return (

        <DialogPrimitive.Root open={openDialogue} onOpenChange={closeDialogue}>
            <DialogPrimitive.Portal>
                {/* overlay/backdrop */}
                <DialogPrimitive.Overlay
                    className="fixed inset-0 bg-black/60 z-50"
                />
                {/* content centered in viewport */}
                <DialogPrimitive.Content
                    className={
                        "fixed z-50 left-1/2 top-1/2 max-w-lg w-[90%] bg-white rounded-xl shadow-xl " +
                        "transform -translate-x-1/2 -translate-y-1/2 p-6"
                    }
                >
                    <div className="p-2 gap-6 flex flex-col">
                        <div className="flex items-center">
                            <img src="/images/login.png" className="w-15" alt="Login" />
                            <DialogPrimitive.Title className="w-90 text-center text-lg font-semibold">Please sign in to continue</DialogPrimitive.Title>
                        </div>
                        <DialogPrimitive.Description className="text-center text-sm text-gray-600">
                            To use this feature you need to be signed in with your Google account.
                        </DialogPrimitive.Description>

                        <div className="mt-4 flex justify-center">
                            <Button variant="outline" className="w-1/3 cursor-pointer" onClick={() => googleLogin()}>
                                Sign in with Google
                            </Button>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

    )
}

export default Signin