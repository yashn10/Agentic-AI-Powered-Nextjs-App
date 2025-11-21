// app/dashboard/page.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Plane,
  Newspaper,
  Mic,
  Plus,
  Settings,
  Zap,
  Clock,
  Bot,
  Search,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const agents = [
  { id: 'email', title: 'Email Mastery Agent', icon: MessageSquare, gradient: 'from-blue-500 to-indigo-600', status: 'active', lastUsed: '2 min ago', tasks: 47 },
  { id: 'travel', title: 'Live Travel Orchestrator', icon: Plane, gradient: 'from-emerald-500 to-teal-600', status: 'idle', lastUsed: '3 hours ago', tasks: 12 },
  { id: 'news', title: 'Intelligent News Curator', icon: Newspaper, gradient: 'from-amber-500 to-orange-600', status: 'active', lastUsed: '30 min ago', tasks: 89 },
  { id: 'interview', title: 'Live Interview Coach', icon: Mic, gradient: 'from-rose-500 to-pink-600', status: 'idle', lastUsed: '2 days ago', tasks: 5 },
];

const stats = [
  { title: 'Total Tasks', value: '1,248', change: '+12%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Active Agents', value: '2', change: '+1', icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Time Saved', value: '47h', change: '+8h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Success Rate', value: '98.2%', change: '+0.5%', icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50' },
];

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>

            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 shadow-lg" />
              <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AgentForge
              </span>
            </Link>
          </div>

          <div className="mx-8 flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                placeholder="Search agents, tasks, messages..."
                className="h-11 w-full rounded-2xl border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-linear-to-r from-pink-500 to-rose-500 ring-4 ring-white" />
            </Button>
            <Avatar className="h-10 w-10 ring-4 ring-white shadow-lg">
              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold">
                A
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 z-40 h-full border-r border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-72'}`}>
          <nav className="flex h-full flex-col justify-between p-5">
            <div className="space-y-2">
              {[
                { icon: Bot, label: 'Dashboard', href: '/dashboard', active: true },
                { icon: MessageSquare, label: 'Email Agent', href: '/chat/email' },
                { icon: Plane, label: 'Travel Planner', href: '/chat/travel' },
                { icon: Newspaper, label: 'News Curator', href: '/chat/news' },
                { icon: Mic, label: 'Interview Coach', href: '/chat/interview' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${item.active
                    ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100 hover:shadow-md'
                    }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.active && !sidebarCollapsed && <Sparkles className="ml-auto h-4 w-4" />}
                </Link>
              ))}
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-5">
              <Link
                href="/create"
                className="flex items-center gap-4 rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-xl hover:shadow-2xl transition-all"
              >
                <Plus className="h-5 w-5" />
                {!sidebarCollapsed && 'New Agent'}
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'} p-8`}>
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              Good evening, <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Alex</span>
            </h1>
            <p className="text-lg text-slate-600">Your agents saved you <span className="font-bold text-indigo-600">3.2 hours</span> today • Up 15% this week</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Card className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${stat.bg} backdrop-blur-sm`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bg}`}>
                        <stat.icon className={`h-7 w-7 ${stat.color}`} />
                      </div>
                      <span className={`text-sm font-bold ${stat.color}`}>{stat.change}</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-600 mt-1">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Agents Grid – Now Stunning */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Your Agents</h2>
              <Button variant="ghost" size="sm" className="text-indigo-600">
                View all →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -12, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <Link href={`/chat/${agent.id}`}>
                    <Card className="h-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-xl">
                      <div className={`h-2 bg-linear-to-r ${agent.gradient}`} />
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-4 rounded-2xl bg-linear-to-br ${agent.gradient} shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                            <agent.icon className="h-10 w-10 text-white" />
                          </div>
                          {agent.status === 'active' && (
                            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                              Live
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900">{agent.title}</CardTitle>
                        <CardDescription className="text-sm text-slate-500 mt-1">
                          Last used {agent.lastUsed}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-4xl font-black text-slate-900">{agent.tasks}</p>
                            <p className="text-sm text-slate-500">tasks completed</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" className={`bg-linear-to-r ${agent.gradient} text-white hover:shadow-xl`}>
                              Open →
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-xl">
              <CardContent className="p-6">
                {[
                  { agent: 'Email Agent', action: 'Drafted 12 replies • Saved 42 min', time: '2 min ago' },
                  { agent: 'Travel Agent', action: 'Found $180 cheaper flight to Tokyo', time: '1 hour ago' },
                  { agent: 'News Curator', action: 'Sent your 7:30 AM briefing • 12 articles', time: '7:30 AM' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 py-5 border-b border-slate-100 last:border-0">
                    <div className="p-3 rounded-2xl bg-slate-100">
                      <MessageSquare className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.agent}</p>
                      <p className="text-sm text-slate-600">{item.action}</p>
                    </div>
                    <span className="text-sm text-slate-500">{item.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}