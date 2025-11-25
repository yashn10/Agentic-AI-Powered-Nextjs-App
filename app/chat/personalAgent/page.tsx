// app/create/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, ArrowLeft, Sparkles, Bot, Code, Mail, Check, Calendar, Search } from 'lucide-react';
import Link from 'next/link';

const tools = [
    { id: 'email', name: 'Email Integration', icon: Mail, color: 'indigo' },
    { id: 'web-search', name: 'Web Search', icon: Search, color: 'emerald' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'amber' },
    { id: 'code', name: 'Code Execution', icon: Code, color: 'rose' },
];

const createdAgents = [
    { id: 1, name: 'Daily News Digest', description: 'Curates personalized news briefs every morning', tools: ['web-search'], created: '2 days ago', status: 'active' },
    { id: 2, name: 'Travel Planner', description: 'Books trips and alerts for deals', tools: ['web-search', 'calendar'], created: '1 week ago', status: 'idle' },
    { id: 3, name: 'Code Reviewer', description: 'Reviews pull requests and suggests improvements', tools: ['code'], created: '3 weeks ago', status: 'active' },
];

export default function CreateAgentPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [systemPrompt, setSystemPrompt] = useState('');

    const handleToolToggle = (toolId: string) => {
        setSelectedTools(prev =>
            prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        // Add agent to history (simulate)
        createdAgents.unshift({
            id: Date.now(),
            name,
            description,
            tools: selectedTools,
            created: 'Just now',
            status: 'active',
        });
        setName('');
        setDescription('');
        setSelectedTools([]);
        setSystemPrompt('');
    };

    return (

        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50 antialiased">

            {/* Header - Clean and Modern */}
            <header className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Personal Agent</h1>
                    <div className="w-24" /> {/* Spacer */}
                </div>
            </header>


            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Create Form - Enhanced with Steps and Animations */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="lg:col-span-2 space-y-6"
                >
                    <Card className="border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                        <CardHeader className="pb-4 border-b border-gray-100">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                                <Sparkles className="h-6 w-6 text-indigo-600" />
                                Build Your Agent
                            </CardTitle>
                            <CardDescription className="text-gray-600 font-medium">Customize your AI companion with tools and prompts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleCreate} className="space-y-8">
                                <div className="space-y-3">
                                    <label htmlFor="name" className="text-sm font-semibold text-gray-700">Agent Name</label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., My Daily Assistant"
                                        className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e: any) => setDescription(e.target.value)}
                                        placeholder="What does this agent do?"
                                        className="min-h-[100px] rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Tools</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {tools.map((tool) => (
                                            <motion.div
                                                key={tool.id}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="relative"
                                            >
                                                <Button
                                                    type="button"
                                                    variant={selectedTools.includes(tool.id) ? 'default' : 'outline'}
                                                    className={`h-20 w-full rounded-2xl flex flex-col gap-2 items-center justify-center transition-all duration-300 ${selectedTools.includes(tool.id)
                                                        ? `bg-${tool.color}-500 text-white shadow-md hover:bg-${tool.color}-600`
                                                        : `border-gray-200 hover:border-${tool.color}-400 hover:text-${tool.color}-600`}`}
                                                    onClick={() => handleToolToggle(tool.id)}
                                                >
                                                    <tool.icon className="h-6 w-6" />
                                                    <span className="text-sm font-medium">{tool.name}</span>
                                                </Button>
                                                {selectedTools.includes(tool.id) && (
                                                    <Check className="absolute -top-2 -right-2 h-5 w-5 text-white bg-indigo-600 rounded-full p-0.5 shadow" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="prompt" className="text-sm font-semibold text-gray-700">System Prompt</label>
                                    <Textarea
                                        id="prompt"
                                        value={systemPrompt}
                                        onChange={(e: any) => setSystemPrompt(e.target.value)}
                                        placeholder="e.g., You are a helpful assistant that..."
                                        className="min-h-[140px] rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all"
                                    />
                                </div>

                                <Button type="submit" className="w-full h-12 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Agent
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* History - Stunning Card List with Hover Effects */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Created Agents</h2>
                        <Badge variant="outline" className="text-xs font-semibold border-gray-200">{createdAgents.length} total</Badge>
                    </div>

                    <AnimatePresence>
                        {createdAgents.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="group"
                            >
                                <Card className="border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20">
                                                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                                    {agent.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 ml-4">
                                                <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">{agent.name}</CardTitle>
                                                <CardDescription className="text-sm text-gray-600 font-medium leading-relaxed">{agent.description}</CardDescription>
                                            </div>
                                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className={`${agent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'} font-medium`}>
                                                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 px-6 pb-6">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {agent.tools.map((tool, j) => (
                                                <Badge key={j} variant="outline" className="text-xs font-medium capitalize border-gray-200 text-gray-700">
                                                    {tool.replace('-', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                                            <span>Created {agent.created}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-gray-100">
                                                    <Edit className="h-4 w-4 text-gray-600" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {createdAgents.length === 0 && (
                        <Card className="border border-gray-100 shadow-lg bg-white/80 backdrop-blur-xl rounded-3xl text-center py-16">
                            <Bot className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">No agents created yet</h3>
                            <p className="text-sm text-gray-600 mb-6 font-medium">Start by building your first personal agent above.</p>
                            <Button className="bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                                Create Your First Agent
                            </Button>
                        </Card>
                    )}
                </motion.div>

            </div>

        </div>

    );
}