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
import { apiUrl, fetchWithAuth } from "@/lib/api";

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
  const [isUrdu, setIsUrdu] = useState(false);
  
  const [result, setResult] = useState<{
    futureCost: number;
    monthlyNeeded: number;
    products: string[];
  } | null>(null);
  
  const [goals, setGoals] = useState<Goal[]>([]);

  // Deposit Savings State
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState<string | null>(null);

  // Global Language Synchronization
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsUrdu(localStorage.getItem("global_lang") === "ur");
      const handleLangChange = () => {
        setIsUrdu(localStorage.getItem("global_lang") === "ur");
      };
      window.addEventListener("languageChange", handleLangChange);
      return () => window.removeEventListener("languageChange", handleLangChange);
    }
  }, []);

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
      const res = await fetchWithAuth(`/api/goals/${userId}`);
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
      const expectedReturn = risk === "low" ? 0.08 : risk === "high" ? 0.16 : 0.12;
      const res = await fetch(apiUrl("/api/goals/calculate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_amount: target,
          target_years: years,
          risk_tolerance: risk,
          expected_annual_return: expectedReturn,
          inflation_rate: 0.15,
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
      const res = await fetchWithAuth("/api/goals/save", {
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

  const handleDeposit = async () => {
    if (!selectedGoal || !depositAmount) return;
    const amountFloat = parseFloat(depositAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setDepositMessage(isUrdu ? "براہ کرم درست رقم درج کریں۔" : "Please enter a valid positive number.");
      return;
    }
    setDepositLoading(true);
    setDepositMessage(null);
    try {
      const res = await fetchWithAuth("/api/goals/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          goal_id: parseInt(selectedGoal.id),
          amount: amountFloat,
        }),
      });
      if (res.ok) {
        const resultData = await res.json();
        setDepositMessage(isUrdu ? "بچت کامیابی سے جمع ہو گئی! +20 XP" : "Savings deposited successfully! +20 XP");
        
        // Update goals local state
        setGoals((prevGoals) =>
          prevGoals.map((g) =>
            g.id === selectedGoal.id ? { ...g, saved: resultData.current_savings } : g
          )
        );

        // Update local storage XP if dashboard cache exists
        const storedDashboard = localStorage.getItem("dashboard_data");
        if (storedDashboard) {
          try {
            const dbData = JSON.parse(storedDashboard);
            dbData.current_xp = resultData.current_xp;
            dbData.goals = dbData.goals.map((g: any) =>
              g.id.toString() === selectedGoal.id ? { ...g, current_savings: resultData.current_savings } : g
            );
            localStorage.setItem("dashboard_data", JSON.stringify(dbData));
          } catch (e) {
            console.error("Error updating local dashboard cache:", e);
          }
        }
        localStorage.setItem("current_xp", resultData.current_xp.toString());
        
        // Trigger sidebar language/XP update event
        window.dispatchEvent(new Event("dashboardUpdate"));
        
        setTimeout(() => {
          setSelectedGoal(null);
          setDepositAmount("");
          setDepositMessage(null);
        }, 1200);
      } else {
        const err = await res.json();
        setDepositMessage(err.detail || (isUrdu ? "ٹرانزیکشن ناکام ہو گئی۔" : "Transaction failed."));
      }
    } catch (e) {
      setDepositMessage(isUrdu ? "سرور سے رابطہ نہ ہو سکا۔" : "Error connecting to server.");
    } finally {
      setDepositLoading(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی یہ مقصد حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this goal?")) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/goals/${goalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
        // Update local dashboard cache
        const storedDashboard = localStorage.getItem("dashboard_data");
        if (storedDashboard) {
          try {
            const dbData = JSON.parse(storedDashboard);
            dbData.goals = dbData.goals.filter((g: any) => g.id.toString() !== goalId);
            localStorage.setItem("dashboard_data", JSON.stringify(dbData));
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  const getGoalType = (id: string) => goalTypes.find((g) => g.id === id);

  const goalTypesUrdu: Record<string, string> = {
    ghar: "گھر / زمین",
    gaari: "گاڑی",
    hajj: "حج / عمرہ",
    taleem: "بچوں کی تعلیم",
    retirement: "ریٹائرمنٹ",
    other: "دیگر مقصد",
  };

  return (
    <div className="flex min-h-screen" dir={isUrdu ? "rtl" : "ltr"}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen page-transition-wrap">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">
              {isUrdu ? "مالی مقاصد — Goals" : "Goals — مقاصد"}
            </h1>
            <p className="text-sm text-slate-400">
              {isUrdu ? "اپنے مالی مقاصد کی منصوبہ بندی کریں" : "Apne financial maqasid plan karein"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="glow-btn flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            {isUrdu ? "نیا مقصد" : "Naya Maqsad"}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto">
          {/* New Goal Form */}
          {showForm && (
            <GlassCard className="mb-8 animate-scale-in" hover={false}>
              <h2 className="text-lg font-bold text-white mb-6">
                {isUrdu ? "نیا مقصد — Naya Maqsad" : "Naya Maqsad — نیا مقصد"}
              </h2>

              {/* Goal Type Selector */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-3 block">
                  {isUrdu ? "مقصد کی قسم — Goal Type" : "Goal Type — مقصد کی قسم"}
                </label>
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
                          {isUrdu ? type.urdu : type.label}
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
                  <label className="text-sm text-slate-400 mb-2.5 block">
                    {isUrdu ? "ٹارگٹ رقم (پاکستانی روپے) — Target Amount" : "Target Amount (PKR) — کل رقم (روپے)"}
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-base focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200"
                    style={{ textAlign: isUrdu ? "right" : "left", direction: isUrdu ? "rtl" : "ltr" }}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2.5 block">
                    {isUrdu ? "مدت (سالوں میں) — Timeline (Years)" : "Timeline (Years) — مدت (سال)"}
                  </label>
                  <input
                    type="number"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-base focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200"
                    style={{ textAlign: isUrdu ? "right" : "left", direction: isUrdu ? "rtl" : "ltr" }}
                  />
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-3 block">
                  {isUrdu ? "خطرے کی برداشت — Risk Tolerance" : "Risk Tolerance — خطرے کی برداشت"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {riskLevels.map((level) => {
                    const isSelected = risk === level.id;
                    const urduLabelMap: Record<string, string> = {
                      low: "کم خطرہ (Low)",
                      moderate: "درمیانہ خطرہ (Moderate)",
                      high: "زیادہ خطرہ (High)"
                    };
                    const urduDescMap: Record<string, string> = {
                      low: "بینک ڈیپازٹس، حکومتی بچت کی اسکیمیں",
                      moderate: "میوچل فنڈز، متوازن پورٹ فولیو",
                      high: "اسٹاک مارکیٹ، ایکویٹی میوچل فنڈز"
                    };
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
                        style={{ textAlign: isUrdu ? "right" : "left" }}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                          {isUrdu ? urduLabelMap[level.id] : level.label}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {isUrdu ? urduDescMap[level.id] : level.desc}
                        </p>
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
                {loading ? (isUrdu ? "حساب ہو رہا ہے..." : "Calculating...") : (isUrdu ? "حساب لگائیں" : "Calculate")}
              </button>

              {/* Results */}
              {result && (
                <div className="mt-6 p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-scale-in" style={{ textAlign: isUrdu ? "right" : "left" }}>
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 justify-start">
                    <TrendingUp size={18} className="text-emerald-400" />
                    {isUrdu ? "حساب کے نتائج (مہنگائی @ ۱۵٪)" : "Calculation Results (Inflation @ 15%)"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-slate-400 mb-1">
                        {isUrdu ? "مستقبل کی متوقع لاگت (مہنگائی ایڈجسٹڈ)" : "Future Cost (Inflation Adjusted)"}
                      </p>
                      <p className="text-xl font-bold text-white">
                        PKR {result.futureCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-slate-400 mb-1">
                        {isUrdu ? "ضروری ماہانہ بچت" : "Monthly Savings Needed"}
                      </p>
                      <p className="text-xl font-bold text-emerald-400">
                        PKR {result.monthlyNeeded.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isUrdu 
                          ? `${risk === "low" ? "8%" : risk === "high" ? "16%" : "12%"} متوقع سالانہ منافع کے مطابق`
                          : `Calculated at ${risk === "low" ? "8%" : risk === "high" ? "16%" : "12%"} expected annual return`}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2">
                      {isUrdu ? "تجویز کردہ پاکستانی مالیاتی پروڈکٹس:" : "Suggested Pakistani Financial Products:"}
                    </p>
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
                    {isUrdu ? "مقصد محفوظ کریں" : "Save Goal"}
                  </button>
                </div>
              )}
            </GlassCard>
          )}

          {/* Existing Goals */}
          <h2 className="text-lg font-bold text-white mb-4">
            {isUrdu ? "آپ کے مقاصد — Aapke Maqasid" : "Aapke Maqasid —  آپ کے مقاصد"}
          </h2>

          {goals.length === 0 ? (
            <GlassCard className="text-center !py-16" hover={false}>
              <Target size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {isUrdu ? "ابھی کوئی مقصد نہیں ہے۔ نیا مقصد بنائیں!" : "Abhi koi maqsad nahi hai. Naya maqsad banayein!"}
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const goalType = getGoalType(goal.type);
                const percentage = Math.min(Math.round((goal.saved / goal.futureCost) * 100), 100);
                const riskNamesUr: Record<string, string> = {
                  low: "کم خطرہ (Conservative)",
                  moderate: "درمیانہ خطرہ (Moderate)",
                  high: "زیادہ خطرہ (Aggressive)"
                };

                return (
                  <GlassCard key={goal.id} className="animate-fade-in-up">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {goalType && (
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goalType.color} flex items-center justify-center`}>
                            <goalType.icon size={22} className="text-white" />
                          </div>
                        )}
                        <div style={{ textAlign: isUrdu ? "right" : "left" }}>
                          <h3 className="text-base font-bold text-white">
                            {isUrdu ? (goalTypesUrdu[goal.type] || goalType?.label) : goalType?.label}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {isUrdu 
                              ? `${goal.timeline} سال • ${goal.risk === "low" ? "کم خطرہ" : goal.risk === "high" ? "زیادہ خطرہ" : "درمیانہ خطرہ"}`
                              : `${goal.timeline} years • ${goal.risk} risk`}
                          </p>
                        </div>
                      </div>
                      <ProgressRing value={percentage} max={100} size={56} strokeWidth={5}>
                        <span className="text-xs font-bold text-white">{percentage}%</span>
                      </ProgressRing>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{isUrdu ? "آج کا ٹارگٹ:" : "Target Today:"}</span>
                        <span className="text-white font-medium">PKR {goal.target.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          {isUrdu ? "مستقبل کی متوقع لاگت (۱۵٪ مہنگائی کے ساتھ):" : "Future Cost (Adjusted @ 15% Inflation):"}
                        </span>
                        <span className="text-yellow-400 font-medium">PKR {goal.futureCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{isUrdu ? "متوقع سالانہ منافع:" : "Expected Annual Return:"}</span>
                        <span className="text-cyan-400 font-medium">
                          {isUrdu 
                            ? (goal.risk === "low" ? "8% (کم خطرہ)" : goal.risk === "high" ? "16% (زیادہ خطرہ)" : "12% (درمیانہ خطرہ)") 
                            : (goal.risk === "low" ? "8% (Conservative)" : goal.risk === "high" ? "16% (Aggressive)" : "12% (Moderate)")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{isUrdu ? "جمع شدہ بچت:" : "Saved:"}</span>
                        <span className="text-emerald-400 font-medium">PKR {goal.saved.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{isUrdu ? "ضروری ماہانہ رقم:" : "Monthly Needed:"}</span>
                        <span className="text-cyan-400 font-medium font-bold">PKR {goal.monthlyNeeded.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="progress-bar mb-3">
                      <div className="progress-fill" style={{ width: `${percentage}%` }} />
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div className="flex flex-wrap gap-1 max-w-[50%]">
                        {goal.products.map((p) => (
                          <span key={p} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5">
                            {p}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 text-xs font-semibold transition-all duration-200"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => setSelectedGoal(goal)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-semibold transition-all duration-200"
                        >
                          {isUrdu ? "جمع کریں" : "Deposit"}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Deposit Savings Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in" style={{ direction: isUrdu ? "rtl" : "ltr" }}>
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2" style={{ textAlign: isUrdu ? "right" : "left" }}>
              {isUrdu ? "مقصد میں بچت جمع کریں" : "Deposit Savings to Goal"}
            </h3>
            <p className="text-sm text-slate-400 mb-4" style={{ textAlign: isUrdu ? "right" : "left" }}>
              {isUrdu 
                ? `مقصد: ${goalTypesUrdu[selectedGoal.type] || selectedGoal.type} کے لیے ورچوئل رقم جمع کریں`
                : `Adding savings to: ${selectedGoal.type}`}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1" style={{ textAlign: isUrdu ? "right" : "left" }}>
                  {isUrdu ? "جمع کرنے کی رقم (PKR)" : "Deposit Amount (PKR)"}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  style={{ textAlign: isUrdu ? "right" : "left" }}
                />
              </div>

              {depositMessage && (
                <p className={`text-xs font-medium ${depositMessage.includes("success") || depositMessage.includes("کامیابی") ? "text-emerald-400" : "text-rose-400"}`} style={{ textAlign: isUrdu ? "right" : "left" }}>
                  {depositMessage}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeposit}
                  disabled={depositLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-sm font-bold transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                >
                  {depositLoading ? (isUrdu ? "جمع ہو رہا ہے..." : "Depositing...") : (isUrdu ? "جمع کریں" : "Deposit")}
                </button>
                <button
                  onClick={() => {
                    setSelectedGoal(null);
                    setDepositAmount("");
                    setDepositMessage(null);
                  }}
                  disabled={depositLoading}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-sm font-semibold transition-all duration-200"
                >
                  {isUrdu ? "منسوخ" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
