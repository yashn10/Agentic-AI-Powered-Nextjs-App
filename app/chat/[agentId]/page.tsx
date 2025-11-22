// app/chat/[agentId]/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Toaster, toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import {
  Send,
  Paperclip,
  Mic,
  Copy,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const agentConfig: Record<string, any> = {
  email: { name: 'Email Mastery Agent', icon: '✉️', gradient: 'from-indigo-400 to-purple-500' },
  travel: { name: 'Live Travel Orchestrator', icon: '✈️', gradient: 'from-emerald-400 to-teal-500' },
  news: { name: 'Intelligent News Curator', icon: '📰', gradient: 'from-amber-400 to-orange-500' },
  interview: { name: 'Live Interview Coach', icon: '🎙️', gradient: 'from-rose-400 to-pink-500' },
};

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: number;
};

export default function ChatPage() {
  const params = useParams();
  const agentId = (params && (params as { agentId?: string }).agentId) ?? 'email';
  const router = useRouter();
  const config = agentConfig[agentId] ?? agentConfig.email;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // scroll container ref
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMsg[]>([]);

  useEffect(() => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    } catch (err) {
      // ignore
    }
  }, [messages.length]);

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

  // send user message -> call API -> append assistant response
  const sendMessage = async (text: string) => {
    if (!text || !text.trim()) return;

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      createdAt: Date.now(),
    };

    // optimistic update
    setMessages((s) => {
      const next = [...s, userMsg];
      messagesRef.current = next; // keep ref in sync immediately
      return next;
    });
    setInput("");
    setIsLoading(true);

    try {
      // read the up-to-date messages from the ref
      const payloadMessages = [
        ...messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text.trim() },
      ];

      const res = await fetch(`/api/chat/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("API error", res.status, txt);
        toast.error("Server error: " + res.status);
        setIsLoading(false);
        return;
      }

      const json = await res.json();
      console.log("API response:", json);

      const assistantMsg: ChatMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: json.assistant,
        createdAt: Date.now()
      };

      // append assistant
      setMessages((s) => {
        const next = [...s, assistantMsg];
        messagesRef.current = next;
        return next;
      });

      toast.success("Response received!");
    } catch (err) {
      console.error("sendMessage error", err);
      toast.error("Network or server error");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    // append using current input
    sendMessage(input);
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
            {Object.entries(agentConfig).map(([id, cfg]) => (
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
            ))}
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
                  className={`h-14 w-14 rounded-xl bg-linear-to-br ${config.gradient} flex items-center justify-center text-white text-3xl shadow-2xl`}
                >
                  {config.icon}
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">{config.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-600">Active • Ultra-fast response</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => reload()}>
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Agent settings">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="max-w-4xl mx-auto py-8 space-y-8 h-[65vh]">
            <div ref={scrollRef}>
              {/* Initial Greeting */}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                  <div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br ${config.gradient} text-white text-5xl mb-6 shadow-2xl`}
                  >
                    {config.icon}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3">
                    Hey! I'm your <span className={`bg-linear-to-r ${config.gradient} bg-clip-text text-transparent`}>{config.name}</span>
                  </h2>
                  <p className="text-lg text-slate-600">Ask me anything — I’m ready to help.</p>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id ?? idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="h-11 w-11 ring-4 ring-white shadow-xl">
                        <AvatarFallback className={`bg-linear-to-br ${config.gradient} text-white font-bold text-lg`}>{config.icon}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.role === 'assistant' ? (
                        <Card className="bg-white/90 backdrop-blur border-0 shadow-xl overflow-hidden">
                          <div className="p-6">
                            <div className="prose prose-lg max-w-none">
                              {msg.content.split('\n').map((line, i) => {
                                const trimmed = line.trim();
                                const bulletMatch = trimmed.match(/^•\s*\*\*(.+?)\*\*\s*–\s*(.+?)(?:→\s*(.*))?$/);
                                if (bulletMatch) {
                                  const headline = bulletMatch[1].trim();
                                  const source = bulletMatch[2].trim();
                                  const summary = (bulletMatch[3] ?? '').trim();
                                  return (
                                    <div key={`${msg.id}-b-${i}`} className="mb-6 p-5 bg-linear-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                                      <div className="flex items-start justify-between">
                                        <h4 className="font-bold text-lg text-slate-900">{headline}</h4>
                                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${headline} – ${source}`)}>
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <p className="text-sm text-slate-600 mt-2">{source}</p>
                                      {summary && <p className="text-slate-700 mt-3 font-medium">{summary}</p>}
                                    </div>
                                  );
                                }
                                return (
                                  <p key={`${msg.id}-p-${i}`} className="text-slate-700">{trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                                );
                              })}
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <div className="inline-block">
                          <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-3xl px-6 py-4 shadow-xl">
                            <p className="text-lg font-medium">{msg.content}</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(msg.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <Avatar className="h-11 w-11 ring-4 ring-white shadow-xl">
                        <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold">A</AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className={`bg-linear-to-br ${config.gradient} text-white`}>{config.icon}</AvatarFallback>
                  </Avatar>
                  <Card className="bg-white/90 backdrop-blur border-0 shadow-lg px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-3 text-sm text-slate-600 font-medium">{config.name.split(' ')[0]} is thinking...</span>
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
            <form onSubmit={onSubmit} className="flex items-end gap-2" style={{ alignItems: "center" }}>
              <Button variant="ghost" size="icon" className="shrink-0" type="button" aria-label="Attach file">
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${config.name} anything...`}
                  className="h-12 rounded-3xl border-slate-300 bg-slate-50/70 pr-14 text-lg placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                  aria-label="Message"
                />
                <Button type="button" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Voice input">
                  <Mic className="h-5 w-5 text-slate-500" />
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !(input && input.trim())}
                className={`rounded-3xl h-12 px-8 font-bold text-white shadow-xl transition-all ${isLoading ? 'bg-slate-400' : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:shadow-2xl'}`}
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

      <Toaster position="top-center" richColors closeButton />

    </div>

  );
}
