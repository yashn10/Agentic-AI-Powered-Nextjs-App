// app/auth/signin/page.tsx
"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import userContext from "@/components/userContext";


interface SigninProps {
    openDialogue: boolean;
    closeDialogue: (open: boolean) => void;
}

const Signin = ({ openDialogue, closeDialogue }: SigninProps) => {

    const router = useRouter();
    const { user, setUser } = useContext(userContext);


    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse: any) => {
            const userInfo = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                { headers: { Authorization: 'Bearer ' + tokenResponse.access_token, Accept: 'application/json' } },
            );

            console.log(userInfo);
            const data = userInfo?.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(data));
            }

            // update context
            setUser(data);
            closeDialogue(true);
            router.push('/dashboard');
        },
        onError: errorResponse => console.log(errorResponse),
    });

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
                        "fixed z-50 left-1/2 top-1/2 max-w-lg w-[90%] bg-gray-50 rounded-xl shadow-xl " +
                        "transform -translate-x-1/2 -translate-y-1/2 p-6"
                    }
                >
                    <div className="p-2 gap-6 flex flex-col">
                        <DialogPrimitive.Title className="text-center text-lg font-semibold">Please sign in to continue</DialogPrimitive.Title>
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