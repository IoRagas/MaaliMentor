"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Mic,
  Gamepad2,
  BarChart3,
  ArrowRight,
  BookOpen,
  Globe,
  Shield,
  Volume2,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";

const features = [
  {
    icon: Mic,
    title: "Voice Tutor",
    urdu: "آواز سے سیکھیں",
    description:
      "Apni zuban mein AI tutor se baat karein aur financial concepts sikhein. Kisi bhi topic par urdu mein audio sunein aur bol kar sawal karein.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Gamepad2,
    title: "Life Simulator",
    urdu: "زندگی سمیولیٹر",
    description:
      "Pakistan ki economy ke mutabiq real-world scenario-based decisions lein aur dekhein ke un ka aap ki savings aur budget par kya asar hota hai.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Smart Dashboard",
    urdu: "سمارٹ ڈیش بورڈ",
    description:
      "Apni growth track karein. Concepts ki mastery check karein aur financial benchmarks complete kar ke badges hasil karein.",
    color: "from-purple-500 to-purple-600",
  },
];

const steps = [
  {
    number: "01",
    title: "Urdu Voice Chat",
    urdu: "آواز میں بات چیت",
    description: "Apni zuban (Urdu/Roman Urdu) mein AI se sawal karein, jaise kisi dost se baat kar rahe hon.",
    icon: Volume2,
    color: "text-emerald-400",
  },
  {
    number: "02",
    title: "Interactive Concepts",
    urdu: "تصورات کی سمجھ",
    description: "Gemini AI mushkil concepts ko asaan misalon ke sath samjhayega, bilkul short audio notes ke sath.",
    icon: BookOpen,
    color: "text-cyan-400",
  },
  {
    number: "03",
    title: "Simulate Decisions",
    urdu: "فیصلوں کا اثر",
    description: "Simulator mein real-life decisions lein aur dekhein ke un ka aap ki pocket par kya asar hota hai.",
    icon: Gamepad2,
    color: "text-purple-400",
  },
  {
    number: "04",
    title: "Achieve Goals",
    urdu: "مقاصد کا حصول",
    description: "Apne personal goals set karein aur apni financial literacy progress track karein.",
    icon: BarChart3,
    color: "text-rose-400",
  },
];

