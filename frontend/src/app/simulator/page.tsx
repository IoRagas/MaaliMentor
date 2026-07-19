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
import { ToastContainer } from "@/components/Toast";
import { apiUrl } from "@/lib/api";

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
    urduDesc: "0% منافع",
    icon: Banknote,
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-500",
    description: "0% return",
  },
  {
    id: "savings",
    label: "Bank Savings",
    urdu: "بینک سیونگ",
    urduDesc: "مہنگائی سے منسلک (مہنگائی - 2%)",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500",
    description: "Inflation linked (Inflation - 2%)",
  },
  {
    id: "mutualFunds",
    label: "Mutual Funds",
    urdu: "میوچل فنڈز",
    urduDesc: "ایکویٹی مارکیٹ (اوسط 16%)",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500",
    description: "Equity market (Avg 16%)",
  },
  {
    id: "islamicFunds",
    label: "Islamic Funds",
    urdu: "اسلامی فنڈز",
    urduDesc: "شرعی فنڈز (اوسط 14%)",
    icon: Landmark,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500",
    description: "Shariah compliant (Avg 14%)",
  },
  {
    id: "gold",
    label: "Gold",
    urdu: "سونا",
    urduDesc: "مہنگائی کا تحفظ (مہنگائی ± 6%)",
    icon: Coins,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500",
    description: "Inflation Hedge (Inflation ± 6%)",
  },
  {
    id: "realEstate",
    label: "Real Estate",
    urdu: "رئیل اسٹیٹ",
    urduDesc: "پراپرٹی کی آمدنی (اوسط 12%)",
    icon: Home,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500",
    description: "Property Yield (Avg 12%)",
  },
];

interface InlineLineChartProps {
  data: { label: string; nominal: number; real: number }[];
  isUrdu: boolean;
}

