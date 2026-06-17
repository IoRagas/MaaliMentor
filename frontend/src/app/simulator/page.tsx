"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Banknote,
  Building2,
  TrendingUp,
  Landmark,
  Coins,
  Home,
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
  savingsValue?: number;
  mutualFundsValue?: number;
  islamicFundsValue?: number;
  goldValue?: number;
  realEstateValue?: number;
}

interface ToastItem {
  id: string;
  message: string;
  type?: "info" | "warning" | "success" | "error";
}

const assetsList = [
  {
    id: "cash",
    label: "Cash",
    urdu: "نقد",
    icon: Banknote,
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-500",
    description: "0% return",
  },
  {
    id: "savings",
    label: "Bank Savings",
    urdu: "بینک سیونگ",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500",
    description: "Inflation linked (Inflation - 2%)",
  },
  {
    id: "mutualFunds",
    label: "Mutual Funds",
    urdu: "میوچل فنڈز",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500",
    description: "Equity market (Avg 16%)",
  },
  {
    id: "islamicFunds",
    label: "Islamic Funds",
    urdu: "اسلامی فنڈز",
    icon: Landmark,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500",
    description: "Shariah compliant (Avg 14%)",
  },
  {
    id: "gold",
    label: "Gold",
    urdu: "سونا",
    icon: Coins,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500",
    description: "Inflation Hedge (Inflation ± 6%)",
  },
  {
    id: "realEstate",
    label: "Real Estate",
    urdu: "رئیل اسٹیٹ",
    icon: Home,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500",
    description: "Property Yield (Avg 12%)",
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
    cashValue: 50000,
    savingsValue: 0,
    mutualFundsValue: 0,
    islamicFundsValue: 0,
    goldValue: 0,
    realEstateValue: 0,
  });
  
  const [allocations, setAllocations] = useState({
    cash: 40,
    savings: 40,
    mutualFunds: 20,
    islamicFunds: 0,
    gold: 0,
    realEstate: 0,
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loading, setLoading] = useState(false);

  const resetToBalanced = () => {
    setAllocations({
      cash: 20,
      savings: 20,
      mutualFunds: 20,
      islamicFunds: 20,
      gold: 10,
      realEstate: 10,
    });
  };

  const clearAllocations = () => {
    setAllocations({
      cash: 0,
      savings: 0,
      mutualFunds: 0,
      islamicFunds: 0,
      gold: 0,
      realEstate: 0,
    });
  };

  const handleSliderChange = (key: keyof typeof allocations, val: number) => {
    setAllocations((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const getAssetValue = (assetId: string) => {
    switch (assetId) {
      case "cash":
        return state.cashValue !== undefined ? state.cashValue : state.nominalWealth;
      case "savings":
        return state.savingsValue || 0;
      case "mutualFunds":
        return state.mutualFundsValue || 0;
      case "islamicFunds":
        return state.islamicFundsValue || 0;
      case "gold":
        return state.goldValue || 0;
      case "realEstate":
        return state.realEstateValue || 0;
      default:
        return 0;
    }
  };

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
    // Helper to approximate normal distribution for returns
    const normalRandom = (mean: number, stdDev: number) => {
      const u1 = Math.random();
      const u2 = Math.random();
      const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      return mean + stdDev * randStdNormal;
    };

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
    const rateSavings = Math.max(0.05, inflationRate - 0.02);
    const rateMutual = normalRandom(0.16, 0.12);
    const rateIslamic = normalRandom(0.14, 0.08);
    const rateGold = inflationRate + (Math.random() * 0.12 - 0.04);
    const rateRealEstate = normalRandom(0.12, 0.03);

    // Load old values
    let oldCash = currentState.cashValue !== undefined ? currentState.cashValue : currentState.nominalWealth;
    let oldSavings = currentState.savingsValue || 0;
    let oldMutual = currentState.mutualFundsValue || 0;
    let oldIslamic = currentState.islamicFundsValue || 0;
    let oldGold = currentState.goldValue || 0;
    let oldRealEstate = currentState.realEstateValue || 0;

    // Grow existing
    let newCash = oldCash;
    let newSavings = oldSavings * (1 + rateSavings);
    let newMutual = oldMutual * (1 + rateMutual);
    let newIslamic = oldIslamic * (1 + rateIslamic);
    let newGold = oldGold * (1 + rateGold);
    let newRealEstate = oldRealEstate * (1 + rateRealEstate);

    // Allocate savings
    const totalAlloc = allocations.cash + allocations.savings + allocations.mutualFunds + allocations.islamicFunds + allocations.gold + allocations.realEstate;
    const normCash = allocations.cash / (totalAlloc || 1);
    const normSavings = allocations.savings / (totalAlloc || 1);
    const normMutual = allocations.mutualFunds / (totalAlloc || 1);
    const normIslamic = allocations.islamicFunds / (totalAlloc || 1);
    const normGold = allocations.gold / (totalAlloc || 1);
    const normRealEstate = allocations.realEstate / (totalAlloc || 1);

    newCash += annualSaving * normCash;
    newSavings += annualSaving * normSavings;
    newMutual += annualSaving * normMutual;
    newIslamic += annualSaving * normIslamic;
    newGold += annualSaving * normGold;
    newRealEstate += annualSaving * normRealEstate;

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
          let impact = event.wealthImpact;
          if (impact < 0) {
            // Check Emergency Fund Buffer (cash + savings >= 3 * monthlyIncome)
            if ((newCash + newSavings) >= (3 * monthlyIncome)) {
              impact = Math.round(impact * 0.4);
              eventTriggered = event.name + " (Emergency Fund ne aap ko 60% nuqsaan se bacha liya!)";
            } else {
              eventTriggered = event.name + " (Emergency Fund na hone ki wajah se poora nuqsaan hua.)";
            }
            
            const absImpact = Math.abs(impact);
            if (newCash >= absImpact) {
              newCash -= absImpact;
            } else if ((newCash + newSavings) >= absImpact) {
              const shortfall = absImpact - newCash;
              newCash = 0;
              newSavings -= shortfall;
            } else {
              const shortfall = absImpact - newCash - newSavings;
              newCash = 0;
              newSavings = 0;
              const otherTotal = newMutual + newIslamic + newGold + newRealEstate;
              if (otherTotal >= shortfall) {
                const ratio = (otherTotal - shortfall) / otherTotal;
                newMutual *= ratio;
                newIslamic *= ratio;
                newGold *= ratio;
                newRealEstate *= ratio;
              } else {
                newMutual = 0;
                newIslamic = 0;
                newGold = 0;
                newRealEstate = 0;
              }
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

    const nominalWealth = Math.round(newCash + newSavings + newMutual + newIslamic + newGold + newRealEstate);
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
      cashValue: Math.round(newCash),
      savingsValue: Math.round(newSavings),
      mutualFundsValue: Math.round(newMutual),
      islamicFundsValue: Math.round(newIslamic),
      goldValue: Math.round(newGold),
      realEstateValue: Math.round(newRealEstate),
      investedValue: Math.round(newSavings + newMutual + newIslamic + newGold + newRealEstate),
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
          cashValue: data.cash_value,
          savingsValue: data.savings_value,
          mutualFundsValue: data.mutual_funds_value,
          islamicFundsValue: data.islamic_funds_value,
          goldValue: data.gold_value,
          realEstateValue: data.real_estate_value,
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
      savingsValue: 0,
      mutualFundsValue: 0,
      islamicFundsValue: 0,
      goldValue: 0,
      realEstateValue: 0,
      investedValue: 0.0,
    });
    setToasts([]);
    addToast("🎮 Offline Mode: Simulator locally run ho raha hai.", "info");
    setLoading(false);
  };

  const advanceTurn = async () => {
    if (state.gameOver || loading) return;
    
    // Validate allocation total is 100%
    const totalAlloc = allocations.cash + allocations.savings + allocations.mutualFunds + allocations.islamicFunds + allocations.gold + allocations.realEstate;
    if (totalAlloc !== 100) {
      addToast("⚠️ Agla saal shuru karne ke liye bachat ki kul allocation 100% honi chahiye!", "error");
      return;
    }

    setLoading(true);
    const lifestyleFraction = state.spending / state.monthlyIncome;

    try {
      const res = await fetch("http://localhost:8000/api/simulator/turn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          decision_lifestyle_spend: lifestyleFraction,
          allocation_cash: allocations.cash / 100,
          allocation_savings: allocations.savings / 100,
          allocation_mutual_funds: allocations.mutualFunds / 100,
          allocation_islamic_funds: allocations.islamicFunds / 100,
          allocation_gold: allocations.gold / 100,
          allocation_real_estate: allocations.realEstate / 100,
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
            cashValue: Math.round(data.cash_value),
            savingsValue: Math.round(data.savings_value),
            mutualFundsValue: Math.round(data.mutual_funds_value),
            islamicFundsValue: Math.round(data.islamic_funds_value),
            goldValue: Math.round(data.gold_value),
            realEstateValue: Math.round(data.real_estate_value),
            investedValue: Math.round(data.invested_value),
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
  const totalAllocation = allocations.cash + allocations.savings + allocations.mutualFunds + allocations.islamicFunds + allocations.gold + allocations.realEstate;

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
                  {/* Asset Allocation Sliders */}
                  <GlassCard hover={false}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-base font-bold text-white">Bachat ki Allocation</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={resetToBalanced}
                          className="px-2 py-1 text-[11px] rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-150"
                        >
                          Balanced Plan
                        </button>
                        <button
                          onClick={clearAllocations}
                          className="px-2 py-1 text-[11px] rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-150"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">بچت کی تقسیم — Allocate your yearly savings among assets (Must sum to 100%)</p>
                    
                    <div className="space-y-4">
                      {assetsList.map((asset) => {
                        const val = allocations[asset.id as keyof typeof allocations];
                        return (
                          <div key={asset.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${asset.color} flex items-center justify-center`}>
                                  <asset.icon size={16} className="text-white" />
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-white">{asset.label}</span>
                                  <span className="text-xs text-slate-400 ml-2">({asset.description})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500" dir="rtl">{asset.urdu}</span>
                                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                  {val}%
                                </span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={val}
                              onChange={(e) => handleSliderChange(asset.id as keyof typeof allocations, parseInt(e.target.value))}
                              className="w-full accent-emerald-500 h-1.5 rounded-full appearance-none bg-slate-700 cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Allocation Display */}
                    <div className={`mt-4 p-3 rounded-lg border flex justify-between items-center text-sm font-semibold
                      ${totalAllocation === 100 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}
                    >
                      <span>Total Allocation:</span>
                      <div className="flex items-center gap-2">
                        <span>{totalAllocation}%</span>
                        {totalAllocation === 100 ? (
                          <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Durust</span>
                        ) : (
                          <span className="text-xs bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">
                            {totalAllocation > 100 ? "Kam Karein" : "Barhayein"}
                          </span>
                        )}
                      </div>
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
                    disabled={loading || totalAllocation !== 100}
                    className={`w-full text-lg py-4 flex items-center justify-center gap-2 rounded-xl font-bold transition-all
                      ${totalAllocation === 100 && !loading
                        ? "glow-btn text-white cursor-pointer"
                        : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                      }`}
                  >
                    {loading ? "Calculating..." : "Agla Saal"} <ArrowRight size={20} />
                  </button>
                </div>

                {/* Right: Chart & Portfolio Breakdown */}
                <div className="space-y-6">
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1">Wealth Trajectory</h3>
                    <p className="text-sm text-slate-400 mb-4">دولت کا سفر (Nominal Cash vs Purchasing Power)</p>
                    <LineChart data={state.history} />
                  </GlassCard>

                  {/* Portfolio Breakdown */}
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1">Portfolio Breakdown</h3>
                    <p className="text-sm text-slate-400 mb-4">آپ کے اثاثے — Visual ratio and absolute value of your holdings</p>
                    
                    {/* Horizontal Stacked Bar */}
                    <div className="w-full h-6 rounded-lg bg-slate-800 overflow-hidden flex mb-6 border border-white/5">
                      {assetsList.map((asset) => {
                        const assetVal = getAssetValue(asset.id);
                        const pct = state.nominalWealth > 0 ? (assetVal / state.nominalWealth) * 100 : 0;
                        if (pct <= 0) return null;
                        return (
                          <div
                            key={asset.id}
                            style={{ width: `${pct}%` }}
                            className={`h-full bg-gradient-to-br ${asset.color} transition-all duration-500 relative group`}
                            title={`${asset.label}: ${pct.toFixed(1)}%`}
                          >
                            {pct > 8 && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                                {Math.round(pct)}%
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {state.nominalWealth === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                          Empty Portfolio
                        </div>
                      )}
                    </div>

                    {/* Holdings Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {assetsList.map((asset) => {
                        const assetVal = getAssetValue(asset.id);
                        const pct = state.nominalWealth > 0 ? (assetVal / state.nominalWealth) * 100 : 0;
                        return (
                          <div key={asset.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded bg-gradient-to-br ${asset.color} flex items-center justify-center shrink-0`}>
                                <asset.icon size={12} className="text-white" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white text-left">{asset.label}</span>
                                <span className="text-[10px] text-slate-400 text-left">{pct.toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-200">PKR {Math.round(assetVal).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
