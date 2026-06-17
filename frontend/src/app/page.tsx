"use client";

import React, { useState } from "react";
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
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  ChevronRight,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";

const features = [
  {
    icon: Mic,
    title: "Voice Tutor",
    urdu: "آواز سے سیکھیں",
    description:
      "Apni zuban (Urdu/Roman Urdu) mein AI tutor se baat karein. Mushkil concepts par simple audio lectures aur explanation sunein.",
    color: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.15)",
  },
  {
    icon: Gamepad2,
    title: "Life Simulator",
    urdu: "زندگی کا سمیولیٹر",
    description:
      "Pakistan ki economy ke mutabiq decisions lein. Dekhein ke committees, savings accounts aur inflation aap ki pocket ko kaise affect karte hain.",
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.15)",
  },
  {
    icon: BarChart3,
    title: "Level 1-10 Rank System",
    urdu: "درجہ بندی اور کوئز",
    description:
      "Budgeting se lekar tax planning tak, levels complete karein, level-based quizzes pass karein aur as a financial expert ascend karein.",
    color: "from-purple-500 to-indigo-600",
    glow: "rgba(168,85,247,0.15)",
  },
];

const steps = [
  {
    number: "01",
    title: "Onboarding Assessment",
    urdu: "ابتدائی جائزہ",
    description: "Sirf 3 simple sawalat ke jawab de kar apna starting benchmark set karein.",
    color: "text-emerald-400",
  },
  {
    number: "02",
    title: "Learn & Interact",
    urdu: "سیکھیں اور بات کریں",
    description: "Apni marzi se kisi bhi level ka concept AI voice coach se Urdu mein discuss karein.",
    color: "text-cyan-400",
  },
  {
    number: "03",
    title: "Take Level Quizzes",
    urdu: "لیول ٹیسٹ پاس کریں",
    description: "20 hardcoded MCQs ka quiz pass karein (kam-az-kam 75% score) taake agle level par ascend ho sakein.",
    color: "text-purple-400",
  },
  {
    number: "04",
    title: "Ascend Ranks",
    urdu: "رینک حاصل کریں",
    description: "Bachat Rookie se Shariah Finance Scholar aur aakhir mein Maali Master ban kar kamyabi hasil karein.",
    color: "text-rose-400",
  },
];

const stats = [
  { icon: BookOpen, value: "10 Levels", label: "Structured Topics" },
  { icon: Globe, value: "Roman Urdu", label: "Voice AI & TTS" },
  { icon: Brain, value: "200 MCQs", label: "Level-based Quiz Pool" },
];