const stats = [
  { icon: BookOpen, value: "10+", label: "Financial Concepts" },
  { icon: Globe, value: "Urdu", label: "Voice AI Integration" },
  { icon: Shield, value: "100%", label: "Pakistan-Focused Data" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden relative bg-[#0F172A] text-slate-100 pb-20">
      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

      {/* Glassmorphic Navbar */}
      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl mt-4 w-[calc(100%-2rem)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Maali Mentor</span>
            <span className="block text-[10px] text-slate-400 -mt-1 font-medium">مالی مینٹر</span>
          </div>
        </div>
        
        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors duration-200">How It Works</a>
          <a href="#stats" className="hover:text-emerald-400 transition-colors duration-200">Impact</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/onboarding"
            className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200 px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            href="/onboarding"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 md:pt-28 md:pb-32 max-w-4xl mx-auto">
        {/* Animated badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm text-emerald-400 font-semibold uppercase tracking-wider">
            AI-Powered Urdu Financial Coach
          </span>
        </div>

        {/* Pulse / Wave Animation for Voice Assistant */}
        <div className="animate-fade-in-up stagger-1 flex justify-center mb-8 relative">
          <div className="relative flex items-center justify-center w-28 h-28 md:w-36 md:h-36 group">
            {/* Concentric pulsing waves */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-60 pointer-events-none" />
            <div className="absolute -inset-4 rounded-full bg-cyan-500/5 animate-ping opacity-40 [animation-delay:0.4s] pointer-events-none" />
            <div className="absolute -inset-8 rounded-full bg-emerald-500/5 animate-ping opacity-20 [animation-delay:0.8s] pointer-events-none" />
            
            {/* Center glass ball */}
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center backdrop-blur-xl group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-300">
              {/* Inner glowing orb */}
              <div className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-500/15 blur-md animate-pulse" />
              <Mic size={30} className="text-emerald-400 animate-float group-hover:text-emerald-300 relative z-10" />
            </div>
          </div>
        </div>

        {/* Main title (highly responsive font sizing) */}
        <h1 className="animate-fade-in-up stagger-2 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] mb-2">
          <span className="gradient-text">Maali Mentor</span>
        </h1>

        {/* Urdu subtitle */}
        <p className="animate-fade-in-up stagger-3 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-300 mb-6 font-urdu" dir="rtl">
          مالی مینٹر
        </p>

        {/* Tagline */}
        <p className="animate-fade-in-up stagger-4 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Apni Zuban Mein, Apna Financial Future.
          <br className="hidden sm:inline" />
          <span className="text-slate-500 text-sm sm:text-base md:text-lg">
            Sikhein budget banana, bachat karna aur sahi jagah invest karna, asaan Urdu bol kar.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          <Link href="/onboarding" className="glow-btn text-base px-8 py-4 flex items-center justify-center gap-2 w-full sm:w-auto">
            Shuru Karein
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="glow-btn-outline text-base px-8 py-4 w-full sm:w-auto flex justify-center"
          >
            Dashboard Dekhein
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 md:px-12 lg:px-24 pb-24 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Core Features
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Har cheez jo aap ko financial expert banne ke liye chahiye
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <GlassCard
              key={feature.title}
              className="group cursor-default p-6 flex flex-col justify-between min-h-[300px] border border-white/5 hover:border-emerald-500/20 transition-all duration-300"
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 shadow-lg transition-transform duration-300`}
                >
                  <feature.icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-emerald-400 mb-4 font-semibold font-urdu" dir="rtl">
                  {feature.urdu}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Explore Feature <ArrowRight size={14} />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How it Works / Learning Flow Graph */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-12 lg:px-24 pb-24 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Learning Path
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Aap ka seekhne ka safar, asaan char marahil mein
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line (desktop) */}
              {index < 3 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-gradient-to-r from-emerald-500/30 to-transparent z-0 -translate-x-6" />
              )}
              
              <GlassCard className="relative z-10 p-6 h-full border border-white/5 bg-slate-900/30 backdrop-blur-md rounded-2xl flex flex-col justify-between group-hover:border-emerald-500/20 transition-all duration-300">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-4xl font-extrabold text-slate-800 group-hover:text-emerald-500/10 transition-colors duration-300">
                      {step.number}
                    </span>
                    <div className={`p-3 rounded-xl bg-slate-800/80 ${step.color}`}>
                      <step.icon size={22} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-emerald-400 mb-3 font-semibold font-urdu" dir="rtl">
                    {step.urdu}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / Impact Section */}
      <section id="stats" className="relative z-10 px-6 md:px-12 lg:px-24 pb-20 max-w-4xl mx-auto scroll-mt-24">
        <GlassCard className="!p-0 overflow-hidden border border-white/5 bg-slate-900/20 backdrop-blur-xl" hover={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-10 px-6"
              >
                <div className="p-3 rounded-full bg-emerald-500/10 mb-4">
                  <stat.icon size={24} className="text-emerald-400" />
                </div>
                <span className="text-4xl font-extrabold gradient-text tracking-tight">{stat.value}</span>
                <span className="text-sm text-slate-400 mt-2 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-12 border-t border-white/5 max-w-6xl mx-auto px-6">
        <p className="text-sm text-slate-500">
          © 2026 Maali Mentor — مالی مینٹر. Built for Pakistan 🇵🇰
        </p>
        <p className="text-xs text-slate-600 mt-2">
          Empowering financial decision-making, powered by Gemini 2.5 Flash
        </p>
      </footer>
    </main>
  );
}
