// app/page.tsx
'use client';

import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, MessageSquare, Plane, Newspaper, Mic, Zap, Shield, Clock, LogIn, Quote, PhoneCall, LogOutIcon } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Signin from './auth/signin';
import Logout from './auth/logout';
import userContext from '@/components/userContext';


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120, damping: 15 },
  },
};

const cardVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0, rotateX: 5 },
  visible: {
    scale: 1,
    opacity: 1,
    rotateX: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  hover: {
    scale: 1.03,
    y: -8,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

const staggerChildren: Variants = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function HomePage() {

  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [openDialogue, setOpenDialogue] = useState(false);
  const [openOutDialogue, setOpenOutDialogue] = useState(false);
  const { user, setUser } = useContext(userContext);

  // Simulate auth check
  useEffect(() => {
    const userdata = localStorage.getItem('user');
    if (user || userdata) {
      setIsUserSignedIn(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsUserSignedIn(true);
    }
  }, [user]);

  const testimonials = [
    { quote: "AgentForge transformed my workflow—my email agent handles 80% of my inbox now!", author: "Sarah L., Founder @ TechStartup", avatar: "S" },
    { quote: "The travel planner saved me hours and $300 on my last trip. Mind-blowing accuracy.", author: "Mike R., Digital Nomad", avatar: "M" },
    { quote: "Nailed my FAANG interview prep with the live agent. Feedback was spot-on.", author: "Alex K., Software Engineer", avatar: "A" },
  ];

  const howItWorksSteps = [
    { icon: Zap, title: "Prompt Your Vision", desc: "Describe what you need in natural language. Our AI instantly blueprints a custom agent." },
    { icon: Clock, title: "Deploy Autonomously", desc: "Watch it learn, adapt, and execute tasks in real-time—no code required." },
    { icon: Shield, title: "Monitor & Refine", desc: "Track performance with analytics and tweak on the fly for perfect results." },
  ];

  return (

    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50 overflow-hidden font-inter antialiased">

      {/* Navbar - Clean, Modern Top Bar with Subtle Shadow */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100 px-6">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AgentForge
          </Link>
          <div className="flex items-center space-x-6">
            <Button variant="ghost" asChild className="text-gray-700 hover:text-indigo-600 transition-colors">
              <Link href="/dashboard">Watch Demo</Link>
            </Button>
            {isUserSignedIn ? (
              <Button variant="secondary" size="sm" onClick={() => setOpenOutDialogue(true)} className="border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer">
                <LogOutIcon className="h-4 w-4" /> Log Out
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className='cursor-pointer' onClick={() => setOpenDialogue(true)}>
                <LogIn className="mr-1 h-4 w-4" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Immersive with Refined Typography and Animations */}
      <section className="relative pt-28 pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600/5 to-purple-600/5 opacity-50"></div>
        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100/80 text-indigo-700 text-sm font-medium mb-6 shadow-sm">
              🚀 Trusted by 10K+ Creators & Teams
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6 text-gray-900 tracking-tight">
              Autonomous AI Agents
              <span className="block bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">That Actually Work</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed font-medium">
              Empower your day with intelligent agents that manage emails, craft flawless travel plans, deliver curated news insights, and simulate high-stakes interviews.
              From prompt to productivity—seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-6 rounded-lg shadow-lg font-semibold text-lg transform hover:scale-105 transition-transform">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-10 py-6 rounded-lg border-gray-300 font-semibold text-lg hover:bg-gray-50 transition-colors">
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Subtle Floating Orbs for Depth */}
        <motion.div
          className="absolute top-1/4 right-12 hidden xl:block"
          animate={{ y: [0, -40, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-24 h-24 bg-linear-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 left-12 hidden xl:block"
          animate={{ y: [0, 40, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-20 h-20 bg-linear-to-r from-gray-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
        </motion.div>
      </section>

      {/* How It Works Section - Clean, Card-Based Layout */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerChildren}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">How AgentForge Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">Three simple steps to unleash AI that thinks and acts like your best teammate.</p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {howItWorksSteps.map((step, index) => (
              <motion.div key={index} variants={cardVariants} whileHover="hover">
                <Card className="h-full border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 text-center">
                    <div className="w-16 h-16 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-800">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center font-medium leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Vibrant, Interactive Cards */}
      <section className="relative py-24 bg-linear-to-br from-gray-50 to-indigo-50 -mt-8">
        <div className="container mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
          >
            {/* Email Agent Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Email Mastery Agent</CardTitle>
                  <CardDescription className="text-gray-600 font-medium leading-relaxed">
                    Conquer inbox overload with AI that reads, prioritizes, drafts personalized replies, and automates follow-ups—saving you 5+ hours weekly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-indigo-50 transition-colors font-medium text-indigo-600">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Travel Planner Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Live Travel Orchestrator</CardTitle>
                  <CardDescription className="text-gray-600 font-medium leading-relaxed">
                    Real-time flight, hotel, and itinerary optimization with deal alerts and seamless booking integration—your ultimate wanderlust companion.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-emerald-50 transition-colors font-medium text-emerald-600">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* News Search Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow">
                    <Newspaper className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Intelligent News Curator</CardTitle>
                  <CardDescription className="text-gray-600 font-medium leading-relaxed">
                    Personalized daily digests, trend tracking, and deep-dive summaries from global sources—stay informed without the noise.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-amber-50 transition-colors font-medium text-amber-600">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interview Agent Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Live Interview Coach</CardTitle>
                  <CardDescription className="text-gray-600 font-medium leading-relaxed">
                    Voice-enabled mock interviews with instant feedback on delivery, content, and strategy—boost your confidence for real-world success.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-rose-50 transition-colors font-medium text-rose-600">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Dynamic Animated Counters */}
      <section className="py-24 bg-linear-to-r from-gray-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-5xl lg:text-6xl font-extrabold text-indigo-600 mb-3"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                25K+
              </motion.h3>
              <p className="text-gray-700 font-semibold text-lg">Agents Activated</p>
              <p className="text-sm text-gray-500">Across 50+ countries</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-5xl lg:text-6xl font-extrabold text-emerald-600 mb-3"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              >
                99.99%
              </motion.h3>
              <p className="text-gray-700 font-semibold text-lg">Uptime Guarantee</p>
              <p className="text-sm text-gray-500">Enterprise-grade reliability</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-5xl lg:text-6xl font-extrabold text-purple-600 mb-3"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              >
                $2M+
              </motion.h3>
              <p className="text-gray-700 font-semibold text-lg">Hours Saved</p>
              <p className="text-sm text-gray-500">For our users annually</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Elegant, Quoted Cards */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">Join the creators revolutionizing their workflows with AgentForge.</p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ y: -6 }}>
                <Card className="h-full border border-gray-200 shadow-lg bg-linear-to-b from-gray-50 to-white rounded-2xl overflow-hidden">
                  <CardContent className="pt-6 pb-8 px-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{testimonial.author}</p>
                        <div className="flex space-x-1 text-amber-400 mt-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                        </div>
                      </div>
                    </div>
                    <Quote className="h-6 w-6 text-gray-300 mb-4 ml-2 opacity-50" />
                    <p className="text-gray-700 italic font-medium leading-relaxed">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Footer - Bold, linear Background */}
      <section className="py-28 bg-linear-to-r from-gray-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600/10 to-purple-600/10 opacity-50"></div>
        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">Ready to Forge Your Future?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
              Start with our free tier and experience the power of autonomous agents. No credit card required—cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6 rounded-lg shadow-xl font-semibold text-lg transform hover:scale-105 transition-transform">
                Create Your First Agent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-10 py-6 text-white rounded-lg border-white/40 hover:bg-white/10 font-semibold text-lg transition-colors">
                <PhoneCall className="mr-2 h-5 w-5" /> Book a Demo Call
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Footer */}
        <footer className="border-t border-white/20 mt-16 pt-8">
          <div className="container mx-auto px-6 text-center text-sm text-gray-400">
            <p>&copy; 2025 AgentForge. All rights reserved. | <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link> | <Link href="/terms" className="hover:text-white transition-colors">Terms</Link></p>
          </div>
        </footer>
      </section>

      <Signin openDialogue={openDialogue} closeDialogue={setOpenDialogue} />
      <Logout openoutDialogue={openOutDialogue} closeDialogue={setOpenOutDialogue} />

    </div>

  );
}

// Simple Star Component
function Star({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}