"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Play,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Lock,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import GlassCard from "@/components/GlassCard";
import ProgressRing from "@/components/ProgressRing";
import ConceptBadge from "@/components/ConceptBadge";

interface DashboardData {
  user_id: number;
  username: string;
  user_level: string;
  current_level: number;
  current_xp: number;
  concept_mastery: { concept_name: string; mastery_score: number }[];
  goals: any[];
}

const conceptMetadata: Record<string, { urdu: string; icon: string }> = {
  budgeting: { urdu: "بجٹ کے اصول", icon: "📊" },
  saving: { urdu: "بچت کی عادت", icon: "🏦" },
  emergency_funds: { urdu: "ایمرجنسی فنڈ", icon: "🛡️" },
  inflation: { urdu: "مہنگائی کا اثر", icon: "📈" },
  investing: { urdu: "سرمایہ کاری", icon: "💹" },
  mutual_funds: { urdu: "میوچل فنڈز", icon: "📋" },
  islamic_banking: { urdu: "اسلامی بینکاری", icon: "🕌" },
  stock_market: { urdu: "اسٹاک مارکیٹ", icon: "📈" },
  diversification: { urdu: "تنوع (Diversification)", icon: "🎯" },
  tax_filer: { urdu: "ٹیکس فائلنگ اور پلاننگ", icon: "📄" },
};

const flowNodes = [
  { id: "budgeting", label: "Budgeting Basics", prereqs: [] },
  { id: "saving", label: "Saving Habits", prereqs: ["budgeting"] },
  { id: "emergency_funds", label: "Emergency Funds", prereqs: ["saving"] },
  { id: "inflation", label: "Inflation & Money", prereqs: ["saving"] },
  { id: "investing", label: "Investing Principles", prereqs: ["inflation"] },
  { id: "mutual_funds", label: "Mutual Funds", prereqs: ["investing"] },
  { id: "islamic_banking", label: "Islamic Banking", prereqs: ["mutual_funds"] },
  { id: "stock_market", label: "Stock Market", prereqs: ["mutual_funds"] },
  { id: "diversification", label: "Diversification", prereqs: ["investing"] },
  { id: "tax_filer", label: "Tax Planning & Filer", prereqs: ["stock_market"] },
];

