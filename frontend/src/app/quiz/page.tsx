"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Lock,
} from "lucide-react";
import { apiUrl, fetchWithAuth } from "@/lib/api";

interface Question {
  id: number;
  level: number;
  question: string;
  options: Record<string, string>;
}

interface FullOfflineQuestion {
  id: number;
  level: number;
  question: string;
  options: Record<string, string>;
  correct_option: string;
  explanation: string;
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
  5: "Tax Basics & Filing (ٹیکس کے اصول)",
  6: "Investing Principles (سرمایہ کاری)",
  71: "Mutual Funds (میوچل فنڈز)",
  72: "Islamic Banking & Finance (اسلامی بینکاری)",
  81: "Stock Market & Shares (اسٹاک مارکیٹ)",
  82: "Gold, Property & Alternatives (سونا اور رئیل اسٹیٹ)",
  9: "Diversification & Risk (تنوع)",
  10: "Retirement & Legacy Planning (ریٹائرمنٹ اور وصیت)",
};

const flowNodes = [
  { id: "budgeting", label: "Budgeting Basics", prereqs: [] },
  { id: "saving", label: "Saving Habits", prereqs: ["budgeting"] },
  { id: "emergency_funds", label: "Emergency & Debt", prereqs: ["saving"] },
  { id: "inflation", label: "Inflation & Money", prereqs: ["emergency_funds"] },
  { id: "tax_basics", label: "Tax Filer Status", prereqs: ["inflation"] },
  { id: "investing", label: "Investing Principles", prereqs: ["tax_basics"] },
  { id: "mutual_funds", label: "Mutual Funds (7A)", prereqs: ["investing"] },
  { id: "islamic_banking", label: "Islamic Banking (7B)", prereqs: ["investing"] },
  { id: "stock_market", label: "Stock Market (8A)", prereqs: ["mutual_funds"] },
  { id: "gold_real_estate", label: "Gold & Property (8B)", prereqs: ["islamic_banking"] },
  { id: "diversification", label: "Diversification", prereqs: ["stock_market", "gold_real_estate"] },
  { id: "retirement", label: "Retirement & Legacy", prereqs: ["diversification"] },
];

