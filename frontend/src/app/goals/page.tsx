"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Car,
  GraduationCap,
  Plane,
  Clock,
  Plus,
  Calculator,
  TrendingUp,
  Target,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import GlassCard from "@/components/GlassCard";
import ProgressRing from "@/components/ProgressRing";

const goalTypes = [
  { id: "ghar", label: "Ghar (House)", urdu: "گھر", icon: Home, color: "from-emerald-500 to-emerald-600" },
  { id: "gaari", label: "Gaari (Car)", urdu: "گاڑی", icon: Car, color: "from-blue-500 to-blue-600" },
  { id: "hajj", label: "Hajj", urdu: "حج", icon: Plane, color: "from-yellow-500 to-yellow-600" },
  { id: "taleem", label: "Bachon ki Taleem", urdu: "بچوں کی تعلیم", icon: GraduationCap, color: "from-purple-500 to-purple-600" },
  { id: "retirement", label: "Retirement", urdu: "ریٹائرمنٹ", icon: Clock, color: "from-cyan-500 to-cyan-600" },
];

const riskLevels = [
  { id: "low", label: "Low (Kam)", desc: "Bank deposits, govt bonds" },
  { id: "moderate", label: "Moderate (Darmiyana)", desc: "Mutual funds, balanced portfolio" },
  { id: "high", label: "High (Zyada)", desc: "Stocks, equity mutual funds" },
];

interface Goal {
  id: string;
  type: string;
  target: number;
  timeline: number;
  risk: string;
  saved: number;
  futureCost: number;
  monthlyNeeded: number;
  products: string[];
}

