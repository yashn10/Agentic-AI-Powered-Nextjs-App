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
    { id: 'email', name: 'Email Integration', icon: Mail },
    { id: 'web-search', name: 'Web Search', icon: Search },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'code', name: 'Code Execution', icon: Code },
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

        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Create Personal Agent</h1>
                    <div className="w-24" /> {/* Spacer */}
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                                Build Your Agent
                            </CardTitle>
                            <CardDescription className="text-slate-600">Customize your AI companion with tools and prompts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    {/* <Label htmlFor="name" className="text-sm font-medium text-slate-700">Agent Name</Label> */}
                                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Agent Name</label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., My Daily Assistant"
                                        className="h-12 rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {/* <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label> */}
                                    <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e: any) => setDescription(e.target.value)}
                                        placeholder="What does this agent do?"
                                        className="min-h-[100px] rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {/* <Label className="text-sm font-medium text-slate-700">Tools</Label> */}
                                    <label className="text-sm font-medium text-slate-700">Tools</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {tools.map((tool) => (
                                            <motion.div
                                                key={tool.id}
                                                whileHover={{ scale: 1.02 }}
                                                className="relative"
                                            >
                                                <Button
                                                    type="button"
                                                    variant={selectedTools.includes(tool.id) ? 'default' : 'outline'}
                                                    className={`h-16 w-full rounded-xl flex flex-col gap-2 ${selectedTools.includes(tool.id) ? 'bg-indigo-500 text-white shadow-md' : 'border-slate-300 hover:border-indigo-400'}`}
                                                    onClick={() => handleToolToggle(tool.id)}
                                                >
                                                    <tool.icon className="h-5 w-5" />
                                                    <span className="text-xs font-medium">{tool.name}</span>
                                                </Button>
                                                {selectedTools.includes(tool.id) && (
                                                    <Check className="absolute -top-1 -right-1 h-4 w-4 text-white bg-indigo-600 rounded-full" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {/* <Label htmlFor="prompt" className="text-sm font-medium text-slate-700">System Prompt</Label> */}
                                    <label htmlFor="prompt" className="text-sm font-medium text-slate-700">System Prompt</label>
                                    <Textarea
                                        id="prompt"
                                        value={systemPrompt}
                                        onChange={(e: any) => setSystemPrompt(e.target.value)}
                                        placeholder="e.g., You are a helpful assistant that..."
                                        className="min-h-[120px] rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <Button type="submit" className="w-full h-12 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Agent
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900">Your Created Agents</h2>
                        <Badge variant="outline" className="text-xs">5 total</Badge>
                    </div>

                    <AnimatePresence>
                        {createdAgents.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="group"
                            >
                                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                                    B
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 ml-3">
                                                <CardTitle className="text-base font-semibold text-slate-900">{agent.name}</CardTitle>
                                                <CardDescription className="text-sm text-slate-600">{agent.description}</CardDescription>
                                            </div>
                                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                                                {agent.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {agent.tools.map((tool, j) => (
                                                <Badge key={j} variant="outline" className="text-xs capitalize">
                                                    {tool}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>Created {agent.created}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-600 hover:text-red-700">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {createdAgents.length === 0 && (
                        <Card className="border-slate-200 text-center py-12">
                            <Bot className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No agents created yet</h3>
                            <p className="text-sm text-slate-600 mb-6">Start by building your first personal agent above.</p>
                            <Button className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
                                Create Your First Agent
                            </Button>
                        </Card>
                    )}
                </motion.div>
            </div>

        </div>

    );
}