const studyMaterials: Record<number, { title: string; urduTitle: string; content: string[] }> = {
  1: {
    title: "Budgeting Basics",
    urduTitle: "بجٹ بنانے کے بنیادی اصول",
    content: [
      "**Budget ka maqsad:** Apni amdani (Income) aur kharchon (Expenses) ka mukammal hissa-kitaab rakhna taake paisa zaya na ho.",
      "**50-30-20 Rule:** Amdani ko teen hisson mein taqseem karein: 50% Zarooriyat (Needs), 30% Khwahishat (Wants), aur 20% Bachat (Savings & Investments).",
      "**Needs vs Wants:** Needs ke baghair zindagi guzarna mushkil hai (rent, utility, food). Wants sirf shauq poore karne ke liye hoti hain.",
      "**Fixed vs Variable:** Fixed expenses har mahine barabar hote hain (rent, school fee). Variable expenses tabdeel hote rehte hain (utility bills, petrol)."
    ]
  },
  2: {
    title: "Saving Habits",
    urduTitle: "بچت کی عادات اور فائدے",
    content: [
      "**Sunoori Usool:** Amdani aate hi pehle bachat alag karein, phir baqi paise kharach karein (Income - Savings = Spending).",
      "**Cash vs Bank:** Ghar mein cash rakhne se mehengai (inflation) ki wajah se iski value kam ho jati hai. Bank account mein rakhna behtar aur mehfooz hai.",
      "**Compound Interest:** Apne profit par mazeed profit kamana. Yeh aap ke paise ko waqt ke sath exponentially barhata hai."
    ]
  },
  3: {
    title: "Emergency Funds",
    urduTitle: "ایمرجنسی فنڈ کی اہمیت",
    content: [
      "**Emergency Fund:** Ghair-yakeeni halat (medical emergency, job loss, accident) ke liye rakha gaya paisa.",
      "**Kitna hona chahiye:** Kam az kam 3 se 6 mahine ke essential expenses ke barabar raqam emergency fund mein honi chahiye.",
      "**Liquidity:** Emergency fund liquid hona chahiye (jaise bank account), real estate ya committees mein nahi."
    ]
  },
  4: {
    title: "Inflation & Purchasing Power",
    urduTitle: "مہنگائی اور خریدنے کی طاقت",
    content: [
      "**Inflation (Mehengai):** Har saal cheezon ki qeemton mein izafa hona aur paise ki purchasing power (quwwat-e-khareed) ka kam hona.",
      "**Purchasing Power:** Agar inflation 15% ho, to aaj ka 1,000 rupya agle saal nominal value mein wahi rahega par 850 rupay ki cheezein khareed sakega.",
      "**Inflation se bachao:** Apne paise ko aisi assets mein invest karna jo inflation rate se zyada return dein (Stocks, Gold, Mutual Funds)."
    ]
  },
  5: {
    title: "Tax Basics & Filing",
    urduTitle: "ٹیکس فائلنگ اور فائلر بننے کے فائدے",
    content: [
      "**Active Filer:** Jo shakhs FBR mein income tax return file karta hai aur FBR ki Active Taxpayers List (ATL) mein shamil hota hai.",
      "**Filer ke Fayde:** Bank transactions, car purchase, dividends, aur property transfer par withholding tax (WHT) rates adhay (50% kam) ho jate hain.",
      "**IRIS Online Portal:** NTN registration, Form 114 (Income Tax Return), aur Form 116 (Wealth Statement) submit karne ka online portal."
    ]
  },
  6: {
    title: "Investing Principles",
    urduTitle: "سرمایہ کاری کے بنیادی اصول",
    content: [
      "**Saving vs Investing:** Saving ka matlab paisa bachana aur safe rakhna hai. Investing ka matlab paise ko assets mein lagana hai taake return mile.",
      "**Risk vs Return:** Financial rule hai ke jitna zyada risk hoga, utna hi zyada potential return (nafa) milne ka imkan hota hai.",
      "**Asset Classes:** Sarmayakari ke mukhtalif zariye hain jaise Stocks (shares), Bonds (Sukuks), Gold (sona), aur Real Estate (property)."
    ]
  },
  71: {
    title: "Mutual Funds",
    urduTitle: "میوچل فنڈز کی تفصیل",
    content: [
      "**Mutual Fund:** Bohat se investors se paise jama kar ke professional Fund Manager ke zariye listed shares aur bonds mein invest karna.",
      "**NAV (Net Asset Value):** Kisi mutual fund ke ek unit (share) ki price ko NAV kehte hain, jo daily calculate hoti hai.",
      "**Diversification:** Mutual funds ke zariye choti raqam (jaise Rs. 5000) se bhi sekron companies mein automatic sarmayakari ho jati hai."
    ]
  },
  72: {
    title: "Islamic Banking & Finance",
    urduTitle: "اسلامی بینکاری کے اصول",
    content: [
      "**Riba & Sood:** Sood Islam mein strictly prohibited hai. Islamic banking Riba-free contracts aur profit-sharing par chalti hai.",
      "**Mudarabah & Musharakah:** Mudarabah mein ek partner sarmaya (Rab-ul-Maal) aur dusra mehnat (Mudarib) karta hai. Musharakah joint business partnership hai.",
      "**Murabahah & Ijarah:** Murabahah cost-plus asset purchase trade hai, aur Ijarah lease/rent service agreement hai."
    ]
  },
  81: {
    title: "Stock Market & Shares",
    urduTitle: "اسٹاک مارکیٹ اور حصص",
    content: [
      "**Share (Hissa):** Kisi public listed company mein fractional ownership (malkiyat) ka chota sa hissa khareedna.",
      "**Returns:** Shareholders do tarah se kamate hain: **Dividend** (profit payout) aur **Capital Gain** (share price barhne par profit).",
      "**PSX & Broker:** Pakistan Stock Exchange par trade ke liye SECP licensed broker ke paas Trading Account aur CDC Sub-Account hona zaroori hai."
    ]
  },
  82: {
    title: "Gold, Property & Alternatives",
    urduTitle: "سونا اور رئیل اسٹیٹ",
    content: [
      "**Gold as Hedge:** Sona (Gold) inflation aur currency devaluation ke doran value preserve karne ka traditional hedge aur safe-haven asset hai.",
      "**Real Estate:** Land, commercial, aur residential property khareedna, jo capital appreciation aur rental yields (kiraya) faraham karti hai.",
      "**REITs:** Physical property khareede baghair stock exchange par real estate projects mein invest karne ka regulated share mechanism."
    ]
  },
  9: {
    title: "Diversification & Rebalancing",
    urduTitle: "تنوع اور رسک مینجمنٹ",
    content: [
      "**Diversification:** Apni saari sarmayakari ek hi asset ya company mein na lagana ('Don't put all eggs in one basket') taake total risk kam ho.",
      "**Asset Correlation:** Different assets inflation/market crash par different behavior rakhte hain (gold typically rises when stock drops).",
      "**Rebalancing:** Growth rates badalne par original allocation percentages (e.g. 50/50) ko restore karne ke liye asset transfer karna."
    ]
  },
  10: {
    title: "Retirement & Legacy Planning",
    urduTitle: "ریٹائرمنٹ اور وصیت",
    content: [
      "**4% Rule & 25x:** Annual expenses ka 25 guna jama karne se withdrawable profit retirement ko support kar sakta hai.",
      "**Voluntary Pension Schemes (VPS):** SECP se registered pension funds jin mein invest karne par up to 20% tax rebates (Section 63) milte hain.",
      "**Islamic Will (Wasiyat):** Islamic rules ke tehat koi Muslim apni 1/3 wealth non-heirs ya charity ke liye wasiyat kar sakta hai; baki 2/3 automatic distributed hoti hai."
    ]
  }
};

