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
import { Send, Mic, Copy, RefreshCw, Sparkles, ArrowLeft, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';


const agentConfig: Record<string, any> = {
  chatbot: { name: 'Conversational Chat Agent', icon: '💬', gradient: 'from-indigo-400 to-sky-500', description: 'Engages in natural conversation, answers questions, and routes to tools when needed (search, web, or domain-specific tools). Designed for chat-first interactions and multi-turn assistance.', active: true },
  email: { name: 'Email Mastery Agent', icon: '✉️', gradient: 'from-indigo-400 to-purple-500', description: 'Helps you draft, organize, and manage your emails efficiently.', active: false },
  travel: { name: 'Live Travel Orchestrator', icon: '✈️', gradient: 'from-emerald-400 to-teal-500', description: 'Assists in planning trips, booking flights, and finding accommodations.', active: true },
  news: { name: 'Intelligent News Curator', icon: '📰', gradient: 'from-amber-400 to-orange-500', description: 'Summarizes news articles and provides sentiment analysis.', active: true },
  interview: { name: 'Live Interview Coach', icon: '🎙️', gradient: 'from-rose-400 to-pink-500', description: 'Prepares you for interviews with practice questions and feedback.', active: true },
  personalAgent: { name: 'Personal AI Agent', icon: '🤖', gradient: 'from-green-400 to-lime-500', description: 'Creates a customized AI agent tailored to your personal needs.', active: true },
};

type NewsSource = {
  title: string;
  url: string;
  source: string;
};

type NewsResponse = {
  type: 'summary' | 'detailed';
  data?: {
    summary: string;
    sentiment: string;
    sources: NewsSource[];
  };
  content?: string;
};

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: number;
  metadata?: {
    sentiment?: string;
    sources?: NewsSource[];
    newsResponse?: NewsResponse;  // ✅ NEW: Store full response
  };
};