const recentActivity = [
  { text: "Maali Mentor onboarding mukammal ki", time: "Abhi", icon: Award },
  { text: "Concept check: Budgeting Basics", time: "10 mins pehle", icon: BookOpen },
  { text: "Simulator: Starting cash allocated", time: "30 mins pehle", icon: Play },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const userId = localStorage.getItem("user_id") || "1";
      try {
        const res = await fetch(`http://localhost:8000/api/auth/dashboard/${userId}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Dashboard API error, loading mock data:", err);
      }

      // Fallback mock data if fetch fails or throws an exception
      setData({
        user_id: parseInt(userId),
        username: localStorage.getItem("username") || "Ahmed",
        user_level: localStorage.getItem("user_level") || "Beginner",
        current_level: parseInt(localStorage.getItem("current_level") || "1"),
        current_xp: 150,
        concept_mastery: [
          { concept_name: "budgeting", mastery_score: 75 },
          { concept_name: "saving", mastery_score: 65 },
          { concept_name: "emergency_funds", mastery_score: 30 },
          { concept_name: "inflation", mastery_score: 10 },
          { concept_name: "investing", mastery_score: 0 },
          { concept_name: "mutual_funds", mastery_score: 0 },
          { concept_name: "islamic_banking", mastery_score: 0 },
          { concept_name: "stock_market", mastery_score: 0 },
          { concept_name: "diversification", mastery_score: 0 },
          { concept_name: "tax_filer", mastery_score: 0 },
        ],
        goals: [],
      });
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-white text-lg animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Calculate overall Financial IQ based on mastery scores (max 1000)
  const totalMastery = data.concept_mastery.reduce((sum, item) => sum + item.mastery_score, 0);
  const maxPossibleMastery = data.concept_mastery.length * 100 || 900;
  const financialIQ = Math.round((totalMastery / maxPossibleMastery) * 1000) || 100;

  // Level names
  const levelNames: Record<number, string> = {
    1: "Bachat Rookie",
    2: "Saving Sentinel",
    3: "Emergency Expert",
    4: "Inflation Fighter",
    5: "Investing Apprentice",
    6: "Mutual Fund Navigator",
    7: "Shariah Finance Scholar",
    8: "Stock Explorer",
    9: "Risk Master",
    10: "Maali Master",
  };

  const currentLevel = data.current_level || 1;
  const levelName = levelNames[currentLevel] || "Finance Learner";

  // Graph state lookup
  const scores = data.concept_mastery.reduce((acc, curr) => {
    acc[curr.concept_name] = curr.mastery_score;
    return acc;
  }, {} as Record<string, number>);

  const conceptToLevel: Record<string, number> = {
    budgeting: 1,
    saving: 2,
    emergency_funds: 3,
    inflation: 4,
    investing: 5,
    mutual_funds: 6,
    islamic_banking: 7,
    stock_market: 8,
    diversification: 9,
    tax_filer: 10,
  };

  const getConceptStatus = (conceptId: string) => {
    const score = scores[conceptId] || 0;
    const nodeLevel = conceptToLevel[conceptId] || 1;

    // Mastered if score is >= 60 OR the user's current level is past this node's level
    if (score >= 60 || currentLevel > nodeLevel) {
      return "mastered";
    }

    // Unlocked if it is the current active level
    if (nodeLevel === currentLevel) {
      return "unlocked";
    }

    // Unlocked if it is a future level within the 3-level buffer AND not part of the last 3 linear levels (8, 9, 10)
    if (nodeLevel > currentLevel && nodeLevel <= currentLevel + 2 && nodeLevel < 8) {
      return "unlocked";
    }

    return "locked";
  };

  const renderNode = (conceptId: string) => {
    const node = flowNodes.find((n) => n.id === conceptId);
    if (!node) return null;
    const meta = conceptMetadata[conceptId] || { urdu: "", icon: "📖" };
    const score = scores[conceptId] || 0;
    const status = getConceptStatus(conceptId);

    let borderClass = "border-white/5 bg-slate-900/40 text-slate-400 opacity-60";
    let statusBadge = null;
    let cursorClass = "cursor-not-allowed";

    if (status === "mastered") {
      borderClass = "border-emerald-500/40 bg-emerald-500/5 text-slate-200 shadow-md shadow-emerald-500/5 hover:border-emerald-500/60";
      statusBadge = (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
          Mastered
        </span>
      );
      cursorClass = "cursor-pointer";
    } else if (status === "unlocked") {
      borderClass = "border-cyan-500/40 bg-cyan-500/5 text-slate-200 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/60 ring-2 ring-cyan-500/10 animate-pulse-glow";
      statusBadge = (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold">
          Study
        </span>
      );
      cursorClass = "cursor-pointer";
    } else {
      statusBadge = (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center gap-1 border border-white/5">
          <Lock size={8} /> Locked
        </span>
      );
    }

    const handleClick = () => {
      if (status !== "locked") {
        window.location.href = `/study?concept=${conceptId}`;
      }
    };

    return (
      <div
        onClick={handleClick}
        className={`relative w-full max-w-[200px] p-4 rounded-xl border text-center transition-all duration-300 hover:scale-[1.02] ${borderClass} ${cursorClass}`}
      >
        {statusBadge}
        <div className="text-xl mb-1">{meta.icon}</div>
        <h4 className="text-xs sm:text-sm font-bold truncate">{node.label}</h4>
        <p className="text-[10px] sm:text-xs text-slate-400 font-urdu mt-0.5" dir="rtl">
          {meta.urdu}
        </p>
        {status !== "locked" && (
          <div className="mt-2 text-[10px] font-semibold text-slate-500">
            Mastery: <span className={status === "mastered" ? "text-emerald-400" : "text-cyan-400"}>{score}%</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Assalam-o-Alaikum, <span className="gradient-text">{data.username}</span>!
            </h1>
            <p className="text-sm text-slate-400">
              Aaj apni financial journey continue karein
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Zap size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">
                {data.current_xp} XP
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              {data.username[0]?.toUpperCase() || "M"}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto">
          {/* Row 1: IQ Score + XP + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Financial IQ Score */}
            <GlassCard className="flex flex-col items-center justify-center" glow>
              <h3 className="text-sm font-medium text-slate-400 mb-4">Financial IQ Score</h3>
              <ProgressRing value={financialIQ} max={1000} size={180} strokeWidth={12}>
                <span className="text-4xl font-extrabold gradient-text">{financialIQ}</span>
                <span className="text-sm text-slate-400 mt-1">/ 1000</span>
              </ProgressRing>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">Bachat aur mehengai seekhein</span>
              </div>
            </GlassCard>

            {/* XP Progress */}
            <GlassCard>
              <h3 className="text-sm font-medium text-slate-400 mb-3">Level Progress</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  {currentLevel}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{levelName}</p>
                  <p className="text-sm text-slate-400">Level {currentLevel} of 10</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">{data.current_xp} XP</span>
                  <span className="text-emerald-400 font-medium">Rank {currentLevel}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(currentLevel / 10) * 100}%` }} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Agla rank barhane ke liye Level {currentLevel} ka quiz pass karein
              </p>

              {/* Mini badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">
                  🏆 Level {currentLevel}
                </span>
                <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                  ✅ Active Coach
                </span>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard>
              <h3 className="text-sm font-medium text-slate-400 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {currentLevel <= 10 && (
                  <a
                    href={`/quiz?level=${currentLevel}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center group-hover:bg-yellow-500/25 transition-colors">
                      <Award size={18} className="text-yellow-400 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">Take Level {currentLevel} Quiz</span>
                      <p className="text-xs text-slate-400">Level up karne ke liye pass karein</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
                  </a>
                )}

                <a
                  href="/tutor"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
                    <BookOpen size={18} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white">Start Lesson</span>
                    <p className="text-xs text-slate-500">Naya lesson shuru karein</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
                <a
                  href="/simulator"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
                    <Play size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white">Run Simulator</span>
                    <p className="text-xs text-slate-500">Life simulator chalayein</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </a>
                <a
                  href="/goals"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                    <Target size={18} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white">Set Goal</span>
                    <p className="text-xs text-slate-500">Naya maqsad set karein</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                </a>
              </div>
            </GlassCard>
          </div>

          {/* Learning Flow Graph */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">
              Learning Flow Graph — <span className="text-slate-400">سیکھنے کا خاکہ</span>
            </h2>
            <GlassCard hover={false} className="p-6 md:p-8 bg-slate-900/30 backdrop-blur-md border border-white/5">
              <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto">
                {/* Level 1 */}
                <div className="flex justify-center w-full">{renderNode("budgeting")}</div>

                {/* Line Down */}
                <div className="w-[2px] h-6 bg-emerald-500/30" />

                {/* Level 2 */}
                <div className="flex justify-center w-full">{renderNode("saving")}</div>

                {/* Line Down */}
                <div className="w-[2px] h-6 bg-emerald-500/30" />

                {/* Level 3 */}
                <div className="flex justify-center w-full">{renderNode("emergency_funds")}</div>

                {/* Line Down */}
                <div className="w-[2px] h-6 bg-emerald-500/30" />

                {/* Level 4 */}
                <div className="flex justify-center w-full">{renderNode("inflation")}</div>

                {/* Line Down */}
                <div className="w-[2px] h-6 bg-emerald-500/30" />

                {/* Level 5 */}
                <div className="flex justify-center w-full">{renderNode("investing")}</div>

                {/* Split Lines Down */}
                <div className="w-full max-w-md h-8 relative">
                  <svg className="w-full h-full text-emerald-500/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 50,0 L 50,30 L 15,30 L 15,100 M 50,30 L 85,30 L 85,100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
                  </svg>
                </div>

                {/* Level 6 & 7 */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                  <div className="flex justify-center flex-col items-center">
                    {renderNode("mutual_funds")}
                    <div className="w-[2px] h-6 bg-emerald-500/30 mt-4" />
                  </div>
                  <div className="flex justify-center">{renderNode("islamic_banking")}</div>
                </div>

                {/* Level 8 */}
                <div className="flex justify-center w-full">{renderNode("stock_market")}</div>

                {/* Line Down */}
                <div className="w-[2px] h-6 bg-emerald-500/30" />

                {/* Level 9 */}
                <div className="flex justify-center w-full">{renderNode("diversification")}</div>

                {/* Line Down */}
                <div className="w-[2px] h-6 bg-emerald-500/30" />

                {/* Level 10 */}
                <div className="flex justify-center w-full">{renderNode("tax_filer")}</div>
              </div>
            </GlassCard>
          </div>

          {/* Row 2: Concept Mastery Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">
              Concept Mastery Details — <span className="text-slate-400">موضوعات کی تفصیلات</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.concept_mastery.map((item) => {
                const meta = conceptMetadata[item.concept_name] || { urdu: "مہارت", icon: "📖" };
                const formattedName = item.concept_name
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                return (
                  <GlassCard key={item.concept_name} className="!p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{formattedName}</h4>
                          <p className="text-xs text-slate-500" dir="rtl">{meta.urdu}</p>
                        </div>
                      </div>
                      <ConceptBadge name={`${item.mastery_score}%`} mastery={item.mastery_score} />
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.mastery_score}%` }}
                      />
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Row 3: Recent Activity / Goals Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                Recent Activity — <span className="text-slate-400">حالیہ سرگرمی</span>
              </h2>
              <GlassCard hover={false} className="!p-0 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <activity.icon size={18} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{activity.text}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                        <Clock size={12} />
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                Active Goals — <span className="text-slate-400">سرگرم مقاصد</span>
              </h2>
              <GlassCard hover={false} className="flex flex-col justify-center min-h-[220px]">
                {data.goals.length === 0 ? (
                  <div className="text-center p-6">
                    <Target size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm mb-4">Koi saved goal nahi mila.</p>
                    <a href="/goals" className="glow-btn text-xs px-4 py-2 inline-block">
                      Naya Goal Banayein
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4 w-full px-6">
                    {data.goals.slice(0, 2).map((g) => (
                      <div key={g.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-white capitalize">{g.goal_type}</span>
                          <span className="text-xs text-emerald-400">Target: PKR {g.target_amount.toLocaleString()}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.round((g.current_savings / g.target_amount) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
