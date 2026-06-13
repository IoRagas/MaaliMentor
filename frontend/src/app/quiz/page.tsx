"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import GlassCard from "@/components/GlassCard";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  BookOpen,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trophy,
} from "lucide-react";

interface Question {
  id: number;
  level: number;
  question: string;
  options: Record<string, string>;
}

interface DetailResult {
  question_id: number;
  correct_option: string;
  explanation: string;
  is_correct: boolean;
}

interface QuizResult {
  score: number;
  passed: boolean;
  current_level: number;
  details: DetailResult[];
}

const levelTitles: Record<number, string> = {
  1: "Budgeting Basics (بجٹ کے اصول)",
  2: "Saving Habits (بچت کی عادت)",
  3: "Emergency Funds (ایمرجنسی فنڈ)",
  4: "Inflation & Purchasing Power (مہنگائی کا اثر)",
  5: "Investing Principles (سرمایہ کاری)",
  6: "Mutual Funds (میوچل فنڈز)",
  7: "Islamic Banking & Finance (اسلامی بینکاری)",
  8: "Stock Market & Shares (اسٹاک مارکیٹ)",
  9: "Diversification & Risk (تنوع)",
  10: "Advanced Planning & Filer System (ٹیکس فائلنگ)",
};

export default function QuizPage() {
  const [level, setLevel] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<QuizResult | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});

  // Parse level parameter from window.location
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const levelParam = params.get("level");
      if (levelParam) {
        setLevel(parseInt(levelParam));
      } else {
        const storedLevel = localStorage.getItem("current_level") || "1";
        setLevel(parseInt(storedLevel));
      }
    }
  }, []);

  // Fetch questions when level is determined
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/quiz/questions/${level}`);
        if (!res.ok) {
          throw new Error(`Failed to load questions for Level ${level}.`);
        }
        const data = await res.json();
        setQuestions(data);
      } catch (err: any) {
        console.error("Quiz questions error:", err);
        setError(err.message || "Failed to fetch quiz questions. Please check your backend connection.");
      } finally {
        setLoading(false);
      }
    };

    if (level) {
      fetchQuestions();
    }
  }, [level]);

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = confirm(
        `Aap ne 20 mein se sirf ${answeredCount} sawalat ke jawab diye hain. Kya aap phir bhi submit karna chahte hain?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const answersPayload = questions.map((q) => ({
        question_id: q.id,
        selected_option: selectedAnswers[q.id] || "a", // default choice fallback
      }));

      const res = await fetch("http://localhost:8000/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          level: level,
          answers: answersPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Grading submission failed. Please try again.");
      }

      const resData = await res.json();
      setResults(resData);

      if (resData.passed) {
        localStorage.setItem("current_level", resData.current_level.toString());
      }
    } catch (err: any) {
      console.error("Quiz submission error:", err);
      setError(err.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResults(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setExpandedDetails({});
  };

  const toggleExplanation = (questionId: number) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <p className="text-lg animate-pulse">Quiz questions load ho rahe hain...</p>
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 text-white">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
          <p className="text-xl font-bold mb-2">Error Occurred</p>
          <p className="text-slate-400 text-center max-w-md mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold"
          >
            <RefreshCw size={16} /> Dobara load karein
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = (answeredCount / questions.length) * 100;
  const quizTitle = levelTitles[level] || "Financial Concept Quiz";

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Award className="text-yellow-500 animate-pulse" size={20} />
              Level {level} Quiz
            </h1>
            <p className="text-xs md:text-sm text-slate-400">{quizTitle}</p>
          </div>
          <a
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Wapis Dashboard
          </a>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 overflow-y-auto">
          {!results ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Question Navigation Map */}
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Quiz Progress</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {answeredCount} / {questions.length} Answered
                  </span>
                </div>
                <div className="progress-bar mb-4">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? "bg-emerald-500 text-slate-950 font-extrabold ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-md shadow-emerald-500/20"
                            : isAnswered
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-900/50 text-slate-500 border border-white/5 hover:border-white/10"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Question Display Card */}
              {currentQuestion && (
                <GlassCard key={currentQuestion.id} className="p-6 md:p-8 animate-fade-in-up" glow>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-400 text-xs border border-white/5">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className="text-xs text-slate-500">ID: #{currentQuestion.id}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-3 mb-8">
                    {Object.entries(currentQuestion.options).map(([key, text]) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectOption(currentQuestion.id, key)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/5"
                              : "border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20 hover:bg-slate-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSelected ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-400"
                              }`}
                            >
                              {key.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium">{text}</span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-slate-600"
                            }`}
                          >
                            {isSelected && <CheckCircle size={12} className="stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer Navigation Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
                    >
                      <ArrowLeft size={16} /> Pichla Sawal
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
                      >
                        Agla Sawal <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Submission...
                          </>
                        ) : (
                          <>
                            Submit Quiz <Award size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          ) : (
            /* Results Panel */
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <GlassCard
                className={`p-8 text-center relative overflow-hidden border ${
                  results.passed
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-rose-500/30 bg-rose-500/5"
                }`}
                glow
              >
                {results.passed && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent" />
                )}

                {results.passed ? (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 ring-4 ring-emerald-500/10">
                    <Trophy size={32} className="animate-bounce" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mb-4 ring-4 ring-rose-500/10">
                    <AlertCircle size={32} className="animate-bounce" />
                  </div>
                )}

                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white">
                  {results.passed ? "Mubarak Ho! Aap Pass Hogaye 🎉" : "Koshish Naa Chhodein! 🥺"}
                </h2>

                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                  {results.passed
                    ? `Aap ne Level ${level} ka quiz pass kar liya hai aur naya rank hasil kar liya hai! Ab aap Level ${results.current_level} par hain.`
                    : "Quiz pass karne ke liye 20 mein se kam az kam 15 sahi jawab (75%) hona lazmi hai. Jawabon ki tafseelat niche mulahiza karein aur dobara koshish karein."}
                </p>

                {/* Score Indicator */}
                <div className="inline-flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-white/5 mb-6 min-w-[150px]">
                  <span className="text-4xl font-extrabold text-white">{results.score}</span>
                  <span className="text-xs text-slate-500 mt-1">out of 20 ({(results.score / 20) * 100}%)</span>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="/dashboard"
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
                  >
                    Dashboard par jayein
                  </a>
                  {!results.passed ? (
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all text-sm"
                    >
                      <RefreshCw size={16} /> Dobara Koshish
                    </button>
                  ) : (
                    results.current_level <= 10 && (
                      <button
                        onClick={() => {
                          setLevel(results.current_level);
                          setResults(null);
                          setSelectedAnswers({});
                          setCurrentIndex(0);
                          setExpandedDetails({});
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all text-sm"
                      >
                        Next Level Quiz <ChevronRight size={16} />
                      </button>
                    )
                  )}
                </div>
              </GlassCard>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Quiz Explanation & Review</h3>
                {results.details.map((detail, idx) => {
                  const isExpanded = expandedDetails[detail.question_id] || false;
                  // Look up original question text
                  const origQ = questions.find((q) => q.id === detail.question_id);
                  const questionText = origQ ? origQ.question : `Sawalat #${detail.question_id}`;
                  const userChoice = selectedAnswers[detail.question_id];
                  const userChoiceText = origQ && userChoice ? origQ.options[userChoice] : "N/A";
                  const correctChoiceText = origQ ? origQ.options[detail.correct_option] : "N/A";

                  return (
                    <GlassCard key={detail.question_id} className="!p-4 bg-slate-900/30">
                      <div
                        onClick={() => toggleExplanation(detail.question_id)}
                        className="flex items-start justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {detail.is_correct ? (
                              <CheckCircle className="text-emerald-400 flex-shrink-0" size={18} />
                            ) : (
                              <XCircle className="text-rose-400 flex-shrink-0" size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">
                              Sawal {idx + 1}: <span className="font-normal text-slate-300">{questionText}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Aap ka jawab:{" "}
                              <span className={detail.is_correct ? "text-emerald-400" : "text-rose-400"}>
                                {userChoice ? `(${userChoice.toUpperCase()}) ${userChoiceText}` : "Kuch nahi"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expandable Explanation Block */}
                      {isExpanded && (
                        <div className="mt-3 pl-8 pt-3 border-t border-white/5 space-y-2 animate-fade-in">
                          <p className="text-xs text-slate-400">
                            Sahi jawab:{" "}
                            <span className="text-emerald-400 font-semibold">
                              ({detail.correct_option.toUpperCase()}) {correctChoiceText}
                            </span>
                          </p>
                          <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5">
                            <p className="text-xs text-slate-400 font-semibold mb-1">Tashreeh (Explanation):</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-urdu" dir="rtl">
                              {detail.explanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
