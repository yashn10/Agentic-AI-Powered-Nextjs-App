// app/chat/personalAgent/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    Sparkles,
    Bot,
    Code,
    Mail,
    Check,
    Calendar,
    Search,
    Loader,
    AlertCircle,
    Copy,
} from 'lucide-react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import { agentStorage } from '@/lib/services/agentStorage';
import { Agent, AgentType, CreateAgentInput } from '@/lib/types/agent';


const AGENT_TYPES = [
    { id: 'search' as AgentType, name: 'Web Search', icon: Search, color: 'emerald', description: 'Search the web for information' },
    { id: 'travel' as AgentType, name: 'Travel', icon: Calendar, color: 'amber', description: 'Plan trips and book accommodations' },
    { id: 'chat' as AgentType, name: 'Chat', icon: Mail, color: 'indigo', description: 'General conversation and assistance' },
];

const TOOLS = [
    { id: 'email', name: 'Email Integration', icon: Mail, color: 'indigo' },
    { id: 'web-search', name: 'Web Search', icon: Search, color: 'emerald' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'amber' },
    { id: 'code', name: 'Code Execution', icon: Code, color: 'rose' },
];

export default function CreateAgentPage() {
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [selectedAgentTypes, setSelectedAgentTypes] = useState<AgentType[]>([]);
    const [systemPrompt, setSystemPrompt] = useState('');

    // UI state
    const [createdAgents, setCreatedAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Load agents on mount
    useEffect(() => {
        try {
            const agents = agentStorage.getAllAgents();
            setCreatedAgents(agents);
        } catch (err) {
            toast.error('Failed to load agents');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Toggle agent type
    const handleAgentTypeToggle = (typeId: AgentType) => {
        setSelectedAgentTypes(prev => prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]);
    };

    // Toggle tool
    const handleToolToggle = (toolId: string) => {
        setSelectedTools(prev => prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]);
    };

    // Create or update agent
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!name.trim()) {
            toast.error('Agent name is required');
            setIsSubmitting(false);
            return;
        }
        if (selectedAgentTypes.length === 0) {
            toast.error('Please select at least one agent type');
            setIsSubmitting(false);
            return;
        }

        const input: CreateAgentInput = {
            name: name.trim(),
            description: description.trim(),
            systemPrompt: systemPrompt.trim(),
            agentTypes: selectedAgentTypes,
            tools: selectedTools,
        };

        try {
            if (editingId) {
                const updated = agentStorage.updateAgent(editingId, input);
                if (updated) {
                    toast.success('Agent updated');
                } else {
                    toast.error('Failed to update agent');
                }
            } else {
                const created = agentStorage.createAgent(input);
                if (created) {
                    toast.success('Agent created');
                } else {
                    toast.error('Failed to create agent');
                }
            }
            setCreatedAgents(agentStorage.getAllAgents());
            resetForm();
        } catch (err: any) {
            toast.error(err?.message || 'Save failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setName('');
        setDescription('');
        setSelectedTools([]);
        setSelectedAgentTypes([]);
        setSystemPrompt('');
        setEditingId(null);
    };

    // Edit handler
    const handleEdit = (agent: Agent) => {
        setName(agent.name);
        setDescription(agent.description || '');
        setSelectedTools(agent.tools || []);
        setSelectedAgentTypes(agent.agentTypes || []);
        setSystemPrompt(agent.systemPrompt || '');
        setEditingId(String(agent.id));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info('Edit mode enabled');
    };

    // Cancel edit
    const handleCancelEdit = () => {
        resetForm();
        toast.info('Edit cancelled');
    };

    // Delete handler (receives id string)
    const handleDelete = (id: string | null) => {
        if (!id) return;
        try {
            const ok = agentStorage.deleteAgent(id);
            if (ok) {
                setCreatedAgents(agentStorage.getAllAgents());
                toast.success('Agent deleted');
            } else {
                toast.error('Delete failed');
            }
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    // Toggle active/idle
    const handleToggleStatus = (id: string) => {
        try {
            const updated = agentStorage.toggleAgentStatus(id);
            if (updated) {
                setCreatedAgents(agentStorage.getAllAgents());
                toast.success(`Agent ${updated.status === 'active' ? 'activated' : 'deactivated'}`);
            } else {
                toast.error('Failed to update status');
            }
        } catch {
            toast.error('Failed to update status');
        }
    };

    // Duplicate agent
    const handleDuplicate = (agent: Agent) => {
        try {
            agentStorage.createAgent({
                name: `${agent.name} (Copy)`,
                description: agent.description,
                systemPrompt: agent.systemPrompt,
                agentTypes: agent.agentTypes,
                tools: agent.tools,
            });
            setCreatedAgents(agentStorage.getAllAgents());
            toast.success('Agent duplicated');
        } catch {
            toast.error('Duplicate failed');
        }
    };

    // Copy agent config
    const handleCopyConfig = (agent: Agent) => {
        try {
            const text = JSON.stringify(agent, null, 2);
            navigator.clipboard.writeText(text);
            setCopiedId(String(agent.id));
            toast.success('Agent configuration copied');
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error('Copy failed');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-indigo-50">
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading agents...</p>
                </div>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50 antialiased">

            {/* Header */}
            <header className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {editingId ? 'Edit Agent' : 'Create Personal Agent'}
                    </h1>
                    <div className="w-24" />
                </div>
            </header>


            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Create Form */}
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="lg:col-span-2 space-y-6">
                    <Card className="border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                        <CardHeader className="pb-4 border-b border-gray-100">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                                <Sparkles className="h-6 w-6 text-indigo-600" />
                                Build Your Agent
                            </CardTitle>
                            <CardDescription className="text-gray-600 font-medium">Customize your AI companion with tools and prompts.</CardDescription>
                        </CardHeader>

                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label htmlFor="name" className="text-sm font-semibold text-gray-700">Agent Name</label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My Daily Assistant" className="h-12 rounded-md border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all" />
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</label>
                                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this agent do?" className="min-h-[100px] rounded-md border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Agent Types</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {AGENT_TYPES.map(type => (
                                            <Button key={type.id} type="button" variant={selectedAgentTypes.includes(type.id) ? 'default' : 'outline'} onClick={() => handleAgentTypeToggle(type.id)} className="h-20 rounded-xl flex items-center justify-center gap-3">
                                                <type.icon className="h-5 w-5" />
                                                <div className="text-left">
                                                    <div className="text-sm font-semibold">{type.name}</div>
                                                    <div className="text-xs text-gray-500">{type.description}</div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Tools</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {TOOLS.map(t => (
                                            <motion.div key={t.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="relative">
                                                <Button type="button" variant={selectedTools.includes(t.id) ? 'default' : 'outline'} onClick={() => handleToolToggle(t.id)} className="h-20 w-full rounded-xl flex flex-col items-center justify-center gap-2">
                                                    <t.icon className="h-6 w-6" />
                                                    <div className="text-xs font-medium">{t.name}</div>
                                                </Button>
                                                {selectedTools.includes(t.id) && <Check className="absolute -top-2 -right-2 h-5 w-5 text-white bg-indigo-600 rounded-full p-0.5 shadow" />}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="prompt" className="text-sm font-semibold text-gray-700">System Prompt</label>
                                    <Textarea id="prompt" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="e.g., You are a helpful assistant that..." className="min-h-[140px] rounded-md border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all" />
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1 h-12 rounded-md bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg cursor-pointer" disabled={isSubmitting}>
                                        <Plus className="h-5 w-5" /> {editingId ? 'Update Agent' : 'Create Agent'}
                                    </Button>
                                    {editingId && <Button type="button" variant="outline" className="h-12 cursor-pointer" onClick={handleCancelEdit}>Cancel</Button>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* History */}
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="space-y-6">

                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Created Agents</h2>
                        <Badge variant="outline" className="text-xs font-semibold border-gray-200">{createdAgents.length} total</Badge>
                    </div>

                    <AnimatePresence>
                        {createdAgents.map((agent, i) => (
                            <motion.div key={agent.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45 }} whileHover={{ y: -6, scale: 1.02 }} className="group">
                                <Card className="border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20"><AvatarFallback className="bg-indigo-500 text-white">{String(agent.name?.charAt(0) || 'A')}</AvatarFallback></Avatar>
                                            <div className="flex-1 ml-4">
                                                <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">{agent.name}</CardTitle>
                                                <CardDescription className="text-sm text-gray-600 font-medium leading-relaxed">{agent.description}</CardDescription>
                                            </div>
                                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className={`${agent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'} font-medium`}>{String(agent.status).charAt(0).toUpperCase() + String(agent.status).slice(1)}</Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-0 px-6 pb-6">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(agent.tools || []).map((t, idx) => <Badge key={idx} variant="outline" className="text-xs font-medium capitalize border-gray-200 text-gray-700">{String(t).replace('-', ' ')}</Badge>)}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                                            <span>Created {agent.created}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(agent)} className="h-8 px-3 hover:bg-gray-100 cursor-pointer"><Edit className="h-4 w-4 text-gray-600" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(String(agent.id))} className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"><Trash2 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(agent)} className="h-8 px-3 hover:bg-gray-100 cursor-pointer"><Copy className="h-4 w-4 text-gray-600" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleCopyConfig(agent)} className="h-8 px-3 hover:bg-gray-100 cursor-pointer"><Copy className="h-4 w-4 text-gray-600" /></Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {/* Delete Confirmation Modal */}
                        {showDeleteConfirm && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <Card className="max-w-sm w-full shadow-2xl rounded-2xl">
                                    <CardHeader className="border-b border-gray-100">
                                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                            Delete Agent?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <p className="text-sm text-gray-600">Are you sure you want to delete this agent? This action cannot be undone.</p>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
                                            <Button variant="destructive" className="flex-1" onClick={() => handleDelete(showDeleteConfirm)}>Delete</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {createdAgents.length === 0 && (
                        <Card className="border border-gray-100 shadow-lg bg-white/80 backdrop-blur-xl rounded-xl text-center p-16">
                            <Bot className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No agents created yet</h3>
                            <p className="text-sm text-gray-600 mb-6 font-medium">Start by building your first personal agent above.</p>
                            <Button className="bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg cursor-pointer">Create Your First Agent</Button>
                        </Card>
                    )}

                </motion.div>

            </div>


            <Toaster position="top-right" richColors closeButton />

        </div>

    );

}