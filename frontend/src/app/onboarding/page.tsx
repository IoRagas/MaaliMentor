"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles, User } from "lucide-react";
import GlassCard from "@/components/GlassCard";

interface StepData {
  id: number;
  question: string;
  questionUrdu: string;
  options?: { label: string; labelUrdu: string; value: string }[];
  isInput?: boolean;
}

const steps: StepData[] = [
  {
    id: 0,
    question: "Aap ka naam kya hai?",
    questionUrdu: "آپ کا نام کیا ہے؟",
    isInput: true,
  },
  {
    id: 1,
    question: "Aap ko 'inflation' (mehengai) ka matlab pata hai?",
    questionUrdu: "کیا آپ کو 'انفلیشن' (مہنگائی) کا مطلب معلوم ہے؟",
    options: [
      { label: "Bilkul nahi", labelUrdu: "بالکل نہیں", value: "a" },
      { label: "Suna hai lekin samajh nahi aata", labelUrdu: "سنا ہے لیکن سمجھ نہیں آتا", value: "b" },
      { label: "Thora bohat samajhta hoon", labelUrdu: "تھوڑا بہت سمجھتا/سمجھتی ہوں", value: "c" },
      { label: "Achi tarah samajhta hoon", labelUrdu: "اچھی طرح سمجھتا/سمجھتی ہوں", value: "d" },
    ],
  },
  {
    id: 2,
    question: "Kya aap ne kabhi mutual funds ya shares mein invest kiya hai?",
    questionUrdu: "کیا آپ نے کبھی میوچل فنڈز یا شیئرز میں انویسٹ کیا ہے؟",
    options: [
      { label: "Nahi, kabhi nahi", labelUrdu: "نہیں، کبھی نہیں", value: "a" },
      { label: "Nahi, lekin karna chahta hoon", labelUrdu: "نہیں، لیکن کرنا چاہتا/چاہتی ہوں", value: "b" },
      { label: "Haan, thora bohat", labelUrdu: "ہاں، تھوڑا بہت", value: "c" },
      { label: "Haan, regularly", labelUrdu: "ہاں، مستقل طور پر", value: "d" },
    ],
  },
  {
    id: 3,
    question: "Aap apni monthly savings ka kitna hissa invest karte hain?",
    questionUrdu: "آپ اپنی ماہانہ بچت کا کتنا حصہ انویسٹ کرتے ہیں؟",
    options: [
      { label: "Kuch nahi — sab kharcha ho jata hai", labelUrdu: "کچھ نہیں — سب خرچ ہو جاتا ہے", value: "a" },
      { label: "Thora sa — bank mein rakh leta hoon", labelUrdu: "تھوڑا سا — بینک میں رکھ لیتا/لیتی ہوں", value: "b" },
      { label: "10-30% — savings account ya committee mein", labelUrdu: "10-30% — سیونگز اکاؤنٹ یا کمیٹی میں", value: "c" },
      { label: "30%+ — mutual funds, stocks, ya real estate", labelUrdu: "30%+ — میوچل فنڈز، اسٹاکس، یا رئیل اسٹیٹ", value: "d" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const selectOption = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const next = async () => {
    if (step.isInput && !username.trim()) return;
    if (!step.isInput && !answers[currentStep]) return;

    if (isLast) {
      setLoading(true);
      try {
        const payload = {
          username: username.trim(),
          email: `${username.trim().toLowerCase().replace(/\s+/g, "")}@example.com`,
          answers: [
            { question_id: 1, selected_option: answers[1] },
            { question_id: 2, selected_option: answers[2] },
            { question_id: 3, selected_option: answers[3] },
          ],
        };

        const res = await fetch("http://localhost:8000/api/auth/onboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("user_id", data.user_id.toString());
          localStorage.setItem("username", username.trim());
          localStorage.setItem("user_level", data.assigned_level);
          router.push("/dashboard");
        } else {
          console.error("Onboarding failed");
          // Fallback redirect
          localStorage.setItem("user_id", "1");
          localStorage.setItem("username", username.trim() || "Sarmayakar");
          localStorage.setItem("user_level", "Beginner");
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error communicating with backend:", err);
        // Fallback redirect
        localStorage.setItem("user_id", "1");
        localStorage.setItem("username", username.trim() || "Sarmayakar");
        localStorage.setItem("user_level", "Beginner");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prev = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  };

  const isNextDisabled = step.isInput ? !username.trim() : !answers[currentStep];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Maali Mentor</h1>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-emerald-400 font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-lg" key={currentStep}>
        <GlassCard className={`!p-8`} hover={false}>
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "bg-emerald-500 scale-125"
                    : i < currentStep
                    ? "bg-emerald-500/40"
                    : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed mb-2">
            {step.question}
          </h2>
          <p className="text-sm text-emerald-400/80 text-center mb-8" dir="rtl">
            {step.questionUrdu}
          </p>

          {/* Input or Options */}
          {step.isInput ? (
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                <User size={22} />
              </div>
              <input
                type="text"
                value={username}
                maxLength={20}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_\s\-]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && username.trim()) next();
                }}
                placeholder="Apna naam likhein (e.g. Ahmed)"
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-lg md:text-xl focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-250"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-3">
              {step.options?.map((option) => {
                const selected = answers[currentStep] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => selectOption(option.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-250 text-left group
                      ${
                        selected
                          ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                          ${
                            selected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-500 group-hover:border-slate-400"
                          }`}
                      >
                        {selected && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <span className={`font-medium ${selected ? "text-emerald-400" : "text-white"}`}>
                        {option.label}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400 font-urdu" dir="rtl">
                      {option.labelUrdu}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  currentStep === 0
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <ArrowLeft size={16} />
              Pichla
            </button>
            <button
              onClick={next}
              disabled={isNextDisabled || loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  !isNextDisabled && !loading
                    ? "glow-btn"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  {isLast ? "Shuru Karein" : "Agla"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
