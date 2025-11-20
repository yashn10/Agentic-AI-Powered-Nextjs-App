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
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const agents = [
  { id: 'email', title: 'Email Mastery Agent', icon: MessageSquare, color: 'from-indigo-500 to-purple-500', status: 'active', lastUsed: '2 min ago', tasks: 47 },
  { id: 'travel', title: 'Live Travel Orchestrator', icon: Plane, color: 'from-emerald-500 to-teal-500', status: 'thinking', lastUsed: '3 hours ago', tasks: 12 },
  { id: 'news', title: 'Intelligent News Curator', icon: Newspaper, color: 'from-amber-500 to-orange-500', status: 'active', lastUsed: '30 min ago', tasks: 89 },
  { id: 'interview', title: 'Live Interview Coach', icon: Mic, color: 'from-rose-500 to-pink-500', status: 'idle', lastUsed: '2 days ago', tasks: 5 },
];

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (

    <div className="min-h-screen bg-slate-50/50">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>

            <Link href="/dashboard" className="flex items-center gap-3">
              {/* <div className="h-8 w-8 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600" /> */}
              <span className="text-xl font-bold text-indigo-600">AgentForge</span>
            </Link>
          </div>

          {/* Premium Search Bar */}
          <div className="mx-8 flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search agents, tasks, messages..."
                className="h-11 w-full rounded-md border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 sm:flex">
                <span>⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-indigo-600" />
            </Button>
            <Avatar className="h-9 w-9 ring-2 ring-white">
              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-500 text-white font-semibold">
                A
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>


      <div className="flex pt-16">

        {/* Collapsible Sidebar */}
        <aside
          className={`fixed left-0 top-16 z-40 h-full border-r border-slate-200 bg-white/80 backdrop-blur-xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
            }`}
        >
          <nav className="flex h-full flex-col justify-between p-4">

            <div className="space-y-1">
              {[
                { icon: Bot, label: 'All Agents', href: '/dashboard', active: true },
                { icon: MessageSquare, label: 'Email Agent', href: '/chat/email' },
                { icon: Plane, label: 'Travel Planner', href: '/chat/travel' },
                { icon: Newspaper, label: 'News Curator', href: '/chat/news' },
                { icon: Mic, label: 'Interview Coach', href: '/chat/interview' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${item.active
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.active && !sidebarCollapsed && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </Link>
              ))}
            </div>

            <div className="space-y-1 border-t border-slate-200 pt-4">
              <Link
                href="/create"
                className="flex items-center gap-3 rounded-md bg-linear-to-r from-indigo-600 to-purple-600 px-3 py-2.5 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>New Agent</span>}
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>

              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
                <LogOut className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>Sign Out</span>}
              </button>
            </div>

          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="p-8 pt-12">

            {/* Welcome Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 flex items-start justify-between lg:flex-row"
            >
              <div className="flex-1">
                <h1 className="mb-3 text-4xl font-black text-slate-900">
                  Good evening, <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Alex</span> ✨
                </h1>
                <p className="text-lg text-slate-600">
                  Your agents saved you <span className="font-bold text-indigo-600">3.2 hours</span> today.
                  <span className="ml-2 text-sm text-slate-500">(Up 15% from last week)</span>
                </p>
              </div>
              <div className="mt-4 flex items-center gap-4 lg:mt-0">
                <Button variant="outline" size="sm" className="border-slate-300">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button size="sm" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Agent
                </Button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {[
                {
                  title: 'Total Tasks',
                  value: '1,248',
                  change: '+12%',
                  icon: Zap,
                  color: 'text-indigo-600',
                  bgColor: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10',
                },
                {
                  title: 'Active Agents',
                  value: '2',
                  change: '+1',
                  icon: Bot,
                  color: 'text-emerald-600',
                  bgColor: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
                },
                {
                  title: 'Time Saved',
                  value: '47h',
                  change: '+8h',
                  icon: Clock,
                  color: 'text-amber-600',
                  bgColor: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10',
                },
                {
                  title: 'Success Rate',
                  value: '98.2%',
                  change: '+0.5%',
                  icon: MessageSquare,
                  color: 'text-rose-600',
                  bgColor: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${stat.bgColor}`}>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                          <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                          <p className={`text-xs font-semibold ${stat.color}`}>
                            {stat.change}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/20 group-hover:scale-110 transition-transform duration-300">
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                      {/* Subtle trend line animation */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Agents Grid */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Your Agents</h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {agents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link href={`/chat/${agent.id}`}>
                      <Card className="group h-full cursor-pointer overflow-hidden border-0 shadow-lg transition-all hover:shadow-2xl">
                        <div className={`h-2 bg-linear-to-r ${agent.color}`} />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className={`rounded-xl p-3 bg-linear-to-br ${agent.color} shadow-lg`}>
                              <agent.icon className="h-7 w-7 text-white" />
                            </div>
                            {agent.status === 'active' && (
                              <Badge variant="default" className="bg-green-100 text-green-600 hover:bg-green-200">
                                <div className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-green-600" />
                                Live
                              </Badge>
                            )}
                            {agent.status === 'thinking' && (
                              <Badge variant="secondary">Thinking...</Badge>
                            )}
                          </div>
                          <CardTitle className="mt-4 text-lg font-bold text-slate-900">
                            {agent.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Last used {agent.lastUsed}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-black text-slate-900">{agent.tasks}</p>
                              <p className="text-xs text-slate-500">tasks completed</p>
                            </div>
                            <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              Open →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Recent Activity</h2>
              <Card className="border-0 shadow-xl">
                <CardContent className="p-0">
                  {[
                    { agent: 'Email Agent', action: 'Drafted reply to Sarah about Q4 goals', time: '2 min ago' },
                    { agent: 'Travel Agent', action: 'Found $180 cheaper flight to Tokyo (ANA)', time: '1 hour ago' },
                    { agent: 'News Curator', action: 'Sent your 7:30 AM briefing · 12 articles', time: '7:30 AM' },
                    { agent: 'Interview Coach', action: 'Completed System Design round · Score: 94%', time: 'Yesterday' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 hover:bg-slate-50/70 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.agent}</p>
                        <p className="text-sm text-slate-600">{item.action}</p>
                      </div>
                      <span className="text-sm text-slate-500">{item.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

          </div>
        </main>

      </div>

    </div>

  );
}