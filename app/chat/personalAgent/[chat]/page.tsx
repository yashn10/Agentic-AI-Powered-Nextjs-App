// app/chat/[agentId]/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Toaster, toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Send, Copy, RefreshCw, Sparkles, ArrowLeft, Settings, Mic } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { agentStorage } from '@/lib/services/agentStorage';
import router from 'next/router';
import axios from 'axios';


type NewsSource = {
    title: string;
    url: string;
    source: string;
};

type ChatMsg = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: number;
    metadata?: {
        sentiment?: string;
        sources?: NewsSource[];
    };
};

export default function ChatPage() {

    const params = useParams();
    const messagesRef = useRef<ChatMsg[]>([]);
    const [agent, setAgent] = useState<any>(null);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const id = params.chat;
        if (typeof id === 'string') {
            fetchAgent(id);
        }
    }, [params]);

    useEffect(() => { messagesRef.current = messages; }, [messages]);

    const fetchAgent = (agentId: string) => {
        try {
            const data = agentStorage.getAgentById(agentId);
            setAgent(data);
            console.log(agent);
        } catch (error) {
            console.error("error fetching agent", error);
        }
    }

    const copyToClipboard = async (text: string) => {
        if (!text) return toast.error('Nothing to copy');
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                toast.success('Copied to clipboard!');
            } catch {
                toast.error('Unable to copy');
            }
        } else {
            toast.error('Clipboard not available');
        }
    };

    function parseAgentResult(agentResp: any) {
        // 1) Prefer structuredResponse if present
        if (agentResp?.structuredResponse) {
            return {
                text: typeof agentResp.structuredResponse === "string"
                    ? agentResp.structuredResponse
                    : JSON.stringify(agentResp.structuredResponse),
                metadata: agentResp.structuredResponse
            };
        }

        // 2) If agentResp.messages is an array of serialized messages (LangChain), find last AIMessage
        const msgs = Array.isArray(agentResp?.messages) ? agentResp.messages : [];
        // Try to find the last message whose constructor id indicates AIMessage
        for (let i = msgs.length - 1; i >= 0; i--) {
            const m = msgs[i];
            try {
                // Two common shapes:
                // - { type: "constructor", id: ["langchain_core","messages","AIMessage"], kwargs: { content: "..." } }
                // - newer/other shapes might include role/content directly
                const isAI = Array.isArray(m?.id) && m.id[2] && m.id[2].toLowerCase().includes("aimessage");
                if (isAI && m?.kwargs?.content) {
                    return { text: String(m.kwargs.content), metadata: m.kwargs };
                }
                // fallback: some messages may embed content under 'content'
                if (m?.kwargs?.content) {
                    return { text: String(m.kwargs.content), metadata: m.kwargs };
                }
                if (m?.content && typeof m.content === "string") {
                    return { text: m.content, metadata: m };
                }
            } catch (e) {
                /* ignore and continue */
            }
        }

        // 3) If nothing found, try agentResp itself as string
        if (typeof agentResp === "string") {
            return { text: agentResp, metadata: null };
        }

        // 4) Final fallback
        return { text: "No response", metadata: null };
    }

    const sendMessage = async (e: any) => {
        e.preventDefault();
        const text = input?.trim();
        if (!text) return toast.error("Nothing to send");

        // Build user message
        const userMsg: ChatMsg = {
            id: `u-${Date.now()}`,
            role: "user",
            content: text,
            createdAt: Date.now(),
        };

        // Optimistically update UI and ref
        const next = [...messagesRef.current, userMsg];
        setMessages(next);
        messagesRef.current = next;

        // Clear input & set loading
        setInput("");
        setIsLoading(true);

        try {
            // Send full conversation (including the new user message)
            const payload = { agent, messages: next };

            const response = await axios.post("/api/chat/personalAgent", payload);

            const parsed = parseAgentResult(response.data);
            const assistantText = parsed.text ?? "No response";

            const assistantMsg: ChatMsg = {
                id: `a-${Date.now()}`,
                role: "assistant",
                content: assistantText,
                createdAt: Date.now(),
                metadata: {
                    // Example: some agents return sentiment/sources in metadata or structuredResponse
                    sentiment: parsed.metadata?.sentiment ?? undefined,
                    sources: parsed.metadata?.sources ?? undefined
                },
            };

            // Append assistant reply
            const updated = [...messagesRef.current, assistantMsg];
            setMessages(updated);
            messagesRef.current = updated;

            toast.success("Response received!");
        } catch (err) {
            console.error("sendMessage error", err);
            toast.error("Network or server error");
        } finally {
            setIsLoading(false);
        }
    };

    const reload = () => {
        // simple reload: clear conversation (you may prefer to refetch)
        setMessages([]);
        toast.success('Conversation cleared');
    };


    return (

        <div className="flex h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">

            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl">
                <div className="p-5 border-b border-slate-100">
                    <Button variant="ghost" className="w-full justify-start text-slate-600" asChild>
                        <Link href="/dashboard">
                            <div className="flex items-center w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </div>
                        </Link>
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                        {/* {Object.entries(agentConfig).map(([id, cfg]) => (
                            <Button
                                key={id}
                                variant={id === agentId ? 'default' : 'ghost'}
                                className={`w-full justify-start font-medium h-14 rounded-md transition-all ${id === agentId
                                    ? `bg-linear-to-r ${cfg.gradient} text-white shadow-xl hover:shadow-2xl`
                                    : 'hover:bg-slate-100'
                                    }`}
                                asChild
                            >
                                <Link href={`/chat/${id}`}>
                                    <div className="flex items-center w-55">
                                        <span className="mr-3 text-2xl">{cfg.icon}</span>
                                        <span className="truncate">{cfg.name}</span>
                                        {id === agentId && <Badge className="ml-auto">Active</Badge>}
                                    </div>
                                </Link>
                            </Button>
                        ))} */}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Chat */}
            <div className="flex flex-1 flex-col">

                {/* Header */}
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 py-3">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <div className="flex items-center gap-4">
                                <div
                                    className={`h-12 w-12 rounded-md bg-linear-to-br bg-amber-500 flex items-center justify-center text-white text-3xl shadow-2xl`}
                                >
                                    ✈️
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900">{agent?.name}</h1>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${agent?.status === "active" ? 'bg-amber-500' : 'bg-red-400'} bg-amber-500 animate-pulse`} />
                                        <span className="flex gap-2 text-sm font-medium text-amber-600">
                                            <span className={`${agent?.status === "active" ? 'text-amber-600' : 'text-red-400'}`}>{agent?.status === "active" ? 'Active' : 'Inactive'}</span>
                                            {agent?.status === "active" ? (
                                                <span>• Ultra-fast response</span>
                                            ) : (
                                                <span className='text-red-400'>• Under development</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className='cursor-pointer' onClick={() => reload()}>
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className='cursor-pointer' aria-label="Agent settings">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <ScrollArea className="flex-1 px-6">
                    <div className="max-w-4xl mx-auto py-8 space-y-8 h-[65vh]">
                        <div>
                            {/* Initial Greeting */}
                            {messages.length === 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                                    <div
                                        className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br bg-amber-500 text-white text-5xl mb-6 shadow-2xl`}
                                    >
                                        {agent?.name[0]}
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                                        Hey! I'm your <span className={`bg-linear-to-r bg-amber-500 bg-clip-text text-transparent`}>{agent?.name}</span>
                                    </h2>
                                    <p className="text-lg text-slate-600">Instruction - {agent?.description}</p>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={msg.id ?? idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <Avatar className="h-8 w-8 ring-4 ring-white shadow-xl shrink-0">
                                                <AvatarFallback className={`bg-linear-to-br bg-amber-500 text-white font-bold text-md`}>
                                                    🤖
                                                </AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                            {msg.role === 'assistant' ? (
                                                <>
                                                    <Card className="bg-white/90 backdrop-blur border-0 shadow-md overflow-hidden">
                                                        <div className="px-6">
                                                            <div className="space-y-3">
                                                                {msg.content.split('\n').map((line, i) => {
                                                                    const trimmed = line.trim();
                                                                    if (!trimmed) return null;
                                                                    return (
                                                                        <p key={`${msg.id}-p-${i}`} className="text-slate-700 text-base">
                                                                            {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
                                                                        </p>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </>
                                            ) : (
                                                // User message
                                                <div className="inline-block">
                                                    <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-md px-6 py-3 shadow-xl">
                                                        <p className="text-md font-medium">{msg.content}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        {new Date(msg.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {msg.role === 'user' && (
                                            <Avatar className="h-8 w-8 ring-4 ring-white shadow-xl shrink-0">
                                                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                                    🎙️
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                    <Avatar className="h-11 w-11">
                                        <AvatarFallback className={`bg-linear-to-br bg-amber-500 text-white`}>A</AvatarFallback>
                                    </Avatar>
                                    <Card className="bg-white/90 backdrop-blur border-0 shadow-lg px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            <span className="ml-3 text-sm text-slate-600 font-medium">{agent?.name.split(' ')[0]} is thinking...</span>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-slate-200 bg-white/80 backdrop-blur-xl px-6 py-5">
                    <div className="max-w-5xl mx-auto">
                        <form onSubmit={sendMessage} className="flex items-end gap-2" style={{ alignItems: "center" }}>

                            <div className="flex-1 relative">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Ask ${agent?.name} anything...`}
                                    className={`h-12 rounded-md border-slate-300 bg-slate-50/70 pr-14 text-lg placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${agent?.status === 'active' ? '' : 'pointer-events-none opacity-50'}`}
                                    aria-label="Message"
                                />

                                <Button type="button" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Voice input">
                                    <Mic className="h-5 w-5 text-slate-500" />
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                className={`rounded-md h-12 px-8 font-bold text-white shadow-xl transition-all ${isLoading ? 'bg-slate-400' : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:shadow-2xl'} ${agent?.status === 'active' ? '' : 'disabled:opacity-50 disabled:cursor-not-allowed'}`}
                                aria-label="Send message"
                            >
                                {isLoading ? <Spinner className="h-5 w-5" /> : <>Send <Send className="ml-1 h-5 w-5" /></>}
                            </Button>

                        </form>

                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-4">
                                <span>Shift + Enter for new line</span>
                                <Separator orientation="vertical" className="h-4" />
                                <span>Press ↑ to edit last message</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">Powered by Grok-4 + Tavily</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <Toaster position="top-right" richColors closeButton />

        </div>

    );
}
