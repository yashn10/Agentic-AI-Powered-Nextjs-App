// app/dashboard/page.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Plane, Newspaper, Mic, Plus, Zap, Clock, Bot, Search, Bell, ChevronLeft, ChevronRight, TrendingUp, Sparkles, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User } from '@/components/userContext';

const agents = [
  { id: 'email', title: 'Email Mastery Agent', icon: MessageSquare, gradient: 'from-indigo-500 to-purple-600', status: 'active', lastUsed: '2 min ago', tasks: 47 },
  { id: 'travel', title: 'Live Travel Orchestrator', icon: Plane, gradient: 'from-emerald-500 to-teal-600', status: 'idle', lastUsed: '3 hours ago', tasks: 12 },
  { id: 'news', title: 'Intelligent News Curator', icon: Newspaper, gradient: 'from-amber-500 to-orange-600', status: 'active', lastUsed: '30 min ago', tasks: 89 },
  { id: 'interview', title: 'Live Interview Coach', icon: Mic, gradient: 'from-rose-500 to-pink-600', status: 'idle', lastUsed: '2 days ago', tasks: 5 },
];

const stats = [
  { title: 'Total Tasks', value: '1,248', change: '+12%', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Active Agents', value: '2', change: '+1', icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Time Saved', value: '47h', change: '+8h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Success Rate', value: '98.2%', change: '+0.5%', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function Dashboard() {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user.data);
    }
  }, [])


  return (

    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50 font-inter antialiased">

      {/* Header - Enhanced with Better Backdrop and Shadows */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-100 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>

            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                AgentForge
              </span>
            </Link>
          </div>

          <div className="mx-8 flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                placeholder="Search agents, tasks, messages..."
                className="h-11 w-full rounded-lg border-gray-200 bg-gray-50/70 pl-11 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" className="relative hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-linear-to-r from-pink-500 to-rose-500 ring-2 ring-white shadow" />
            </Button>
            <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
              <AvatarImage
                src={user?.picture}
                alt="Profile Picture"
                className="object-cover"
              />

              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold">
                {user?.given_name?.charAt(0) ?? "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>


      <div className="flex pt-16">

        {/* Sidebar - Modern with Smooth Transitions */}
        <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-gray-100 bg-white/95 backdrop-blur-xl shadow-lg transition-all duration-500 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
          <nav className={`flex h-full flex-col justify-between ${sidebarCollapsed ? 'py-5 px-3' : 'p-5'}`}>
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
                  className={`group flex items-center gap-4 rounded-md py-3 ${sidebarCollapsed ? 'px-2' : 'px-4'} text-sm font-semibold transition-all duration-200 ${item.active
                    ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-md hover:text-indigo-600'
                    }`}
                >
                  <item.icon className="h-5 w-5 shrink-0 transition-colors" />
                  {!sidebarCollapsed && <span className="transition-colors">{item.label}</span>}
                  {item.active && !sidebarCollapsed && <LayoutDashboard className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </Link>
              ))}
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-5">
              <Link
                href="/chat/personalAgent"
                className="group flex items-center gap-4 rounded-md bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                {!sidebarCollapsed && 'New Agent'}
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content - Enhanced Spacing and Animations */}
        <main className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} p-8`}>

          {/* Welcome - Refined Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Good evening, <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user && user.given_name}</span>
            </h1>
            <p className="text-lg text-gray-600 font-medium">Your agents saved you <span className="font-bold text-indigo-600">3.2 hours</span> today • Up 15% this week</p>
          </motion.div>

          {/* Stats Grid - Polished Cards with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className={`border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 ${stat.bg} backdrop-blur-sm rounded-2xl overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bg} shadow-sm`}>
                        <stat.icon className={`h-7 w-7 ${stat.color}`} />
                      </div>
                      <span className={`text-sm font-semibold ${stat.color} flex items-center gap-1`}>
                        <TrendingUp className="h-3 w-3" /> {stat.change}
                      </span>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Agents Grid – Enhanced with Gradients and Status Badges */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Your Agents</h2>
              <Button variant="secondary" size="sm" className="text-indigo-600 font-semibold hover:text-indigo-700">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <Link href={`/chat/${agent.id}`}>
                    <Card className="h-full overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-xl rounded-3xl">
                      <div className={`h-1 bg-linear-to-r ${agent.gradient}`} />
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <motion.div
                            className={`p-4 rounded-2xl bg-linear-to-br ${agent.gradient} shadow-lg group-hover:scale-105 transition-transform duration-300`}
                            whileHover={{ rotate: 3 }}
                          >
                            <agent.icon className="h-10 w-10 text-white" />
                          </motion.div>
                          {agent.status === 'active' && (
                            <Badge className="bg-emerald-100/80 text-emerald-700 border border-emerald-200/50 backdrop-blur-sm">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                              Live
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">{agent.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500 mt-1 font-medium">
                          Last used {agent.lastUsed}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between pt-2">
                          <div>
                            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{agent.tasks}</p>
                            <p className="text-sm text-gray-500 font-medium">tasks completed</p>
                          </div>
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ x: 10 }}
                            animate={{ x: 0 }}
                          >
                            <Button size="sm" className={`bg-linear-to-r ${agent.gradient} text-white hover:shadow-lg transition-all`}>
                              Open <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity - Clean List with Icons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
              <Button variant="secondary" size="sm" className="text-indigo-600 font-semibold cursor-pointer">
                See more <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <Card className="border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                {[
                  { agent: 'Email Agent', action: 'Drafted 12 replies • Saved 42 min', time: '2 min ago', icon: MessageSquare },
                  { agent: 'Travel Agent', action: 'Found $180 cheaper flight to Tokyo', time: '1 hour ago', icon: Plane },
                  { agent: 'News Curator', action: 'Sent your 7:30 AM briefing • 12 articles', time: '7:30 AM', icon: Newspaper },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-5 py-6 px-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="p-3 rounded-2xl bg-linear-to-r from-indigo-100 to-purple-100">
                      <item.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.agent}</p>
                      <p className="text-sm text-gray-600 font-medium">{item.action}</p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium min-w-max">{item.time}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

        </main>

      </div>

    </div>

  );
}