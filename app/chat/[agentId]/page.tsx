// app/chat/[agentId]/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Copy,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const agentConfig: Record<string, any> = {
  email: { name: 'Email Mastery Agent', color: 'indigo', icon: '📧', linear: 'from-indigo-500 to-purple-600' },
  travel: { name: 'Live Travel Orchestrator', color: 'emerald', icon: '✈️', linear: 'from-emerald-500 to-teal-600' },
  news: { name: 'Intelligent News Curator', color: 'amber', icon: '📰', linear: 'from-amber-500 to-orange-600' },
  interview: { name: 'Live Interview Coach', color: 'rose', icon: '🎤', linear: 'from-rose-500 to-pink-600' },
};

export default function ChatPage() {
  const { agentId } = useParams();
  const router = useRouter();
  const config = agentConfig[agentId as string] || agentConfig.email;

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hey Alex! I'm your **${config.name}**, fully active and ready to crush it for you today.\n\nWhat would you like me to handle first?`,
      timestamp: new Date(),
      status: 'delivered',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    // setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        role: 'assistant',
        content: getSmartResponse(input, config.name),
        timestamp: new Date(),
        status: 'delivered',
      }]);
      setIsTyping(false);
      toast.success("Response has been created.")
    }, 1500 + Math.random() * 2000);
  };

  const getSmartResponse = (userInput: string, agentName: string) => {
    const responses: Record<string, string> = {
      email: "Got it — I scanned your inbox. You have **7 urgent emails** (3 from clients, 2 invoices, 1 from mom 😂).\n\nI've already drafted replies for the top 3. Want me to send them now or tweak first?",
      travel: "I'm on it! Searching 400+ airlines and hidden deals right now...\n\nFound a **$487 round-trip to Tokyo** on JAL (normally $1,270) — premium economy, great dates.\n\nShall I lock the price alert + build full itinerary (hotels, rail pass, pocket WiFi)?",
      news: "Your 8:00 AM briefing is ready:\n\n**Top 3 today:**\n• OpenAI just released o3-mini-high — 60% cheaper than o3\n• Elon confirmed Grok 4 benchmark leak (beats Gemini 2.5 Pro)\n• xAI raised $6B at $50B valuation\n\nWant deep dive on any?",
      interview: "Ready when you are, boss.\n\nToday's session: **System Design — Design Twitter at Scale**\n\nI'll play the Meta L6 interviewer. You can speak or type.\n\nWhenever you're ready, introduce yourself and we'll begin.",
      default: "I'm fully activated and standing by. Tell me exactly what you need — no limits today.",
    };

    const lower = userInput.toLowerCase();
    if (lower.includes('email') || lower.includes('inbox')) return responses.email;
    if (lower.includes('travel') || lower.includes('trip') || lower.includes('flight')) return responses.travel;
    if (lower.includes('news') || lower.includes('briefing')) return responses.news;
    if (lower.includes('interview') || lower.includes('practice')) return responses.interview;
    return responses.default;
  };

  return (

    <div className="flex h-screen bg-slate-50/50">

      {/* Left Sidebar - Same collapsible as dashboard */}
      <aside className="hidden lg:flex lg:w-64 flex-col border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-100">
          <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {Object.entries(agentConfig).map(([id, cfg]) => (
              <Button
                key={id}
                variant={id === agentId ? "default" : "ghost"}
                className={`w-full justify-start font-medium ${id === agentId
                  ? `bg-linear-to-r ${cfg.linear} text-white hover:opacity-90`
                  : 'text-slate-700 hover:bg-slate-100'
                  }`}
                asChild
              >
                <Link href={`/chat/${id}`}>
                  <span className="mr-3 text-lg">{cfg.icon}</span>
                  {cfg.name}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">

        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-md bg-linear-to-br ${config.linear} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {config.icon}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{config.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-slate-500">Active • Responding in 2s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-6" ref={scrollAreaRef}>
          <div className="mx-auto max-w-4xl space-y-6 h-[60vh] overflow-y-auto">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={`bg-linear-to-br ${config.linear} text-white font-bold`}>
                        {config.icon}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-2xl space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block rounded-3xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                        ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                    >
                      <div className="prose prose-sm max-w-none text-inherit">
                        {msg.content.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('**') ? 'font-bold' : ''}>
                            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {msg.role === 'user' && (
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-500 text-white font-bold">
                        A
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`bg-linear-to-br ${config.linear} text-white`}>
                    {config.icon}
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-3xl bg-white border border-slate-200 px-5 py-3.5 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white px-4 py-5">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-slate-500 hover:text-slate-700"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={`Message ${config.name}...`}
                  className="h-12 rounded-3xl border-slate-300 bg-slate-50/70 pr-12 text-base focus-visible:ring-indigo-500/30"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5 text-slate-500" />}
                </Button>
              </div>

              <Button
                onClick={handleSend}
                disabled={!input.trim() && !isRecording}
                className="rounded-3xl bg-linear-to-r from-indigo-600 to-purple-600 px-6 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isTyping ?
                  <Spinner />
                  : (
                    <>
                      {isRecording ? 'Stop & Send' : 'Send'}
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>Shift + Enter for new line</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Voice input active</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Powered by Grok-4 + o3-mini</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Toaster position="top-center" closeButton={false} richColors={true} toastOptions={{ duration: 5000 }} />

    </div>

  );

}