// app/page.tsx
'use client';

import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, MessageSquare, Plane, Newspaper, Mic, Zap, Shield, Clock, LogIn, Quote, PhoneCall } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
// import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

// Assume Inter font is loaded via globals.css: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
// And body { font-family: 'Inter', sans-serif; }

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
  hidden: { scale: 0.9, opacity: 0, rotateX: 10 },
  visible: {
    scale: 1,
    opacity: 1,
    rotateX: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  hover: {
    scale: 1.02,
    y: -5,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
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

  // Simulate auth check
  useEffect(() => {
    // In real: const { isSignedIn } = useUser();
    // setIsUserSignedIn(isSignedIn);
  }, []);

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

    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 overflow-hidden antialiased">

      {/* Navbar - Professional Top Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AgentForge
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
            {isUserSignedIn ? (
              // <UserButton afterSignOutUrl="/" />
              <Button variant="outline" asChild>
                Sign Out
              </Button>
            ) : (
              <Button variant="secondary" size="sm" asChild>
                <Link href="/sign-in">
                  <LogIn /> Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced with More Depth */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600/5 to-purple-600/5"></div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              🚀 Trusted by 10K+ Creators & Teams
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 text-slate-900">
              Autonomous AI Agents
              <span className="block bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">That Actually Work</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto mb-8 leading-relaxed font-medium">
              Empower your day with intelligent agents that manage emails, craft flawless travel plans, deliver curated news insights, and simulate high-stakes interviews.
              From prompt to productivity—seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={"/dashboard"}>
                <Button size="lg" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl shadow-xl font-semibold text-lg cursor-pointer">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-10 py-4 rounded-xl border-slate-300 font-semibold text-lg">
                View Pricing
              </Button>
            </div>
            {/* Mockup Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-12 mx-auto max-w-4xl"
            >
              <div className="relative bg-slate-100 rounded-2xl p-8 shadow-2xl">
                <img
                  src="/api/placeholder/800/400"
                  alt="AgentForge Dashboard"
                  className="w-full rounded-xl shadow-lg"
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Live Demo</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        {/* Enhanced Floating Elements */}
        <motion.div
          className="absolute top-1/4 right-8 hidden xl:block"
          animate={{ y: [0, -30, 0], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-20 h-20 bg-linear-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-xl"></div>
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 left-8 hidden xl:block"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        >
          <div className="w-16 h-16 bg-linear-to-r from-slate-400/30 to-indigo-400/30 rounded-full blur-xl"></div>
        </motion.div>
      </section>

      {/* How It Works Section - New Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerChildren}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">How AgentForge Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Three simple steps to unleash AI that thinks and acts like your best teammate.</p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {howItWorksSteps.map((step, index) => (
              <motion.div key={index} variants={itemVariants} whileHover="hover">
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-slate-50/50 backdrop-blur-sm">
                  <CardHeader className="pb-4 text-center">
                    <div className="w-16 h-16 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-slate-800">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-center font-medium">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Enhanced Descriptions */}
      <section className="relative py-20 -mt-8">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
          >
            {/* Email Agent Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-slate-200/30">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Email Mastery Agent</CardTitle>
                  <CardDescription className="text-slate-600 font-medium">
                    Conquer inbox overload with AI that reads, prioritizes, drafts personalized replies, and automates follow-ups—saving you 5+ hours weekly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-indigo-50 transition-colors font-medium cursor-pointer">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Travel Planner Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-slate-200/30">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Live Travel Orchestrator</CardTitle>
                  <CardDescription className="text-slate-600 font-medium">
                    Real-time flight, hotel, and itinerary optimization with deal alerts and seamless booking integration—your ultimate wanderlust companion.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-emerald-50 transition-colors font-medium cursor-pointer">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* News Search Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-slate-200/30">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Newspaper className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Intelligent News Curator</CardTitle>
                  <CardDescription className="text-slate-600 font-medium">
                    Personalized daily digests, trend tracking, and deep-dive summaries from global sources—stay informed without the noise.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-amber-50 transition-colors font-medium cursor-pointer">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interview Agent Card */}
            <motion.div variants={cardVariants} whileHover="hover" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-slate-200/30">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Live Interview Coach</CardTitle>
                  <CardDescription className="text-slate-600 font-medium">
                    Voice-enabled mock interviews with instant feedback on delivery, content, and strategy—boost your confidence for real-world success.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-rose-50 transition-colors font-medium cursor-pointer">
                    Launch Agent <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Animated Numbers */}
      <section className="py-20 bg-linear-to-r from-slate-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-5xl font-black text-indigo-600 mb-3"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                25K+
              </motion.h3>
              <p className="text-slate-600 font-semibold text-lg">Agents Activated</p>
              <p className="text-sm text-slate-500">Across 50+ countries</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-5xl font-black text-emerald-600 mb-3"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              >
                99.99%
              </motion.h3>
              <p className="text-slate-600 font-semibold text-lg">Uptime Guarantee</p>
              <p className="text-sm text-slate-500">Enterprise-grade reliability</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.h3
                className="text-5xl font-black text-purple-600 mb-3"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              >
                $2M+
              </motion.h3>
              <p className="text-slate-600 font-semibold text-lg">Hours Saved</p>
              <p className="text-sm text-slate-500">For our users annually</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - New Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Join the creators revolutionizing their workflows with AgentForge.</p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ y: -4 }}>
                <Card className="h-full border-0 shadow-lg bg-linear-to-b from-slate-50 to-white">
                  <CardContent className="pt-6 pb-8">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{testimonial.author}</p>
                        <div className="flex space-x-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                        </div>
                      </div>
                    </div>
                    <Quote className="h-6 w-6 text-slate-300 mb-4 ml-2" />
                    <p className="text-slate-700 italic font-medium leading-relaxed">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Footer - Enhanced */}
      <section className="py-24 bg-linear-to-r from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Forge Your Future?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Start with our free tier and experience the power of autonomous agents. No credit card required—cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-10 py-4 rounded-md shadow-xl font-semibold text-lg cursor-pointer">
                Create Your First Agent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-10 py-4 text-slate-900 rounded-md border-white/50 font-semibold text-lg cursor-pointer">
                <PhoneCall className="mr-2 h-5 w-5" /> Book a Demo Call
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Simple Footer */}
        <footer className="border-t border-white/10 mt-16 pt-8">
          <div className="container mx-auto px-4 text-center text-sm text-slate-400">
            <p>&copy; 2025 AgentForge. All rights reserved. | <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link> | <Link href="/terms" className="hover:text-white transition-colors">Terms</Link></p>
          </div>
        </footer>
      </section>

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