export default function QuizPage() {
  const [level, setLevel] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showStudyMaterial, setShowStudyMaterial] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<QuizResult | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQuestions, setOfflineQuestions] = useState<FullOfflineQuestion[]>([]);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isUrdu, setIsUrdu] = useState(false);

  // Parse level parameter from window.location and handle global language toggle
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsUrdu(localStorage.getItem("global_lang") === "ur");
      const handleLangChange = () => {
        setIsUrdu(localStorage.getItem("global_lang") === "ur");
      };
      window.addEventListener("languageChange", handleLangChange);

      const params = new URLSearchParams(window.location.search);
      const levelParam = params.get("level");
      if (levelParam) {
        setLevel(parseInt(levelParam));
      } else {
        setLevel(null);
      }

      return () => window.removeEventListener("languageChange", handleLangChange);
    }
  }, []);

  // Fetch dashboard data for locking status when level selection is active
  useEffect(() => {
    if (level === null) {
      const fetchDashboard = async () => {
        setDashboardLoading(true);
        const userId = localStorage.getItem("user_id") || "1";
        try {
          const res = await fetchWithAuth(`/api/auth/dashboard/${userId}`);
          if (res.ok) {
            const data = await res.json();
            setDashboardData(data);
            localStorage.setItem("dashboard_data", JSON.stringify(data));
            localStorage.setItem("current_level", data.current_level.toString());
            localStorage.setItem("current_xp", data.current_xp.toString());
          } else {
            throw new Error("Failed to fetch dashboard data");
          }
        } catch (err) {
          console.warn("Quiz dashboard fetch failed, attempting local cache lookup:", err);
          
          const cachedData = localStorage.getItem("dashboard_data");
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              setDashboardData(parsed);
              setDashboardLoading(false);
              return;
            } catch (e) {
              console.error("Error parsing cached dashboard data:", e);
            }
          }

          const currentLevel = parseInt(localStorage.getItem("current_level") || "1");
          const currentXp = parseInt(localStorage.getItem("current_xp") || "150");
          const localConceptToLevel: Record<string, number> = {
            budgeting: 1,
            saving: 2,
            emergency_funds: 3,
            inflation: 4,
            tax_basics: 5,
            investing: 6,
            mutual_funds: 71,
            islamic_banking: 72,
            stock_market: 81,
            gold_real_estate: 82,
            diversification: 9,
            retirement: 10,
          };
          const fallbackMastery = Object.entries(localConceptToLevel).map(([concept_name, lvl]) => {
            let score = 0;
            if (lvl < currentLevel) {
              score = 85;
            } else if (lvl === currentLevel) {
              score = 30;
            }
            return { concept_name, mastery_score: score };
          });

          setDashboardData({
            user_id: parseInt(userId),
            username: localStorage.getItem("username") || "Ahmed",
            user_level: localStorage.getItem("user_level") || "Beginner",
            current_level: currentLevel,
            current_xp: currentXp,
            concept_mastery: fallbackMastery,
            goals: [],
          });
        } finally {
          setDashboardLoading(false);
        }
      };
      fetchDashboard();
    }
  }, [level]);

  // Fetch questions when level is determined
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      setIsOfflineMode(false);
      try {
        const res = await fetchWithAuth(`/api/quiz/questions/${level}`);
        if (!res.ok) {
          throw new Error(`Failed to load questions for Level ${level}.`);
        }
        const data = await res.json();
        setQuestions(data);
      } catch (err: any) {
        console.warn("Backend fetch failed, falling back to offline mode:", err);
        try {
          const localRes = await fetch("/quiz_data.json");
          if (!localRes.ok) {
            throw new Error("Local quiz data asset is not accessible.");
          }
          const allLocalQuestions: FullOfflineQuestion[] = await localRes.json();
          const filtered = allLocalQuestions.filter((q) => q.level === level);
          if (filtered.length === 0) {
            throw new Error(`No questions found for Level ${level} in local quiz data.`);
          }
          setOfflineQuestions(filtered);
          
          const strippedQuestions: Question[] = filtered.map((q) => ({
            id: q.id,
            level: q.level,
            question: q.question,
            options: q.options,
          }));
          setQuestions(strippedQuestions);
          setIsOfflineMode(true);
        } catch (localErr: any) {
          console.error("Local quiz fallback failed:", localErr);
          setError(localErr.message || "Failed to fetch quiz questions. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (level !== null) {
      fetchQuestions();
    } else {
      setLoading(false);
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
      const confirmText = isUrdu 
        ? `آپ نے ۲۰ میں سے صرف ${answeredCount} سوالات کے جواب دیے ہیں۔ کیا آپ پھر بھی کوئز جمع کروانا چاہتے ہیں؟`
        : `Aap ne 20 mein se sirf ${answeredCount} sawalat ke jawab diye hain. Kya aap phir bhi submit karna chahte hain?`;
      const confirmSubmit = confirm(confirmText);
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    setError(null);

    if (isOfflineMode) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        let score = 0;
        const details: DetailResult[] = [];

        offlineQuestions.forEach((q) => {
          const userAns = selectedAnswers[q.id] || "";
          const isCorrect = userAns.toLowerCase().trim() === q.correct_option.toLowerCase().trim();
          if (isCorrect) {
            score++;
          }
          details.push({
            question_id: q.id,
            correct_option: q.correct_option,
            explanation: q.explanation,
            is_correct: isCorrect,
          });
        });

        const passed = score >= 15;
        const activeLevel = level || 1;
        let nextLevel = activeLevel;

        if (passed) {
          const storedLevelStr = localStorage.getItem("current_level") || "1";
          const currentStoredLevel = parseInt(storedLevelStr);
          const isCurrentLevelMatch = 
            currentStoredLevel === activeLevel ||
            (currentStoredLevel === 7 && (activeLevel === 71 || activeLevel === 72)) ||
            (currentStoredLevel === 8 && (activeLevel === 81 || activeLevel === 82));
            
          if (isCurrentLevelMatch && currentStoredLevel < 10) {
            nextLevel = currentStoredLevel + 1;
            localStorage.setItem("current_level", nextLevel.toString());
          } else {
            nextLevel = currentStoredLevel;
          }
        }

        const localResult: QuizResult = {
          score,
          passed,
          current_level: nextLevel,
          details,
        };

        setResults(localResult);

        try {
          const userId = localStorage.getItem("user_id") || "1";
          const answersPayload = offlineQuestions.map((q) => ({
            question_id: q.id,
            selected_option: selectedAnswers[q.id] || "",
          }));
          const syncRes = await fetchWithAuth("/api/quiz/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: parseInt(userId),
              level: activeLevel,
              answers: answersPayload,
            }),
          });
          if (!syncRes.ok) {
            const syncText = await syncRes.text();
            console.warn("Offline quiz sync returned an error:", syncRes.status, syncText);
          } else {
            const syncData = await syncRes.json();
            if (syncData.current_xp !== undefined) {
              localStorage.setItem("current_xp", syncData.current_xp.toString());
            }
          }
        } catch (bgErr) {
          console.warn("Could not initiate background quiz sync:", bgErr);
        }
      } catch (err: any) {
        console.error("Local grading error:", err);
        setError("Failed to grade quiz locally.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const userId = localStorage.getItem("user_id") || "1";
      const answersPayload = questions.map((q) => ({
        question_id: q.id,
        selected_option: selectedAnswers[q.id] || "",
      }));

      const res = await fetchWithAuth("/api/quiz/submit", {
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
      if (resData.current_xp !== undefined) {
        localStorage.setItem("current_xp", resData.current_xp.toString());
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

  const handleAskTutorReview = () => {
    if (!results || !results.details) return;
    
    // Filter incorrect details
    const wrongDetails = results.details.filter(d => !d.is_correct);
    const serializedQuestions = wrongDetails.map((detail) => {
      const origQ = questions.find((q) => q.id === detail.question_id);
      const questionText = origQ ? origQ.question : `Sawal #${detail.question_id}`;
      const userChoice = selectedAnswers[detail.question_id];
      const userChoiceText = origQ && userChoice ? origQ.options[userChoice] : "N/A";
      const correctChoiceText = origQ ? origQ.options[detail.correct_option] : "N/A";
      
      return {
        question: questionText,
        userAnswer: `(${userChoice ? userChoice.toUpperCase() : "N/A"}) ${userChoiceText}`,
        correctAnswer: `(${detail.correct_option.toUpperCase()}) ${correctChoiceText}`,
        explanation: detail.explanation
      };
    });

    localStorage.setItem("quiz_review_questions", JSON.stringify(serializedQuestions));
    window.location.href = "/tutor";
  };

  const renderQuizNode = (levelNum: number, conceptId: string, title: string, urduTitle: string, icon: string) => {
    if (!dashboardData) return null;

    const currentLevel = dashboardData.current_level || 1;

    const scores = dashboardData.concept_mastery.reduce((acc: any, curr: any) => {
      acc[curr.concept_name] = curr.mastery_score;
      return acc;
    }, {} as Record<string, number>);

    const conceptToLevel: Record<string, number> = {
      budgeting: 1,
      saving: 2,
      emergency_funds: 3,
      inflation: 4,
      tax_basics: 5,
      investing: 6,
      mutual_funds: 71,
      islamic_banking: 72,
      stock_market: 81,
      gold_real_estate: 82,
      diversification: 9,
      retirement: 10,
    };

    const score = scores[conceptId] || 0;
    const nodeLevel = conceptToLevel[conceptId] || 1;

    const getStatus = () => {
      if (score >= 75) {
        return "mastered";
      }

      const nodeMeta = flowNodes.find((n) => n.id === conceptId);
      if (!nodeMeta) return "locked";
      if (nodeMeta.prereqs.length === 0) return "unlocked";

      const allPrereqsMastered = nodeMeta.prereqs.every((pId) => {
        const pScore = scores[pId] || 0;
        return pScore >= 75;
      });

      const anyPrereqMastered = nodeMeta.prereqs.some((pId) => {
        const pScore = scores[pId] || 0;
        return pScore >= 75;
      });

      const isUnlocked = conceptId === "diversification" ? anyPrereqMastered : allPrereqsMastered;
      if (isUnlocked) return "unlocked";

      return "locked";
    };

    const status = getStatus();

    let borderClass = "border-white/5 bg-slate-900/40 text-slate-400 opacity-60";
    let statusBadge = null;
    let cursorClass = "cursor-not-allowed";

    if (status === "mastered") {
      borderClass = "border-emerald-500/40 bg-emerald-500/5 text-slate-200 shadow-md shadow-emerald-500/5 hover:border-emerald-500/60";
      statusBadge = (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold animate-fade-in">
          {isUrdu ? "پاس ✅" : "Passed ✅"}
        </span>
      );
      cursorClass = "cursor-pointer";
    } else if (status === "unlocked") {
      borderClass = "border-cyan-500/40 bg-cyan-500/5 text-slate-200 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/60 ring-2 ring-cyan-500/10 animate-pulse-glow";
      statusBadge = (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold animate-fade-in">
          {isUrdu ? "شروع کریں" : "Start Quiz"}
        </span>
      );
      cursorClass = "cursor-pointer";
    } else {
      statusBadge = (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center gap-1 border border-white/5 animate-fade-in">
          <Lock size={8} /> {isUrdu ? "مقفل" : "Locked"}
        </span>
      );
    }

    const handleClick = () => {
      if (status !== "locked") {
        window.location.href = `/quiz?level=${levelNum}`;
      }
    };

    return (
      <div
        onClick={handleClick}
        className={`relative w-full max-w-[220px] p-4 rounded-xl border text-center transition-all duration-300 hover:scale-[1.02] ${borderClass} ${cursorClass}`}
      >
        {statusBadge}
        <div className="text-xl mb-1">{icon}</div>
        <h4 className="text-xs sm:text-sm font-bold truncate">Level {levelNum}: {isUrdu ? urduTitle : title}</h4>
        <p className="text-[10px] sm:text-xs text-slate-400 font-urdu mt-0.5" dir="rtl">
          {urduTitle}
        </p>
      </div>
    );
  };

  const renderGraphNodes = () => {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Level 1 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(1, "budgeting", "Budgeting Basics", "بجٹ کے اصول", "📊")}
        </div>

        {/* Line Down */}
        <div className="w-[2px] h-6 bg-emerald-500/30" />

        {/* Level 2 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(2, "saving", "Saving Habits", "بچت کی عادت", "🏦")}
        </div>

        {/* Line Down */}
        <div className="w-[2px] h-6 bg-emerald-500/30" />

        {/* Level 3 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(3, "emergency_funds", "Emergency Funds", "ایمرجنسی فنڈ", "🛡️")}
        </div>

        {/* Line Down */}
        <div className="w-[2px] h-6 bg-emerald-500/30" />

        {/* Level 4 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(4, "inflation", "Inflation & Purchasing Power", "مہنگائی کا اثر", "📈")}
        </div>

        {/* Line Down */}
        <div className="w-[2px] h-6 bg-emerald-500/30" />

        {/* Level 5 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(5, "tax_basics", "Tax Basics & Filing", "ٹیکس کے اصول", "📄")}
        </div>

        {/* Line Down */}
        <div className="w-[2px] h-6 bg-emerald-500/30" />

        {/* Level 6 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(6, "investing", "Investing Principles", "سرمایہ کاری", "💹")}
        </div>

        {/* Split Lines Down */}
        <div className="w-full max-w-md h-8 relative">
          <svg className="w-full h-full text-emerald-500/30" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 50,0 L 50,30 L 15,30 L 15,100 M 50,30 L 85,30 L 85,100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
          </svg>
        </div>

        {/* Level 7: Mutual Funds (7A) & Islamic Banking (7B) */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
          <div className="flex justify-center flex-col items-center">
            {renderQuizNode(71, "mutual_funds", "Mutual Funds (7A)", "میوچل فنڈز", "📋")}
            <div className="w-[2px] h-6 bg-emerald-500/30 mt-4" />
          </div>
          <div className="flex justify-center flex-col items-center">
            {renderQuizNode(72, "islamic_banking", "Islamic Banking (7B)", "اسلامی بینکاری", "🕌")}
            <div className="w-[2px] h-6 bg-emerald-500/30 mt-4" />
          </div>
        </div>

        {/* Level 8: Stock Market (8A) & Gold / Real Estate (8B) */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
          <div className="flex justify-center flex-col items-center">
            {renderQuizNode(81, "stock_market", "Stock Market (8A)", "اسٹاک مارکیٹ", "📈")}
          </div>
          <div className="flex justify-center flex-col items-center">
            {renderQuizNode(82, "gold_real_estate", "Gold & Property (8B)", "سونا اور رئیل اسٹیٹ", "🪙")}
          </div>
        </div>

        {/* Convergence Lines Down */}
        <div className="w-full max-w-md h-8 relative">
          <svg className="w-full h-full text-emerald-500/30" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 15,0 L 15,70 L 50,70 L 50,100 M 85,0 L 85,70 L 50,70 L 50,100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
          </svg>
        </div>

        {/* Level 9 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(9, "diversification", "Diversification & Risk", "تنوع", "🎯")}
        </div>

        {/* Line Down */}
        <div className="w-[2px] h-6 bg-emerald-500/30" />

        {/* Level 10 */}
        <div className="flex justify-center w-full">
          {renderQuizNode(10, "retirement", "Retirement & Legacy", "ریٹائرمنٹ اور وصیت", "👴")}
        </div>
      </div>
    );
  };

  if (level === null) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white animate-fade-in" dir={isUrdu ? "rtl" : "ltr"}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

          <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Award className="text-emerald-400 animate-pulse" size={20} />
                {isUrdu ? "مالیاتی کوئز گراف" : "Financial Concept Quizzes"}
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                {isUrdu ? "کوئز گراف — شروع کرنے کے لیے لیول منتخب کریں" : "Quiz Graph — Select a level to start"}
              </p>
            </div>
            <a
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isUrdu ? "ڈیش بورڈ پر جائیں" : "Go to Dashboard"}
            </a>
          </header>

          <main className="flex-1 p-4 md:p-8 pb-24 overflow-y-auto">
            {dashboardLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">
                  {isUrdu ? "کوئز گراف لوڈ ہو رہا ہے..." : "Quiz graph loading..."}
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {isUrdu ? "کوئز کے لیول کا انتخاب" : "Quiz Level Selection"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {isUrdu 
                      ? "سیکھنے کے خاکے (Learning Flow Graph) کے مطابق کھلے ہوئے لیولز کے کوئزز شروع کریں۔" 
                      : "Start quizzes for unlocked levels according to your learning flow graph."}
                  </p>
                </div>
                
                <GlassCard hover={false} className="p-6 md:p-8 bg-slate-900/30 backdrop-blur-md border border-white/5">
                  <div className="flex flex-col items-center gap-4">
                    {renderGraphNodes()}
                  </div>
                </GlassCard>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen" dir={isUrdu ? "rtl" : "ltr"}>
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <p className="text-lg animate-pulse">
            {isUrdu ? "کوئز سوالات لوڈ ہو رہے ہیں..." : "Loading quiz questions..."}
          </p>
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="flex min-h-screen" dir={isUrdu ? "rtl" : "ltr"}>
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 text-white">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
          <p className="text-xl font-bold mb-2">{isUrdu ? "خرابی پیش آئی" : "Error Occurred"}</p>
          <p className="text-slate-400 text-center max-w-md mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold"
          >
            <RefreshCw size={16} /> {isUrdu ? "دوبارہ لوڈ کریں" : "Reload"}
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
    <div className="flex min-h-screen bg-slate-950 text-white" dir={isUrdu ? "rtl" : "ltr"}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Award className="text-yellow-500 animate-pulse" size={20} />
              {isUrdu ? `لیول ${level} کوئز` : `Level ${level} Quiz`}
            </h1>
            <p className="text-xs md:text-sm text-slate-400">{quizTitle}</p>
          </div>
          <Link
            href="/quiz"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isUrdu ? "← گراف پر واپس جائیں" : "← Back to Graph"}
          </Link>
        </header>

        {isOfflineMode && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 md:px-8 py-2.5 flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-fade-in relative z-20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isUrdu ? "آف لائن موڈ: کوئز مقامی طور پر چل رہا ہے۔" : "Offline Mode: Quiz locally run ho raha hai."}
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 pb-24 overflow-y-auto">
          {!results ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Question Navigation Map */}
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">
                    {isUrdu ? "کوئز کی پیشرفت" : "Quiz Progress"}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {isUrdu 
                      ? `${answeredCount} / ${questions.length} حل شدہ`
                      : `${answeredCount} / ${questions.length} Answered`}
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
                      {isUrdu 
                        ? `سوال ${currentIndex + 1} از ${questions.length}`
                        : `Question ${currentIndex + 1} of ${questions.length}`}
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
                          style={{ textAlign: isUrdu ? "right" : "left" }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
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
                      {isUrdu ? "← پچھلا سوال" : "← Previous Question"}
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
                      >
                        {isUrdu ? "اگلا سوال →" : "Next Question →"}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> {isUrdu ? "سبمٹ ہو رہا ہے..." : "Submitting..."}
                          </>
                        ) : (
                          <>
                            {isUrdu ? "کوئز جمع کروائیں" : "Submit Quiz"} <Award size={16} />
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
                  {results.passed 
                    ? (isUrdu ? "مبارک ہو! آپ پاس ہوگئے 🎉" : "Mubarak Ho! Aap Pass Hogaye 🎉") 
                    : (isUrdu ? "کوشش جاری رکھیں! 🥺" : "Koshish Naa Chhodein! 🥺")}
                </h2>

                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                  {results.passed
                    ? (isUrdu 
                      ? `آپ نے لیول ${level} کا کوئز پاس کر لیا ہے اور نیا رینک حاصل کر لیا ہے! اب آپ لیول ${results.current_level} پر ہیں۔`
                      : `Aap ne Level ${level} ka quiz pass kar liya hai aur naya rank hasil kar liya hai! Ab aap Level ${results.current_level} par hain.`)
                    : (isUrdu 
                      ? "کوئز پاس کرنے کے لیے ۲۰ میں سے کم از کم ۱۵ صحیح جواب (۷۵٪) ہونا لازمی ہے۔ جوابوں کی تفصیلات نیچے ملاحظہ کریں اور دوبارہ کوشش کریں۔"
                      : "Quiz pass karne ke liye 20 mein se kam az kam 15 sahi jawab (75%) hona lazmi hai. Jawabon ki tafseelat niche mulahiza karein aur dobara koshish karein.")}
                </p>

                {/* Score Indicator */}
                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 mb-6 max-w-lg mx-auto w-full">
                  <div className="flex-1 inline-flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 border border-white/5 min-w-[150px]">
                    <span className="text-4xl font-extrabold text-white">{results.score}</span>
                    <span className="text-xs text-slate-500 mt-1">
                      {isUrdu ? `۲۰ میں سے (${(results.score / 20) * 100}٪)` : `out of 20 (${(results.score / 20) * 100}%)`}
                    </span>
                  </div>

                  {results.xp_awarded !== undefined && results.xp_awarded > 0 && (
                    <div className="flex-1 inline-flex flex-col p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-left font-sans text-xs">
                      <h4 className="text-emerald-400 font-bold text-sm mb-2 text-center">
                        {isUrdu ? "ایکس پی کے انعامات" : "XP Rewards"}
                      </h4>
                      <div className="space-y-1 text-slate-300">
                        <div className="flex justify-between">
                          <span>{isUrdu ? "کوشش / Quiz Attempt" : "Quiz Attempt"}</span>
                          <span className="text-emerald-400 font-bold">+20 XP</span>
                        </div>
                        {results.xp_breakdown?.first_pass && (
                          <div className="flex justify-between">
                            <span>{isUrdu ? "پہلی بار پاس / First Pass" : "First Pass Bonus"}</span>
                            <span className="text-emerald-400 font-bold">+100 XP</span>
                          </div>
                        )}
                        {results.xp_breakdown?.level_up && (
                          <div className="flex justify-between text-yellow-400">
                            <span>{isUrdu ? "رینک اپ / Level Up Bonus" : "Level Up Bonus"}</span>
                            <span className="font-bold">+200 XP</span>
                          </div>
                        )}
                        <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-bold text-white text-sm">
                          <span>{isUrdu ? "کل حاصل شدہ:" : "Total XP Earned:"}</span>
                          <span className="text-emerald-400">+{results.xp_awarded} XP</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="/dashboard"
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold"
                  >
                    {isUrdu ? "ڈیش بورڈ پر جائیں" : "Go to Dashboard"}
                  </a>
                  {!results.passed ? (
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all text-sm"
                    >
                      <RefreshCw size={16} /> {isUrdu ? "دوبارہ کوشش کریں" : "Try Again"}
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
                        {isUrdu ? "اگلا کوئز لیں" : "Next Level Quiz"} <ChevronRight size={16} />
                      </button>
                    )
                  )}
                </div>
              </GlassCard>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white">
                    {isUrdu ? "کوئز کی وضاحت اور جائزہ" : "Quiz Explanation & Review"}
                  </h3>
                  {results.details.some(d => !d.is_correct) && (
                    <button
                      onClick={handleAskTutorReview}
                      className="px-3 py-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-200 flex items-center gap-1.5"
                    >
                      💡 {isUrdu ? "غلط جوابات پر ٹیوٹر سے پوچھیں" : "Ask Tutor to Explain Wrong Answers"}
                    </button>
                  )}
                </div>
                {results.details.map((detail, idx) => {
                  const isExpanded = expandedDetails[detail.question_id] || false;
                  const origQ = questions.find((q) => q.id === detail.question_id);
                  const questionText = origQ ? origQ.question : `Sawal #${detail.question_id}`;
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
                          <div style={{ textAlign: isUrdu ? "right" : "left" }}>
                            <p className="text-sm font-bold text-slate-200">
                              {isUrdu ? `سوال ${idx + 1}:` : `Question ${idx + 1}:`}{" "}
                              <span className="font-normal text-slate-300">{questionText}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {isUrdu ? "آپ کا انتخاب: " : "Your Choice: "}{" "}
                              <span className={detail.is_correct ? "text-emerald-400" : "text-rose-400"}>
                                {userChoice ? `(${userChoice.toUpperCase()}) ${userChoiceText}` : (isUrdu ? "کچھ نہیں" : "None")}
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
                        <div className="mt-3 pl-8 pr-8 pt-3 border-t border-white/5 space-y-2 animate-fade-in">
                          <p className="text-xs text-slate-400">
                            {isUrdu ? "درست جواب: " : "Correct Answer: "}{" "}
                            <span className="text-emerald-400 font-semibold">
                              ({detail.correct_option.toUpperCase()}) {correctChoiceText}
                            </span>
                          </p>
                          <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5">
                            <p className="text-xs text-slate-400 font-semibold mb-1">
                              {isUrdu ? "توضیح (Explanation):" : "Explanation:"}
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed font-urdu text-right" dir="rtl">
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
