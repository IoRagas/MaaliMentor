"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Banknote,
  Building2,
  TrendingUp,
  Landmark,
  ArrowRight,
  RotateCcw,
  Trophy,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import GlassCard from "@/components/GlassCard";
import LineChart from "@/components/LineChart";
import { ToastContainer } from "@/components/Toast";

interface SimState {
  age: number;
  turn: number;
  nominalWealth: number;
  realWealth: number;
  inflationRate: number;
  monthlyIncome: number;
  savingMethod: string;
  spending: number;
  history: { label: string; nominal: number; real: number }[];
  gameOver: boolean;
  events: string[];
  cumulativeInflation?: number;
  cashValue?: number;
  investedValue?: number;
}

interface ToastItem {
  id: string;
  message: string;
  type?: "info" | "warning" | "success" | "error";
}

const savingMethods = [
  {
    id: "cash",
    label: "Cash",
    urdu: "نقد",
    icon: Banknote,
    backendId: "cash",
    description: "Ghar mein cash rakhein (0% return)",
    color: "from-slate-500 to-slate-600",
  },
  {
    id: "bank",
    label: "Bank Savings",
    urdu: "بینک سیونگ",
    icon: Building2,
    backendId: "savings_account",
    description: "Saving account mein rakhein (8% return)",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "mutual",
    label: "Mutual Funds",
    urdu: "میوچل فنڈز",
    icon: TrendingUp,
    backendId: "mutual_funds",
    description: "Equity mutual funds (16% return)",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "islamic",
    label: "Islamic Funds",
    urdu: "اسلامی فنڈز",
    icon: Landmark,
    backendId: "islamic_funds",
    description: "Shariah-compliant funds (14% return)",
    color: "from-cyan-500 to-cyan-600",
  },
];