export default function LandingPage() {
  const [triviaOption, setTriviaOption] = useState<string | null>(null);
  const [showTriviaResult, setShowTriviaResult] = useState(false);

  const handleTriviaAnswer = (option: string) => {
    setTriviaOption(option);
    setShowTriviaResult(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden relative bg-[#090D1A] text-slate-100 pb-36">
      {/* Dynamic Embedded CSS Styles for waveform and custom background grid */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(3deg); }
          }
          @keyframes pulse-wave {
            0%, 100% { transform: scaleY(0.3); }
            50% { transform: scaleY(1.3); }
          }
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          .waveform-bar {
            animation: pulse-wave 1.2s ease-in-out infinite;
            transform-origin: center;
          }
          .bg-grid-pattern {
            background-size: 40px 40px;
            background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          }
        `
      }} />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-3xl bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[450px] h-[450px] rounded-3xl bg-cyan-500/5 blur-[120px] pointer-events-none" />
      
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />

      {/* Glassmorphic Navbar */}
      <header className="relative z-50 mx-auto max-w-6xl px-6 sm:px-8 py-5 flex items-center justify-between border border-white/5 bg-slate-950/40 backdrop-blur-xl rounded-2xl shadow-2xl mt-8 w-[calc(100%-2rem)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">Maali Mentor</span>
            <span className="block text-[10px] text-slate-400 -mt-1 font-medium font-urdu" dir="rtl">مالی مینٹر</span>
          </div>
        </div>
        
        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-emerald-400 transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors duration-200">How It Works</a>
          <a href="#trivia" className="hover:text-emerald-400 transition-colors duration-200">Test IQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200 px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            href="/onboarding"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-32 md:pt-24 md:pb-40 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Title & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <span className="w-2 h-2 rounded-sm bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-wider">
                AI Urdu Financial Literacy Coach
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Sikhein Bachat aur Investing, <br className="hidden sm:inline" />
              <span className="gradient-text">Apni Zuban Mein.</span>
            </h1>

            <p className="text-2xl font-bold text-slate-300 font-urdu" dir="rtl">
              مالی طور پر خود مختار بنیں۔
            </p>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-xl">
              Maali Mentor aap ka apna AI advisor hai jo Urdu aur Roman Urdu mein aap ki zarooriyat samajhta hai. 
              Menehgai (inflation) se larna, budget banana aur shares mein invest karna seekhein, asaan bol kar.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 w-full sm:w-auto">
              <Link href="/onboarding" className="glow-btn text-sm sm:text-base px-12 py-6 flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg">
                Shuru Karein <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="glow-btn-outline text-sm sm:text-base px-12 py-6 w-full sm:w-auto flex justify-center items-center gap-2 text-white border-white/10 hover:border-emerald-500/30"
              >
                Dashboard Dekhein
              </Link>
            </div>
          </div>

          {/* Right Column: AI Assistant Mockup Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px] animate-float-slow">
              {/* Outer neon backdrop */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 blur-xl pointer-events-none" />
              
              <GlassCard className="!p-0 border border-white/15 overflow-hidden rounded-3xl shadow-2xl bg-slate-950/80 backdrop-blur-2xl" hover={false}>
                {/* Mock Header */}
                <div className="px-6 py-5 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300">Maali Mentor Live Voice</span>
                  </div>
                  <span className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-white/5">Roman Urdu</span>
                </div>

                {/* Mock Conversation Space */}
                <div className="p-7 space-y-6 min-h-[300px] flex flex-col justify-end text-xs leading-relaxed">
                  
                  {/* Bubble 1: User */}
                  <div className="flex justify-end animate-fade-in-up">
                    <div className="max-w-[85%] rounded-lg rounded-tr-none px-7 py-5 bg-slate-800 text-slate-200 border border-white/5">
                      <p className="font-semibold text-[10px] text-slate-400 mb-0.5">Aap (User)</p>
                      <p className="text-slate-100 text-xs">Yaar, inflation (mehengai) meri cash savings ko kaise nuksan pahunchati hai?</p>
                    </div>
                  </div>

                  {/* Bubble 2: AI Coach */}
                  <div className="flex justify-start animate-fade-in-up stagger-1">
                    <div className="max-w-[90%] rounded-lg rounded-tl-none px-7 py-6 bg-emerald-500/10 text-slate-200 border border-emerald-500/20">
                      <p className="font-semibold text-[10px] text-emerald-400 mb-0.5">Maali Mentor</p>
                      <p className="text-slate-100 text-xs">Aasan lafzon mein: agar saalana inflation 15% hai, to aap ke paas rakha 1,000 rupya agle saal sirf 850 rupay ki cheezein khareed sakega. Purchasing power kam ho jati hai!</p>
                    </div>
                  </div>

                  {/* Audio Waveform Animation */}
                  <div className="flex items-center justify-center gap-1.5 pt-4 pb-2 border-t border-white/5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
                      const heights = ["h-3", "h-6", "h-8", "h-5", "h-9", "h-4", "h-7", "h-5", "h-8", "h-3", "h-6", "h-4", "h-7", "h-5", "h-3"];
                      const delay = `${(i * 0.08).toFixed(2)}s`;
                      return (
                        <div
                          key={i}
                          className={`w-[3px] ${heights[i - 1]} bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-none waveform-bar`}
                          style={{ animationDelay: delay }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Footer Assistant Orb */}
                <div className="px-6 py-5 border-t border-white/5 bg-slate-900/30 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Audio playback active</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/5 cursor-pointer hover:bg-emerald-500/20 transition-all">
                    <Mic size={16} className="text-emerald-400" />
                  </div>
                </div>

              </GlassCard>
            </div>
          </div>

        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="relative z-10 px-6 py-36 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center max-w-lg mx-auto mb-24 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Core Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            AI voice lessons se lekar interactive quizzes aur practical financial games tak, humne sab aik jagah jama kiya hai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
          {features.map((feature) => (
             <GlassCard
              key={feature.title}
              className="group cursor-default p-10 md:p-12 flex flex-col justify-between min-h-[420px] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-3xl blur-2xl pointer-events-none group-hover:scale-125 transition-transform" style={{ background: feature.glow }} />
              <div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md`}
                >
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-0.5">{feature.title}</h3>
                <p className="text-xs font-semibold text-emerald-400/90 font-urdu mb-3" dir="rtl">
                  {feature.urdu}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400/90">
                Explore Module <ChevronRight size={14} />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Interactive Financial Trivia Widget */}
      <section id="trivia" className="relative z-10 px-6 py-28 max-w-5xl mx-auto">
        <GlassCard className="p-12 md:p-16 border border-white/5 bg-slate-900/10 backdrop-blur-xl relative overflow-hidden" hover={false}>
          
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-3xl blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Brain size={20} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                Apni Financial IQ Test Karein!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Pakistan mein mehengai aur sarmayakari ke rules samajhna asan nahi hai. Niche diye gaye sawal ka jawab de kar apna concept check karein.
              </p>
            </div>

            <div className="md:col-span-6">
              <div className="p-9 rounded-xl bg-slate-950/70 border border-white/5 space-y-6 text-xs sm:text-sm">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">PAKISTAN TRIVIA</span>
                <p className="font-bold text-slate-200">
                  Q: Agar mulk mein inflation (mehengai) 20% saalana ho, to paise ki value barhane ka sahi tareeqa kya hai?
                </p>
                
                <div className="space-y-2">
                  <button
                    disabled={showTriviaResult}
                    onClick={() => handleTriviaAnswer("a")}
                    className={`w-full text-left py-5 px-8 rounded-lg border text-xs transition-all ${
                      triviaOption === "a"
                        ? "border-rose-500 bg-rose-500/10 text-white"
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    A) Paise ko cash ya locker mein rakhna
                  </button>
                  <button
                    disabled={showTriviaResult}
                    onClick={() => handleTriviaAnswer("b")}
                    className={`w-full text-left py-5 px-8 rounded-lg border text-xs transition-all ${
                      triviaOption === "b"
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    B) Mutual funds, gold ya stock market mein invest karna
                  </button>
                  <button
                    disabled={showTriviaResult}
                    onClick={() => handleTriviaAnswer("c")}
                    className={`w-full text-left py-5 px-8 rounded-lg border text-xs transition-all ${
                      triviaOption === "c"
                        ? "border-rose-500 bg-rose-500/10 text-white"
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    C) Saare paise furan zaroori aur ghair-zaroori cheezon mein kharach karna
                  </button>
                </div>

                {showTriviaResult && (
                  <div className="pt-3 border-t border-white/5 animate-fade-in text-xs space-y-2">
                    {triviaOption === "b" ? (
                      <div className="flex items-start gap-2 text-emerald-400">
                        <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <p><strong>Sahi Jawab!</strong> Sarmayakari (investing) hi aik legal zariya hai jis se aap ka return inflation rate se barh sakta hai, taake purchasing power barqarar rahe.</p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-rose-400">
                        <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <p><strong>Ghalt Jawab!</strong> Sahi jawab <strong>B</strong> hai. Cash locker mein rakhne se uski value mehengai ki wajah se mazeed kam ho jayegi.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </GlassCard>
      </section>

      {/* Learning Timeline Path */}
      <section id="how-it-works" className="relative z-10 px-6 py-36 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center max-w-lg mx-auto mb-24 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Maali Mentor par seekhne aur rank barhane ka safar intehayi asaan aur structured hai.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {index < 3 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[1px] bg-gradient-to-r from-emerald-500/20 to-transparent z-0 -translate-x-6" />
              )}
              <GlassCard className="p-10 h-full border border-white/5 bg-slate-900/30 backdrop-blur-md rounded-2xl flex flex-col justify-between group-hover:border-emerald-500/20 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-extrabold text-slate-800 group-hover:text-emerald-500/20 transition-colors duration-300">
                      {step.number}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-white/5 ${step.color}`}>
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-0.5">{step.title}</h3>
                  <p className="text-xs font-semibold text-emerald-400 font-urdu" dir="rtl">
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

      {/* Stats Section */}
      <section id="stats" className="relative z-10 px-6 pb-36 max-w-5xl mx-auto">
        <GlassCard className="!p-0 overflow-hidden border border-white/5 bg-slate-900/10 backdrop-blur-xl" hover={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-20 px-12"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 mb-3">
                  <stat.icon size={22} className="text-emerald-400" />
                </div>
                <span className="text-3xl font-extrabold gradient-text tracking-tight">{stat.value}</span>
                <span className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-20 border-t border-white/5 max-w-6xl mx-auto px-6 space-y-4">
        <p className="text-xs sm:text-sm text-slate-400">
          © 2026 Maali Mentor — مالی مینٹر. Built for Pakistan 🇵🇰
        </p>
        <p className="text-[10px] text-slate-400">
          Empowering financial literacy through customized Roman Urdu learning modules.
        </p>
      </footer>
    </main>
  );
}

// XCircle placeholder helper
function XCircle({ size, className }: { size: number; className?: string }) {
  return <XCircleIcon className={className} size={size} />;
}

// Minimal inline icons fallback
function XCircleIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