export default function GoalsPage() {
  const [userId, setUserId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [risk, setRisk] = useState("moderate");
  const [loading, setLoading] = useState(false);
  
  const [result, setResult] = useState<{
    futureCost: number;
    monthlyNeeded: number;
    products: string[];
  } | null>(null);
  
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("user_id");
      if (storedId) {
        setUserId(parseInt(storedId));
      }
    }
  }, []);

  // Fetch existing goals
  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/goals/${userId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Map backend goals to frontend display format
        const mapped = data.map((g: any) => {
          // Calculate inflation future cost for display locally
          const years = g.target_years;
          const inflationRate = 0.15;
          const futureCost = g.target_amount * Math.pow(1 + inflationRate, years);
          
          // Re-calculate monthly saving needed based on standard returns
          const returnRates: Record<string, number> = { low: 0.08, moderate: 0.12, high: 0.16 };
          const r = returnRates[g.risk_tolerance] / 12;
          const n = years * 12;
          const monthlyNeeded = Math.round((futureCost * r) / (Math.pow(1 + r, n) - 1));

          const productMap: Record<string, string[]> = {
            low: ["National Savings Certificates", "Meezan Bank Savings Account"],
            moderate: ["Al Meezan Islamic Fund", "Faysal Funds Balanced"],
            high: ["KSE-100 Index Fund", "Alfalah GHP Stock Fund"],
          };

          return {
            id: g.id.toString(),
            type: g.goal_type,
            target: g.target_amount,
            timeline: g.target_years,
            risk: g.risk_tolerance,
            saved: g.current_savings,
            futureCost: Math.round(futureCost),
            monthlyNeeded: Math.round(monthlyNeeded),
            products: productMap[g.risk_tolerance] || ["Savings Certificates"],
          };
        });
        setGoals(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  };

  const calculate = async () => {
    const target = parseFloat(targetAmount);
    const years = parseInt(timeline);
    if (!target || !years || !selectedType) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/goals/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_amount: target,
          target_years: years,
          risk_tolerance: risk,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          futureCost: data.future_target_amount,
          monthlyNeeded: data.monthly_saving_needed,
          products: data.suggested_products.map((p: any) => p.name),
        });
      }
    } catch (err) {
      console.error("Calculation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!result || !selectedType) return;

    try {
      const res = await fetch("http://localhost:8000/api/goals/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          goal_type: selectedType,
          target_amount: parseFloat(targetAmount),
          target_years: parseInt(timeline),
          risk_tolerance: risk,
        }),
      });

      if (res.ok) {
        fetchGoals();
        setShowForm(false);
        setResult(null);
        setSelectedType("");
        setTargetAmount("");
        setTimeline("");
      }
    } catch (err) {
      console.error("Failed to save goal:", err);
    }
  };

  const getGoalType = (id: string) => goalTypes.find((g) => g.id === id);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">
              Goals — <span className="text-slate-400">مقاصد</span>
            </h1>
            <p className="text-sm text-slate-400">Apne financial maqasid plan karein</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="glow-btn flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Naya Maqsad
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto">
          {/* New Goal Form */}
          {showForm && (
            <GlassCard className="mb-8 animate-scale-in" hover={false}>
              <h2 className="text-lg font-bold text-white mb-6">
                Naya Maqsad — <span className="text-slate-400">نیا مقصد</span>
              </h2>

              {/* Goal Type Selector */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-3 block">Goal Type — مقصد کی قسم</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {goalTypes.map((type) => {
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-250
                          ${
                            isSelected
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-2`}>
                          <type.icon size={18} className="text-white" />
                        </div>
                        <span className={`text-xs font-medium ${isSelected ? "text-emerald-400" : "text-white"}`}>
                          {type.label}
                        </span>
                        <span className="text-[10px] text-slate-500" dir="rtl">{type.urdu}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Amount & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2.5 block">Target Amount (PKR) — کل رقم (روپے)</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-base focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2.5 block">Timeline (Years) — مدت (سال)</label>
                  <input
                    type="number"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-base focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-3 block">Risk Tolerance — خطرے کی برداشت</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {riskLevels.map((level) => {
                    const isSelected = risk === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => setRisk(level.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-250
                          ${
                            isSelected
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                          {level.label}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculate}
                disabled={!selectedType || !targetAmount || !timeline || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedType && targetAmount && timeline && !loading
                    ? "glow-btn"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Calculator size={16} />
                {loading ? "Calculating..." : "Calculate"}
              </button>

              {/* Results */}
              {result && (
                <div className="mt-6 p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-scale-in">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-400" />
                    Calculation Results (Inflation @ 15%)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-slate-400 mb-1">Future Cost (Inflation Adjusted)</p>
                      <p className="text-xl font-bold text-white">
                        PKR {result.futureCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-slate-400 mb-1">Monthly Savings Needed</p>
                      <p className="text-xl font-bold text-emerald-400">
                        PKR {result.monthlyNeeded.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Suggested Pakistani Financial Products:</p>
                    <ul className="space-y-1">
                      {result.products.map((p) => (
                        <li key={p} className="text-sm text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={addGoal} className="glow-btn mt-4 text-sm px-5 py-2">
                    Save Goal
                  </button>
                </div>
              )}
            </GlassCard>
          )}

          {/* Existing Goals */}
          <h2 className="text-lg font-bold text-white mb-4">
            Aapke Maqasid — <span className="text-slate-400">آپ کے مقاصد</span>
          </h2>

          {goals.length === 0 ? (
            <GlassCard className="text-center !py-16" hover={false}>
              <Target size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                Abhi koi maqsad nahi hai. Naya maqsad banayein!
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const goalType = getGoalType(goal.type);
                const percentage = Math.min(Math.round((goal.saved / goal.futureCost) * 100), 100);

                return (
                  <GlassCard key={goal.id} className="animate-fade-in-up">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {goalType && (
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goalType.color} flex items-center justify-center`}>
                            <goalType.icon size={22} className="text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-bold text-white">{goalType?.label}</h3>
                          <p className="text-xs text-slate-500">{goal.timeline} years • {goal.risk} risk</p>
                        </div>
                      </div>
                      <ProgressRing value={percentage} max={100} size={56} strokeWidth={5}>
                        <span className="text-xs font-bold text-white">{percentage}%</span>
                      </ProgressRing>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Target Today:</span>
                        <span className="text-white font-medium">PKR {goal.target.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Future Cost (Adjusted):</span>
                        <span className="text-yellow-400 font-medium">PKR {goal.futureCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Saved:</span>
                        <span className="text-emerald-400 font-medium">PKR {goal.saved.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Monthly Needed:</span>
                        <span className="text-cyan-400 font-medium">PKR {goal.monthlyNeeded.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="progress-bar mb-3">
                      <div className="progress-fill" style={{ width: `${percentage}%` }} />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {goal.products.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400 border border-white/5">
                          {p}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