export default function SimulatorPage() {
  const [userId, setUserId] = useState(1);
  const [state, setState] = useState<SimState>({
    age: 25,
    turn: 0,
    nominalWealth: 50000,
    realWealth: 50000,
    inflationRate: 0.15,
    monthlyIncome: 80000,
    savingMethod: "bank",
    spending: 40000,
    history: [{ label: "Start", nominal: 50000, real: 50000 }],
    gameOver: false,
    events: [],
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("user_id");
      if (storedId) {
        setUserId(parseInt(storedId));
      }
    }
  }, []);

  // Initialize Simulator on load or change in user ID
  useEffect(() => {
    startGame();
  }, [userId]);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const advanceTurnLocal = (currentState: SimState) => {
    // 1. Dynamic inflation (10-25%)
    const inflationRate = parseFloat((Math.random() * 0.15 + 0.10).toFixed(4));
    const oldCumulative = currentState.cumulativeInflation || 1.0;
    const newCumulative = oldCumulative * (1 + inflationRate);

    // 2. Income & saving
    const monthlyIncome = currentState.monthlyIncome;
    const annualIncome = monthlyIncome * 12;
    const livingExpenses = currentState.spending;
    const annualSaving = Math.max(annualIncome - livingExpenses, 0);

    // 3. Investment returns
    const returnsMap: Record<string, number> = {
      cash: 0.00,
      bank: 0.08,
      mutual: 0.16,
      islamic: 0.14,
    };
    const returnRate = returnsMap[currentState.savingMethod] || 0.0;

    let oldCash = currentState.cashValue !== undefined ? currentState.cashValue : currentState.nominalWealth;
    let oldInvested = currentState.investedValue || 0;
    let newCash = oldCash;
    let newInvested = oldInvested;

    if (currentState.savingMethod === "cash") {
      newCash = oldCash + annualSaving;
      newInvested = oldInvested * (1 + 0.14); // existing grows
    } else {
      newCash = oldCash;
      newInvested = (oldInvested + annualSaving) * (1 + returnRate);
    }

    // 4. Random life events
    const lifeEvents = [
      { name: "Medical Emergency — Beemar ho gaye! (PKR -50,000)", wealthImpact: -50000, prob: 0.15 },
      { name: "Shaadi ka kharcha — Wedding expense! (PKR -150,000)", wealthImpact: -150000, prob: 0.08 },
      { name: "Salary Raise — Talab mein izafa! (+15% Salary)", incomeImpactPct: 0.15, prob: 0.20 },
      { name: "Annual Bonus — Bohni mil gayi! (PKR +30,000)", wealthImpact: 30000, prob: 0.18 },
      { name: "Ghar ki repair — House maintenance! (PKR -25,000)", wealthImpact: -25000, prob: 0.12 },
      { name: "Prize Bond laga! — Small prize won! (PKR +15,000)", wealthImpact: 15000, prob: 0.05 },
    ];

    let eventTriggered: string | null = null;
    let updatedAnnualIncome = annualIncome;

    for (const event of lifeEvents) {
      if (Math.random() < event.prob) {
        eventTriggered = event.name;

        if (event.wealthImpact) {
          const impact = event.wealthImpact;
          if (impact < 0) {
            if (newCash >= Math.abs(impact)) {
              newCash += impact;
            } else {
              const shortfall = Math.abs(impact) - newCash;
              newCash = 0;
              newInvested = Math.max(newInvested - shortfall, 0);
            }
          } else {
            newCash += impact;
          }
        }

        if (event.incomeImpactPct) {
          updatedAnnualIncome *= (1 + event.incomeImpactPct);
        }

        break; // Max one event
      }
    }

    const nominalWealth = Math.round(newCash + newInvested);
    const realWealth = Math.round(nominalWealth / newCumulative);
    const nextTurn = currentState.turn + 1;
    const nextAge = currentState.age + 1;
    const isGameOver = nextTurn >= 10;

    const newHistory = [
      ...currentState.history,
      { label: `Y${nextTurn}`, nominal: nominalWealth, real: realWealth }
    ];

    if (eventTriggered) {
      const isGoodEvent = eventTriggered.includes("laga") || eventTriggered.includes("Raise") || eventTriggered.includes("Bonus");
      addToast(eventTriggered, isGoodEvent ? "success" : "warning");
    }

    setState({
      age: nextAge,
      turn: nextTurn,
      nominalWealth: nominalWealth,
      realWealth: realWealth,
      inflationRate: inflationRate,
      monthlyIncome: Math.round(updatedAnnualIncome / 12),
      savingMethod: currentState.savingMethod,
      spending: Math.round(currentState.spending * (1 + inflationRate)),
      history: newHistory,
      gameOver: isGameOver,
      events: eventTriggered ? [...currentState.events, eventTriggered] : currentState.events,
      cumulativeInflation: newCumulative,
      cashValue: newCash,
      investedValue: newInvested,
    });

    if (isGameOver) {
      addToast("🏆 Congratulations! 10 saal ka safar mukammal hua.", "success");
    } else {
      addToast(`Saal ${nextTurn} mukammal hua!`, "info");
    }
  };

  const startGame = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/simulator/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          starting_age: 25,
          starting_income: 80000.0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setState({
          age: 25,
          turn: data.current_turn,
          nominalWealth: data.nominal_wealth,
          realWealth: data.real_purchasing_power,
          inflationRate: 0.15,
          monthlyIncome: 80000,
          savingMethod: "bank",
          spending: 40000,
          history: [{ label: "Start", nominal: data.nominal_wealth, real: data.real_purchasing_power }],
          gameOver: false,
          events: [],
          cumulativeInflation: 1.0,
          cashValue: data.nominal_wealth,
          investedValue: 0.0,
        });
        setToasts([]);
        addToast("🎮 Naya saal shuru hua! Apna saving plan muntakhib karein.", "success");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Failed to start simulator, launching offline mode:", err);
    }

    // Offline mode setup
    setState({
      age: 25,
      turn: 0,
      nominalWealth: 50000,
      realWealth: 50000,
      inflationRate: 0.15,
      monthlyIncome: 80000,
      savingMethod: "bank",
      spending: 40000,
      history: [{ label: "Start", nominal: 50000, real: 50000 }],
      gameOver: false,
      events: [],
      cumulativeInflation: 1.0,
      cashValue: 50000,
      investedValue: 0.0,
    });
    setToasts([]);
    addToast("🎮 Offline Mode: Simulator locally run ho raha hai.", "info");
    setLoading(false);
  };

  const advanceTurn = async () => {
    if (state.gameOver || loading) return;

    setLoading(true);
    const selectedMethod = savingMethods.find((m) => m.id === state.savingMethod)!;
    const lifestyleFraction = state.spending / state.monthlyIncome;

    try {
      const res = await fetch("http://localhost:8000/api/simulator/turn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          decision_saving_method: selectedMethod.backendId,
          decision_lifestyle_spend: lifestyleFraction,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const nextTurn = data.new_turn;
        const nextAge = state.age + 1;
        const isGameOver = nextTurn >= 10;
        const nextIncome = data.monthly_income || (state.monthlyIncome * 1.07);

        if (data.event_triggered) {
          const isGoodEvent = data.event_triggered.includes("laga") || data.event_triggered.includes("Raise") || data.event_triggered.includes("Bonus") || data.event_triggered.includes("mila") || data.event_triggered.includes("raise");
          addToast(data.event_triggered, isGoodEvent ? "success" : "warning");
        }

        setState((prev) => {
          const newHistory = [
            ...prev.history,
            {
              label: `Y${nextTurn}`,
              nominal: Math.round(data.nominal_wealth),
              real: Math.round(data.real_purchasing_power),
            },
          ];

          return {
            ...prev,
            age: nextAge,
            turn: nextTurn,
            nominalWealth: Math.round(data.nominal_wealth),
            realWealth: Math.round(data.real_purchasing_power),
            inflationRate: data.current_inflation_rate,
            monthlyIncome: Math.round(nextIncome),
            history: newHistory,
            gameOver: isGameOver,
            cumulativeInflation: data.real_purchasing_power > 0 ? (data.nominal_wealth / data.real_purchasing_power) : (prev.cumulativeInflation || 1.0),
            cashValue: data.cash_value,
            investedValue: data.invested_value,
          };
        });

        if (isGameOver) {
          addToast("🏆 Congratulations! 10 saal ka safar mukammal hua.", "success");
        } else {
          addToast(`Saal ${nextTurn} mukammal hua!`, "info");
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Failed to advance simulator turn, running locally:", err);
    }

    // Local fallback turn calculations
    advanceTurnLocal(state);
    setLoading(false);
  };

  const spendingPercentage = Math.round((state.spending / state.monthlyIncome) * 100);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">
              Pakistan Financial Life Simulator
            </h1>
            <p className="text-sm text-slate-400">
              Apni Zindagi Ka Faisla Karein — اپنی زندگی کا فیصلہ کریں
            </p>
          </div>
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <RotateCcw size={14} />
            Dobara Shuru
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto">
          {state.gameOver ? (
            /* Game Over Screen */
            <div className="max-w-2xl mx-auto text-center animate-scale-in">
              <GlassCard glow className="!p-10">
                <Trophy size={64} className="text-yellow-400 mx-auto mb-6 animate-bounce" />
                <h2 className="text-3xl font-extrabold gradient-text mb-2">Game Over!</h2>
                <p className="text-slate-400 mb-8">10 saal ka safar mukammal hua!</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Final Age</p>
                    <p className="text-2xl font-bold text-white">{state.age}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Turns Played</p>
                    <p className="text-2xl font-bold text-white">{state.turn}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 mb-1">Nominal Wealth</p>
                    <p className="text-2xl font-bold text-emerald-300">
                      PKR {state.nominalWealth.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-sm text-cyan-400 mb-1">Real Purchasing Power</p>
                    <p className="text-2xl font-bold text-cyan-300">
                      PKR {state.realWealth.toLocaleString()}
                    </p>
                  </div>
                </div>

                <LineChart data={state.history} />

                <button onClick={startGame} className="glow-btn mt-8 text-lg px-8 py-4">
                  Dobara Khelein
                </button>
              </GlassCard>
            </div>
          ) : (
            <>
              {/* Stats Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                {[
                  { label: "Age", value: state.age, suffix: " yrs" },
                  { label: "Turn", value: `${state.turn + 1}/10`, suffix: "" },
                  { label: "Nominal Wealth", value: `PKR ${state.nominalWealth.toLocaleString()}`, suffix: "", color: "text-emerald-400" },
                  { label: "Real Power", value: `PKR ${state.realWealth.toLocaleString()}`, suffix: "", color: "text-cyan-400" },
                  { label: "Inflation", value: `${(state.inflationRate * 100).toFixed(1)}%`, suffix: "", color: "text-yellow-400" },
                ].map((stat) => (
                  <GlassCard key={stat.label} hover={false} className="!p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-sm sm:text-base md:text-lg font-bold ${stat.color || "text-white"} truncate`} title={String(stat.value)}>
                      {stat.value}{stat.suffix}
                    </p>
                  </GlassCard>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Decisions */}
                <div className="space-y-6">
                  {/* Saving Method */}
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1">Bachat ka Tareeqa</h3>
                    <p className="text-sm text-slate-400 mb-4">بچت کا طریقہ — Choose your saving method</p>
                    <div className="grid grid-cols-2 gap-3">
                      {savingMethods.map((method) => {
                        const isSelected = state.savingMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setState((p) => ({ ...p, savingMethod: method.id }))}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-250 text-center
                              ${
                                isSelected
                                  ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                  : "border-white/10 bg-white/5 hover:border-white/20"
                              }`}
                          >
                            <div
                              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-2`}
                            >
                              <method.icon size={20} className="text-white" />
                            </div>
                            <span className={`text-sm font-semibold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                              {method.label}
                            </span>
                            <span className="text-xs text-slate-500" dir="rtl">{method.urdu}</span>
                            <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                              {method.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </GlassCard>

                  {/* Spending Slider */}
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1">Lifestyle Kharcha</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      لائف اسٹائل خرچہ — Monthly spending: PKR {state.spending.toLocaleString()}
                    </p>
                    <input
                      type="range"
                      min={10000}
                      max={state.monthlyIncome}
                      step={5000}
                      value={state.spending}
                      onChange={(e) =>
                        setState((p) => ({ ...p, spending: parseInt(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 h-2 rounded-full appearance-none bg-slate-700 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>PKR 10,000</span>
                      <span className={spendingPercentage > 80 ? "text-red-400" : "text-emerald-400"}>
                        {spendingPercentage}% of income
                      </span>
                      <span>PKR {state.monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Monthly Income:</span>
                        <span className="text-white font-medium">PKR {state.monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-400">Monthly Saving:</span>
                        <span className="text-emerald-400 font-medium">
                          PKR {(state.monthlyIncome - state.spending).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Advance Button */}
                  <button
                    onClick={advanceTurn}
                    disabled={loading}
                    className="glow-btn w-full text-lg py-4 flex items-center justify-center gap-2"
                  >
                    {loading ? "Calculating..." : "Agla Saal"} <ArrowRight size={20} />
                  </button>
                </div>

                {/* Right: Chart */}
                <div>
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1">Wealth Trajectory</h3>
                    <p className="text-sm text-slate-400 mb-4">دولت کا سفر (Nominal Cash vs Purchasing Power)</p>
                    <LineChart data={state.history} />
                  </GlassCard>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