export default function ChatPage() {
  const params = useParams();
  const agentId = (params && (params as { agentId?: string }).agentId) ?? 'email';
  const router = useRouter();
  const config = agentConfig[agentId] ?? agentConfig.email;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false); // current UI mode: voice vs write
  const [preferredVoice, setPreferredVoice] = useState<boolean>(() => {
    try {
      return localStorage.getItem('preferredVoice') === 'true';
    } catch {
      return false;
    }
  });
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<any | null>(null);

  // scroll container ref
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMsg[]>([]);

  // put this where your other useEffect declarations are
  useEffect(() => {
    // apply preferred voice mode on mount
    if (agentId === 'interview' && preferredVoice) setIsVoiceMode(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    // Proper onresult: rebuild transcript every time from event.results
    rec.onresult = (event: any) => {
      try {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const t = res[0]?.transcript ?? '';
          if (res.isFinal) {
            finalTranscript += t;
          } else {
            interimTranscript += t;
          }
        }

        // Show the concatenation of finalized text + current interim
        setTranscript((finalTranscript + interimTranscript).trimStart());
      } catch (e) {
        console.error('onresult parse error', e);
      }
    };

    rec.onerror = (e: any) => {
      console.error('SpeechRecognition error', e);
      toast.error('Speech recognition error');
      setIsRecording(false);
    };

    rec.onend = () => {
      // If we expect to still be recording, try to restart (works around some browser silence stopping)
      if (isRecording) {
        try {
          rec.start();
        } catch (e) {
          // ignore start errors
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.stop();
      } catch { }
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  useEffect(() => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    } catch (err) {
      // ignore
    }
  }, [messages.length]);

  const startRecording = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }
    try {
      setTranscript(''); // clear previous transcript
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (e) {
      console.error('startRecording error', e);
      toast.error('Unable to start microphone. Check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {
      console.warn('stopRecording error', e);
    } finally {
      setIsRecording(false);
    }
  };

  // Toggle voice preference persistently
  const togglePreferredVoice = () => {
    const next = !preferredVoice;
    setPreferredVoice(next);
    try {
      localStorage.setItem('preferredVoice', next ? 'true' : 'false');
    } catch { }
    if (agentId === 'interview') {
      setIsVoiceMode(next);
    }
  };

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

  function parseInterviewResponse(content: string) {
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return {
            type: "questions",
            data: parsed,
            text: content.replace(jsonMatch[0], "").trim(),
          };
        }
      }

      // Try to extract JSON object (for plans)
      const objMatch = content.match(/\{\s*"[^"]*"[\s\S]*?\n\}/);
      if (objMatch) {
        const parsed = JSON.parse(objMatch[0]);
        return {
          type: "plan",
          data: parsed,
          text: content.replace(objMatch[0], "").trim(),
        };
      }

      return { type: "text", data: content, text: content };
    } catch (e) {
      return { type: "text", data: content, text: content };
    }
  }

  // send user message -> call API -> append assistant response
  const sendMessage = async (text?: string) => {

    const useText = (() => {
      if (agentId === 'interview' && isVoiceMode) {
        // prefer transcript if available, else fall back to typed input
        return (transcript && transcript.trim()) ? transcript.trim() : (text ?? input).trim();
      }
      return (text ?? input).trim();
    })();

    if (!useText) return toast.error('Nothing to send');

    // If currently recording, stop first and then send
    if (isRecording) {
      stopRecording();
    }

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: useText,
      createdAt: Date.now(),
    };

    setMessages((s) => {
      const next = [...s, userMsg];
      messagesRef.current = next;
      return next;
    });
    setInput("");
    setTranscript('');
    setIsLoading(true);

    try {
      // ✅ FIXED: Send ALL messages from conversation history
      const payloadMessages = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      console.log(`[Chat] Sending ${payloadMessages.length} messages to agent`);

      const res = await fetch(`/api/chat/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),  // ✅ Full history
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("API error", res.status, txt);
        toast.error("Server error: " + res.status);
        setIsLoading(false);
        return;
      }

      const json = await res.json();

      let assistantMsg: ChatMsg;

      if (agentId === 'news' && json.assistant) {
        const assistant = json.assistant;
        const isSummary = assistant.data.type === 'summary';

        assistantMsg = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: isSummary
            ? (assistant.data?.data.summary || assistant.data.data.content || "No summary available")
            : (assistant.data.content || "No response"),
          createdAt: Date.now(),
          metadata: isSummary ? {
            newsResponse: assistant,
            sentiment: assistant.data?.data.sentiment,
            sources: assistant.data?.data.sources
          } : {
            newsResponse: assistant  // Still store for detailed view
          }
        };
      } else if (agentId === 'interview') {
        // IMPORTANT: keep full raw assistant string for parsing/rendering
        assistantMsg = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: typeof json.assistant === 'string' ? json.assistant : (json.assistant?.summary || ""),
          createdAt: Date.now(),
        };
      } else {
        assistantMsg = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: typeof json.assistant === 'string' ? json.assistant : (json.assistant?.summary || "No response"),
          createdAt: Date.now()
        };
      }

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

  // ✅ Render news messages with sentiment and sources
  const renderNewsMessage = (msg: ChatMsg) => {
    const newsResponse = msg.metadata?.newsResponse;

    // ✅ IMPROVED: Check for explanation keywords OR short content
    const lastUserMsg = messages[messages.length - 2]?.content?.toLowerCase() || '';
    const isExplanationRequest = lastUserMsg.includes('explain') ||
      lastUserMsg.includes('tell me more') ||
      lastUserMsg.includes('details') ||
      lastUserMsg.includes('why') ||
      lastUserMsg.includes('how') ||
      msg.content.length < 200; // Short responses likely need expansion

    const forceDetailed = isExplanationRequest;

    const sentiment = newsResponse?.data?.sentiment || msg.metadata?.sentiment || "neutral";
    const sources = newsResponse?.data?.sources || msg.metadata?.sources || [];
    const summaryText = newsResponse?.data?.summary || msg.content;

    if (forceDetailed) {
      // ✅ Show detailed view for explanation requests
      return (
        <Card className="bg-white/90 backdrop-blur border-0 shadow-md overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-lg bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  Detailed Analysis
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(msg.content)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="prose prose-lg max-w-none text-slate-800">
              {msg.content.split('\n').filter(line => line.trim()).map((line, i) => (
                <p key={i} className="mb-3 leading-relaxed">{line}</p>
              ))}
            </div>

            {/* Show sources in detailed view too */}
            {sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-amber-200">
                <h5 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                  📚 References
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {sources.map((source: NewsSource, idx: number) => (
                    <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 text-sm">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{source.title}</span>
                      <span className="text-xs text-amber-600">→ {source.source}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      );
    }

    // Summary view (default)
    const sentimentColors: Record<string, string> = {
      positive: 'bg-green-100 text-green-800 border-green-200',
      negative: 'bg-red-100 text-red-800 border-red-200',
      neutral: 'bg-slate-100 text-slate-800 border-slate-200'
    };

    return (
      <Card className="bg-white/90 backdrop-blur border-0 shadow-md overflow-hidden">
        <div className="px-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 mb-1">📰 News Summary</h3>
              <Badge className={`px-3 py-1 ${sentimentColors[sentiment]}`}>
                {sentiment.toUpperCase()} {sentimentColors[sentiment].includes('green') ? '📈' : sentimentColors[sentiment].includes('red') ? '📉' : '➡️'}
              </Badge>
            </div>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(summaryText || '')} className='cursor-pointer'>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6 p-4 bg-linear-to-r from-slate-50 to-indigo-50 rounded-xl">
            <p className="text-slate-800 leading-relaxed text-base">{summaryText}</p>
          </div>

          {sources.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                📚 Sources ({sources.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {sources.map((source: NewsSource, idx: number) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xl shrink-0 mt-0.5 text-indigo-500">🔗</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors line-clamp-2 leading-tight">
                          {source.title}
                        </p>
                        <p className="text-xs text-slate-500 font-medium truncate mt-1 bg-slate-100/50 px-2 py-0.5 rounded-full inline-block group-hover:bg-indigo-100">
                          {source.source}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0 mt-0.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // ✅ Render default messages for other agents
  const renderDefaultMessage = (msg: ChatMsg) => {
    return (
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
    );
  };

  // ✅ Add a render function for interview JSON outputs
  function renderInterviewMessage(msg: ChatMsg) {
    const parsed = parseInterviewResponse(msg.content);

    return (
      <Card className="bg-white/90 backdrop-blur border-0 shadow-md overflow-hidden">
        <div className="px-6">
          {/* {parsed.text ? <p className="text-slate-700 mb-4">{parsed.text}</p> : null} */}

          {parsed.type === "questions" && Array.isArray(parsed.data) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-3">Practice Questions</h3>
              {parsed.data.map((q: any, idx: number) => (
                <div key={idx} className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-slate-900 mb-2">Q{idx + 1}. {q.question}</p>
                  <p className="text-sm text-slate-700"><strong>Suggested Answer:</strong> {q.suggested_answer}</p>
                </div>
              ))}
            </div>
          )}

          {parsed.type === "plan" && parsed.data && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-3">{parsed.data.title || "Study Plan"}</h3>
              {Array.isArray(parsed.data.days) && parsed.data.days.map((day: any, idx: number) => (
                <div key={idx} className="p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="font-medium text-slate-900">Day {day.day}: {day.topic}</p>
                  {Array.isArray(day.tasks) && (
                    <ul className="text-sm text-slate-700 mt-2 space-y-1">
                      {day.tasks.map((task: string, t: number) => <li key={t}>• {task}</li>)}
                    </ul>
                  )}
                  {day.practice && <p className="text-sm text-slate-700 mt-2"><strong>Practice:</strong> {day.practice}</p>}
                </div>
              ))}
            </div>
          )}

          {/* fallback - raw text */}
          {parsed.type === "text" && (
            <div className="prose prose-lg max-w-none">
              {parsed.data.split('\n').map((line: string, i: number) => <p key={i} className="text-slate-700">{line}</p>)}
            </div>
          )}

          <div className="mt-4">
            <Button size="sm" variant="ghost" className='cursor-pointer' onClick={() => copyToClipboard(msg.content)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

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
                  className={`h-12 w-12 rounded-md bg-linear-to-br ${config.gradient} flex items-center justify-center text-white text-3xl shadow-2xl`}
                >
                  {config.icon}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{config.name}</h1>
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${config.active ? 'bg-emerald-500' : 'bg-red-400'} bg-emerald-500 animate-pulse`} />
                    <span className="flex gap-2 text-sm font-medium text-emerald-600">
                      <span className={`${config.active ? 'text-emerald-600' : 'text-red-400'}`}>{config.active === true ? 'Active' : 'Inactive'}</span>
                      {config.active ? (
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
            <div ref={scrollRef}>
              {/* Initial Greeting */}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                  <div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br ${config.gradient} text-white text-5xl mb-6 shadow-2xl`}
                  >
                    {config.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">
                    Hey! I'm your <span className={`bg-linear-to-r ${config.gradient} bg-clip-text text-transparent`}>{config.name}</span>
                  </h2>
                  <p className="text-lg text-slate-600">{config.description}</p>
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
                        <AvatarFallback className={`bg-linear-to-br ${config.gradient} text-white font-bold text-md`}>
                          {config.icon}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.role === 'assistant' ? (
                        agentId === 'news' ? (
                          renderNewsMessage(msg)
                        ) : agentId === 'interview' ? (
                          renderInterviewMessage(msg)
                        ) : (
                          renderDefaultMessage(msg)
                        )
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
                          A
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
              <div className="flex items-center gap-2">
                {/* Only show the toggle for interview agent */}
                {agentId === 'interview' && (
                  <>
                    <div className="inline-flex items-center gap-2 mr-2">
                      <button
                        type="button"
                        onClick={() => setIsVoiceMode(false)}
                        className={`px-3 py-1 rounded-md ${!isVoiceMode ? 'bg-slate-200' : 'bg-transparent'} text-sm cursor-pointer`}
                        aria-pressed={!isVoiceMode}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVoiceMode(true)}
                        className={`px-3 py-1 rounded-md ${isVoiceMode ? 'bg-indigo-600 text-white' : 'bg-transparent'} text-sm cursor-pointer`}
                        aria-pressed={isVoiceMode}
                      >
                        Voice
                      </button>
                      <button
                        type="button"
                        onClick={togglePreferredVoice}
                        className={`ml-2 px-2 py-1 rounded-md text-xs ${preferredVoice ? 'bg-amber-100 text-amber-800' : 'bg-slate-100'} cursor-pointer`}
                        title="Toggle prefer voice mode (persisted)"
                      >
                        {preferredVoice ? 'Preferred' : 'Prefer'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* <Button variant="ghost" size="icon" className="shrink-0" type="button" aria-label="Attach file">
                <Paperclip className="h-5 w-5" />
              </Button> */}

              <div className="flex-1 relative">
                {isVoiceMode && agentId === 'interview' ? (
                  // Voice mode shows transcript area (editable)
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={`Speak now or type — press Send to submit.`}
                    className="h-12 w-full rounded-md border-slate-300 bg-slate-50/70 pr-14 text-sm placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 p-4 resize-none"
                    aria-label="Voice transcript"
                  />
                ) : (
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${config.name} anything...`}
                    className={`h-12 rounded-md border-slate-300 bg-slate-50/70 pr-14 text-lg placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${config.active ? '' : 'pointer-events-none opacity-50'}`}
                    aria-label="Message"
                  />
                )}

                {/* Voice controls: show mic / stop when in voice mode */}
                {agentId === 'interview' && isVoiceMode ? (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isRecording) stopRecording();
                        else startRecording();
                      }}
                      className={`p-2 rounded-full shadow-md ${isRecording ? 'bg-red-500 text-white' : 'bg-white'}`}
                      aria-pressed={isRecording}
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Button type="button" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Voice input" onClick={() => {
                    // quick toggle to voice if user wants it
                    if (agentId === 'interview') {
                      setIsVoiceMode(true);
                    }
                  }}>
                    <Mic className="h-5 w-5 text-slate-500" />
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || (agentId === 'interview' && isVoiceMode && !transcript.trim() && !input.trim()) || (!(input && input.trim()) && !(agentId === 'interview' && transcript.trim()))}
                className={`rounded-md h-12 px-8 font-bold text-white shadow-xl transition-all ${isLoading ? 'bg-slate-400' : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:shadow-2xl'}`}
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
