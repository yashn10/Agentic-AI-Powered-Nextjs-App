// components/Logout.tsx
"use client";

import { useContext } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogPortal,
    DialogOverlay,
} from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import userContext from "@/components/userContext";
import { XCircle } from "lucide-react";

interface SigninProps {
    openoutDialogue: boolean;
    closeDialogue: (open: boolean) => void;
}

const Logout = ({ openoutDialogue, closeDialogue }: SigninProps) => {
    const router = useRouter();
    const { user, setUser } = useContext(userContext);

    const handleSignout = () => {
        // remove user and update context
        if (typeof window !== "undefined") {
            localStorage.removeItem("user");
        }
        setUser(null);
        closeDialogue(false); // close dialog
        router.push("/");
    };

    const handleCancel = () => {
        closeDialogue(false);
    };

    return (

        <Dialog open={openoutDialogue} onOpenChange={closeDialogue}>
            <DialogPortal>
                {/* Overlay */}
                <DialogOverlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />

                {/* Content (centered) */}
                <DialogContent
                    className={
                        "fixed z-50 left-1/2 top-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl " +
                        "p-6 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    }
                    aria-describedby="logout-description"
                >
                    <div className="flex flex-col items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-gray-900">
                                    Sign out of AgentForge?
                                </DialogTitle>
                                <DialogDescription id="logout-description" className="text-sm text-gray-600">
                                    You will be signed out and must sign in again to access your agents and settings.
                                </DialogDescription>
                            </div>
                        </div>
                        {/* optional: current user info */}
                        {user?.name && (
                            <div className="flex gap-2 w-100 text-sm">
                                <p className="font-medium text-gray-800">{user.name}</p>
                                {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="secondary" onClick={handleCancel} className="px-4 py-2 cursor-pointer">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleSignout} className="px-4 py-2 cursor-pointer">
                            Sign Out
                        </Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>

    );

};

export default Logout;