function InlineLineChart({ data, isUrdu }: InlineLineChartProps) {
  if (data.length === 0) return null;

  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 75 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => [d.nominal, d.real]);
  const minVal = Math.min(...allValues) * 0.9;
  const maxVal = Math.max(...allValues) * 1.1;
  const range = maxVal - minVal || 1;

  const getX = (i: number) =>
    padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
  const getY = (val: number) =>
    padding.top + chartHeight - ((val - minVal) / range) * chartHeight;

  const buildPath = (key: "nominal" | "real") =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[key])}`)
      .join(" ");

  const buildArea = (key: "nominal" | "real") => {
    const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[key])}`).join(" ");
    return `${line} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;
  };

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines }, (_, i) =>
    minVal + (range / (gridLines - 1)) * i
  );

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toFixed(0);
  };

  const formatLabel = (lbl: string) => {
    if (!isUrdu) return lbl;
    if (lbl === "Start") return "آغاز";
    return lbl.replace("Y", "سال ");
  };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="nominalGradInline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="realGradInline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridValues.map((v, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={getY(v)}
              y2={getY(v)}
              stroke="rgba(148,163,184,0.1)"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 10}
              y={getY(v) + 4}
              textAnchor="end"
              fill="#94A3B8"
              fontSize="11"
              fontFamily="Inter, sans-serif"
            >
              {formatValue(v)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 10}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="11"
            fontFamily="Inter, sans-serif"
          >
            {formatLabel(d.label)}
          </text>
        ))}

        {/* Area fills */}
        <path d={buildArea("nominal")} fill="url(#nominalGradInline)" />
        <path d={buildArea("real")} fill="url(#realGradInline)" />

        {/* Lines */}
        <path
          d={buildPath("nominal")}
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={buildPath("real")}
          fill="none"
          stroke="#06B6D4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <React.Fragment key={i}>
            <circle cx={getX(i)} cy={getY(d.nominal)} r="4" fill="#10B981" />
            <circle cx={getX(i)} cy={getY(d.real)} r="4" fill="#06B6D4" />
          </React.Fragment>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-400">
            {isUrdu ? "نامیاتی دولت" : "Nominal Wealth"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500" />
          <span className="text-sm text-slate-400">
            {isUrdu ? "حقیقی قوتِ خرید" : "Real Purchasing Power"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const [userId, setUserId] = useState(1);
  const [isUrdu, setIsUrdu] = useState(false);
  const [rebalanceEnabled, setRebalanceEnabled] = useState(false);

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

  // Synchronize language state globally
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

    // Allocate savings or Rebalance entire portfolio
    const totalAlloc = allocations.cash + allocations.savings + allocations.mutualFunds + allocations.islamicFunds + allocations.gold + allocations.realEstate;
    const normCash = allocations.cash / (totalAlloc || 1);
    const normSavings = allocations.savings / (totalAlloc || 1);
    const normMutual = allocations.mutualFunds / (totalAlloc || 1);
    const normIslamic = allocations.islamicFunds / (totalAlloc || 1);
    const normGold = allocations.gold / (totalAlloc || 1);
    const normRealEstate = allocations.realEstate / (totalAlloc || 1);

    if (rebalanceEnabled) {
      const totalPortfolio = newCash + newSavings + newMutual + newIslamic + newGold + newRealEstate + annualSaving;
      newCash = totalPortfolio * normCash;
      newSavings = totalPortfolio * normSavings;
      newMutual = totalPortfolio * normMutual;
      newIslamic = totalPortfolio * normIslamic;
      newGold = totalPortfolio * normGold;
      newRealEstate = totalPortfolio * normRealEstate;
    } else {
      newCash += annualSaving * normCash;
      newSavings += annualSaving * normSavings;
      newMutual += annualSaving * normMutual;
      newIslamic += annualSaving * normIslamic;
      newGold += annualSaving * normGold;
      newRealEstate += annualSaving * normRealEstate;
    }

    // 4. Random life events
    const lifeEvents = [
      {
        name: "Medical Emergency — Beemar ho gaye! (PKR -50,000)",
        urduName: "طبی ایمرجنسی — بیمار ہو گئے! (PKR -50,000)",
        wealthImpact: -50000,
        prob: 0.15
      },
      {
        name: "Shaadi ka kharcha — Wedding expense! (PKR -150,000)",
        urduName: "شادی کا خرچہ! (PKR -150,000)",
        wealthImpact: -150000,
        prob: 0.08
      },
      {
        name: "Salary Raise — Talab mein izafa! (+15% Salary)",
        urduName: "تنخواہ میں اضافہ! (+15% تنخواہ)",
        incomeImpactPct: 0.15,
        prob: 0.20
      },
      {
        name: "Annual Bonus — Bohni mil gayi! (PKR +30,000)",
        urduName: "سالانہ بونس مل گیا! (PKR +30,000)",
        wealthImpact: 30000,
        prob: 0.18
      },
      {
        name: "Ghar ki repair — House maintenance! (PKR -25,000)",
        urduName: "گھر کی مرمت کا خرچہ! (PKR -25,000)",
        wealthImpact: -25000,
        prob: 0.12
      },
      {
        name: "Prize Bond laga! — Small prize won! (PKR +15,000)",
        urduName: "پرائز بانڈ لگ گیا! (PKR +15,000)",
        wealthImpact: 15000,
        prob: 0.05
      },
    ];

    let eventTriggered: string | null = null;
    let updatedAnnualIncome = annualIncome;

    for (const event of lifeEvents) {
      if (Math.random() < event.prob) {
        eventTriggered = isUrdu ? event.urduName : event.name;

        if (event.wealthImpact) {
          let impact = event.wealthImpact;
          if (impact < 0) {
            // Check Emergency Fund Buffer (cash + savings >= 3 * monthlyIncome)
            if ((newCash + newSavings) >= (3 * monthlyIncome)) {
              impact = Math.round(impact * 0.4);
              eventTriggered = isUrdu
                ? `${event.urduName} (ایمرجنسی فنڈ نے آپ کو 60٪ نقصان سے بچا لیا!)`
                : `${event.name} (Emergency Fund ne aap ko 60% nuqsaan se bacha liya!)`;
            } else {
              eventTriggered = isUrdu
                ? `${event.urduName} (ایمرجنسی فنڈ نہ ہونے کی وجہ سے پورا نقصان ہوا۔)`
                : `${event.name} (Emergency Fund na hone ki wajah se poora nuqsaan hua.)`;
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
      const isGoodEvent = eventTriggered.includes("laga") || eventTriggered.includes("Raise") || eventTriggered.includes("Bonus") || eventTriggered.includes("اضافہ") || eventTriggered.includes("بونس") || eventTriggered.includes("بانڈ");
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
      addToast(isUrdu ? "🏆 مبارک ہو! 10 سال کا سفر مکمل ہوا۔" : "🏆 Congratulations! 10 years journey completed.", "success");
    } else {
      addToast(isUrdu ? `سال ${nextTurn} مکمل ہوا!` : `Year ${nextTurn} completed!`, "info");
    }
  };

  const startGame = async () => {
    setLoading(true);
    setRebalanceEnabled(false);
    try {
      const res = await fetchWithAuth("/api/simulator/start", {
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
        addToast(isUrdu ? "🎮 نیا سال شروع ہوا! اپنا بچت پلان منتخب کریں۔" : "🎮 New simulation started! Select your savings plan.", "success");
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
    addToast(isUrdu ? "🎮 آف لائن موڈ: سمیلیٹر مقامی طور پر چل رہا ہے۔" : "🎮 Offline Mode: Simulator is running locally.", "info");
    setLoading(false);
  };

  const advanceTurn = async () => {
    if (state.gameOver || loading) return;
    
    // Validate allocation total is 100%
    const totalAlloc = allocations.cash + allocations.savings + allocations.mutualFunds + allocations.islamicFunds + allocations.gold + allocations.realEstate;
    if (totalAlloc !== 100) {
      addToast(isUrdu ? "⚠️ اگلا سال شروع کرنے کے لیے بچت کی کل ایلوکیشن 100٪ ہونی چاہیے!" : "⚠️ Total allocation must be 100% to proceed to the next year!", "error");
      return;
    }

    setLoading(true);
    const lifestyleFraction = state.spending / state.monthlyIncome;

    try {
      const res = await fetchWithAuth("/api/simulator/turn", {
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
          rebalance: rebalanceEnabled,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const nextTurn = data.new_turn;
        const nextAge = state.age + 1;
        const isGameOver = nextTurn >= 10;
        const nextIncome = data.monthly_income || (state.monthlyIncome * 1.07);

        if (data.event_triggered) {
          const isGoodEvent = data.event_triggered.includes("laga") || data.event_triggered.includes("Raise") || data.event_triggered.includes("Bonus") || data.event_triggered.includes("mila") || data.event_triggered.includes("raise") || data.event_triggered.includes("اضافہ") || data.event_triggered.includes("بونس") || data.event_triggered.includes("بانڈ");
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
          addToast(isUrdu ? "🏆 مبارک ہو! 10 سال کا سفر مکمل ہوا۔" : "🏆 Congratulations! 10 years journey completed.", "success");
        } else {
          addToast(isUrdu ? `سال ${nextTurn} مکمل ہوا!` : `Year ${nextTurn} completed!`, "info");
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
    <div className="flex min-h-screen" dir={isUrdu ? "rtl" : "ltr"}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div className="text-left">
            <h1 className="text-lg md:text-xl font-bold text-white">
              {isUrdu ? "پاکستان فنانشل لائف سمیلیٹر" : "Pakistan Financial Life Simulator"}
            </h1>
            <p className="text-sm text-slate-400">
              {isUrdu ? "اپنی زندگی کے مالی فیصلے کریں اور ان کے اثرات دیکھیں" : "Apni Zindagi Ka Faisla Karein — اپنی زندگی کا فیصلہ کریں"}
            </p>
          </div>
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <RotateCcw size={14} />
            {isUrdu ? "دوبارہ شروع" : "Dobara Shuru"}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto">
          {state.gameOver ? (
            /* Game Over Screen */
            <div className="max-w-2xl mx-auto text-center animate-scale-in">
              <GlassCard glow className="!p-10">
                <Trophy size={64} className="text-yellow-400 mx-auto mb-6 animate-bounce" />
                <h2 className="text-3xl font-extrabold gradient-text mb-2">
                  {isUrdu ? "کھیل ختم!" : "Game Over!"}
                </h2>
                <p className="text-slate-400 mb-8">
                  {isUrdu ? "10 سال کا سفر مکمل ہوا!" : "10 saal ka safar mukammal hua!"}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">
                      {isUrdu ? "آخری عمر" : "Final Age"}
                    </p>
                    <p className="text-2xl font-bold text-white">{state.age}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">
                      {isUrdu ? "کھیلے گئے سال" : "Turns Played"}
                    </p>
                    <p className="text-2xl font-bold text-white">{state.turn}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 mb-1">
                      {isUrdu ? "نامیاتی دولت" : "Nominal Wealth"}
                    </p>
                    <p className="text-2xl font-bold text-emerald-300">
                      PKR {state.nominalWealth.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-sm text-cyan-400 mb-1">
                      {isUrdu ? "حقیقی قوتِ خرید" : "Real Purchasing Power"}
                    </p>
                    <p className="text-2xl font-bold text-cyan-300">
                      PKR {state.realWealth.toLocaleString()}
                    </p>
                  </div>
                </div>

                <InlineLineChart data={state.history} isUrdu={isUrdu} />

                <button onClick={startGame} className="glow-btn mt-8 text-lg px-8 py-4">
                  {isUrdu ? "دوبارہ کھیلیں" : "Dobara Khelein"}
                </button>
              </GlassCard>
            </div>
          ) : (
            <>
              {/* Stats Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                {[
                  { label: isUrdu ? "عمر" : "Age", value: state.age, suffix: isUrdu ? " سال" : " yrs" },
                  { label: isUrdu ? "سال" : "Turn", value: `${state.turn + 1}/10`, suffix: "" },
                  { label: isUrdu ? "نامیاتی دولت" : "Nominal Wealth", value: `PKR ${state.nominalWealth.toLocaleString()}`, suffix: "", color: "text-emerald-400" },
                  { label: isUrdu ? "حقیقی خرید" : "Real Power", value: `PKR ${state.realWealth.toLocaleString()}`, suffix: "", color: "text-cyan-400" },
                  { label: isUrdu ? "مہنگائی" : "Inflation", value: `${(state.inflationRate * 100).toFixed(1)}%`, suffix: "", color: "text-yellow-400" },
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
                <div className="space-y-6 text-left">
                  {/* Asset Allocation Sliders */}
                  <GlassCard hover={false}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-base font-bold text-white">
                        {isUrdu ? "بچت کی تقسیم" : "Bachat ki Allocation"}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={resetToBalanced}
                          className="px-2 py-1 text-[11px] rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-150"
                        >
                          {isUrdu ? "متوازن پلان" : "Balanced Plan"}
                        </button>
                        <button
                          onClick={clearAllocations}
                          className="px-2 py-1 text-[11px] rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-150"
                        >
                          {isUrdu ? "صاف کریں" : "Clear"}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      {isUrdu 
                        ? "اپنی سالانہ بچت کو مختلف اثاثوں میں تقسیم کریں (کل 100٪ ہونا ضروری ہے)" 
                        : "Allocate your yearly savings among assets (Must sum to 100%)"}
                    </p>
                    
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
                                  <span className="text-sm font-semibold text-white">
                                    {isUrdu ? asset.urdu : asset.label}
                                  </span>
                                  <span className="text-xs text-slate-400 ml-2">
                                    ({isUrdu ? asset.urduDesc : asset.description})
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
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
                      <span>{isUrdu ? "کل تقسیم:" : "Total Allocation:"}</span>
                      <div className="flex items-center gap-2">
                        <span>{totalAllocation}%</span>
                        {totalAllocation === 100 ? (
                          <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                            {isUrdu ? "درست" : "Durust"}
                          </span>
                        ) : (
                          <span className="text-xs bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">
                            {totalAllocation > 100 
                              ? (isUrdu ? "کم کریں" : "Reduce") 
                              : (isUrdu ? "بڑھائیں" : "Increase")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Portfolio Rebalancing Toggle */}
                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between transition-all duration-200 hover:bg-white/10">
                      <div className="flex-1 pr-4 text-left">
                        <span className="text-sm font-semibold text-white block">
                          {isUrdu ? "پورٹ فولیو ری بیلنس کریں" : "Rebalance Portfolio"}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {isUrdu 
                            ? "اگلے سال تمام جمع شدہ دولت کو نئی ایلوکیشن کے مطابق دوبارہ تقسیم کریں" 
                            : "Redistribute entire accumulated wealth to match allocations on next turn"}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rebalanceEnabled}
                          onChange={(e) => setRebalanceEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </GlassCard>

                  {/* Spending Slider */}
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1">
                      {isUrdu ? "لائف اسٹائل خرچہ" : "Lifestyle Kharcha"}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      {isUrdu 
                        ? `ماہانہ خرچہ: PKR ${state.spending.toLocaleString()}` 
                        : `Monthly spending: PKR ${state.spending.toLocaleString()}`}
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
                        {spendingPercentage}% {isUrdu ? "آمدنی کا" : "of income"}
                      </span>
                      <span>PKR {state.monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{isUrdu ? "ماہانہ آمدنی:" : "Monthly Income:"}</span>
                        <span className="text-white font-medium">PKR {state.monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-400">{isUrdu ? "ماہانہ بچت:" : "Monthly Saving:"}</span>
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
                    {loading 
                      ? (isUrdu ? "حساب ہو رہا ہے..." : "Calculating...") 
                      : (isUrdu ? "اگلا سال" : "Agla Saal")}{" "}
                    <ArrowRight size={20} className={isUrdu ? "rotate-180" : ""} />
                  </button>
                </div>

                {/* Right: Chart & Portfolio Breakdown */}
                <div className="space-y-6">
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1 text-left">
                      {isUrdu ? "دولت کا سفر" : "Wealth Trajectory"}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 text-left">
                      {isUrdu ? "نامیاتی کیش بمقابلہ حقیقی قوتِ خرید" : "Nominal Cash vs Purchasing Power"}
                    </p>
                    <InlineLineChart data={state.history} isUrdu={isUrdu} />
                  </GlassCard>

                  {/* Portfolio Breakdown */}
                  <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-1 text-left">
                      {isUrdu ? "پورٹ فولیو کی تفصیل" : "Portfolio Breakdown"}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 text-left">
                      {isUrdu ? "آپ کے اثاثوں کا تناسب اور ان کی کل مالیت" : "Visual ratio and absolute value of your holdings"}
                    </p>
                    
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
                            title={`${isUrdu ? asset.urdu : asset.label}: ${pct.toFixed(1)}%`}
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
                          {isUrdu ? "خالی پورٹ فولیو" : "Empty Portfolio"}
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
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-semibold text-white">
                                  {isUrdu ? asset.urdu : asset.label}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {pct.toFixed(1)}%
                                </span>
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
