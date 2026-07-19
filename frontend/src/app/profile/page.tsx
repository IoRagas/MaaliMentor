"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import GlassCard from "@/components/GlassCard";
import { User, ShieldAlert, Key, Award, Flame, LogOut, CheckCircle2, ChevronRight } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface ProfileData {
  username: string;
  user_level: string;
  current_level: number;
  current_xp: number;
  streak_current: number;
  streak_longest: number;
  mastery_scores: Record<string, number>;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUrdu, setIsUrdu] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

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
    const fetchProfile = async () => {
      const userId = localStorage.getItem("user_id") || "1";
      try {
        const res = await fetchWithAuth(`/api/auth/dashboard/${userId}`);
        if (res.ok) {
          const result = await res.json();
          const scores: Record<string, number> = {};
          result.concept_mastery?.forEach((item: any) => {
            scores[item.concept_name] = item.mastery_score;
          });

          setData({
            username: result.username,
            user_level: result.user_level,
            current_level: result.current_level,
            current_xp: result.current_xp,
            streak_current: result.streak_current || 0,
            streak_longest: result.streak_longest || 0,
            mastery_scores: scores,
          });
        }
      } catch (err) {
        console.error("Profile load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdError(isUrdu ? "براہ کرم تمام خانے پُر کریں۔" : "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(isUrdu ? "نیا پاس ورڈ میچ نہیں کر رہا۔" : "Passwords do not match.");
      return;
    }
    if (newPassword.length < 4) {
      setPwdError(isUrdu ? "پاس ورڈ کم از کم ۴ ہندسوں کا ہونا چاہیے۔" : "Password must be at least 4 characters.");
      return;
    }

    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(null);

    try {
      const res = await fetchWithAuth("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        setPwdSuccess(isUrdu ? "پاس ورڈ کامیابی سے تبدیل ہو گیا!" : "Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        setPwdError(err.detail || (isUrdu ? "پاس ورڈ تبدیل کرنے میں ناکامی۔" : "Failed to change password."));
      }
    } catch (e) {
      setPwdError(isUrdu ? "سرور سے رابطہ نہ ہو سکا۔" : "Error connecting to server.");
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-white text-lg animate-pulse">
            {isUrdu ? "پروفائل لوڈ ہو رہی ہے..." : "Loading profile..."}
          </div>
        </div>
      </div>
    );
  }

  const levelNamesEn: Record<number, string> = {
    1: "Budgeting Novice",
    2: "Savings Apprentice",
    3: "Emergency Planner",
    4: "Inflation Specialist",
    5: "Tax Strategy Analyst",
    6: "Investing Foundations Scholar",
    7: "Pathways Explorer (L7)",
    71: "Mutual Funds Specialist",
    72: "Shariah Compliance Specialist",
    8: "Markets Specialist (L8)",
    81: "Stock Market Analyst",
    82: "Real Estate & Gold Strategist",
    9: "Diversified Asset Manager",
    10: "Retirement & Legacy Planner",
  };
  const levelNamesUr: Record<number, string> = {
    1: "بجٹ بنانے والے نوآموز",
    2: "بچت کے شاگرد",
    3: "ایمرجنسی پلانر",
    4: "مہنگائی کے ماہر",
    5: "ٹیکس حکمت عملی کے تجزیہ کار",
    6: "سرمایہ کاری کے اسکالر",
    7: "راستوں کے متلاشی (لیول 7)",
    71: "میوچل فنڈز کے ماہر",
    72: "شریعہ کمپلائنس کے ماہر",
    8: "مارکیٹس کے ماہر (لیول 8)",
    81: "اسٹاک مارکیٹ کے تجزیہ کار",
    82: "رئیل اسٹیٹ اور سونا سٹرٹیجسٹ",
    9: "متنوع اثاثہ مینیجر",
    10: "ریٹائرمنٹ اور وصیت پلانر",
  };

  const currentLevelName = isUrdu 
    ? (levelNamesUr[data.current_level] || "مالیاتی سیکھنے والے") 
    : (levelNamesEn[data.current_level] || "Finance Learner");

  const badgeShowcase = [
    { id: "budgeting", name: "Budget Rookie", nameUr: "بجٹ نوآموز", desc: "Master Level 1", descUr: "لیول ۱ مکمل کریں", icon: "🏆" },
    { id: "saving", name: "Savings Prodigy", nameUr: "بچت کے ماہر", desc: "Master Level 2", descUr: "لیول ۲ مکمل کریں", icon: "🏦" },
    { id: "tax_basics", name: "Tax Specialist", nameUr: "ٹیکس کے ماہر", desc: "Master Level 5", descUr: "لیول ۵ مکمل کریں", icon: "📄" },
    { id: "islamic_banking", name: "Shariah Scholar", nameUr: "شریعہ کے اسکالر", desc: "Master Level 7B", descUr: "لیول ۷ بی مکمل کریں", icon: "🕌" },
    { id: "stock_market", name: "Equity Trader", nameUr: "حصص کے تاجر", desc: "Master Level 8A", descUr: "لیول ۸ اے مکمل کریں", icon: "📈" },
    { id: "diversification", name: "Wealth Architect", nameUr: "سرمایہ کار آرکیٹیکٹ", desc: "Master Level 9", descUr: "لیول ۹ مکمل کریں", icon: "🎯" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white" dir={isUrdu ? "rtl" : "ltr"}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {isUrdu ? "میرا پروفائل" : "My Profile"}
            </h1>
            <p className="text-sm text-slate-400">
              {isUrdu ? "اپنی رینکنگ، بیجز اور پاس ورڈ کا انتظام کریں" : "Manage your ranking, badges, and credentials"}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all duration-200"
          >
            <LogOut size={14} />
            {isUrdu ? "لاگ آؤٹ" : "Logout"}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto space-y-8 max-w-5xl mx-auto w-full">
          {/* Rank + Streak Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rank Card */}
            <GlassCard className="flex flex-col items-center justify-center p-6 border border-emerald-500/20 bg-emerald-500/5 text-center" glow>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-3xl mb-4 shadow-lg shadow-emerald-500/20">
                {data.username[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white">{data.username}</h2>
              <span className="mt-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold capitalize">
                {data.user_level}
              </span>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-[200px]">
                {isUrdu ? `${currentLevelName} (لیول ${data.current_level})` : `${currentLevelName} (Level ${data.current_level})`}
              </p>
              <div className="mt-4 text-xs font-bold text-yellow-400">
                ⭐ {data.current_xp} XP
              </div>
            </GlassCard>

            {/* Streak Card */}
            <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 ring-8 ring-orange-500/5">
                <Flame size={32} className="animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isUrdu ? "موجودہ سٹریک" : "Current Streak"}
              </h3>
              <p className="text-4xl font-extrabold text-orange-400 mt-2">
                {data.streak_current} {isUrdu ? "دن" : "Days"}
              </p>
              <p className="text-xs text-slate-500 mt-4">
                {isUrdu ? `سب سے طویل سٹریک: ${data.streak_longest} دن` : `Longest Streak: ${data.streak_longest} days`}
              </p>
            </GlassCard>

            {/* Assessment Retake Card */}
            <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isUrdu ? "آن بورڈنگ دوبارہ کریں" : "Retake Assessment"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {isUrdu 
                  ? "اگر آپ اپنا لیول دوبارہ ٹیسٹ کرنا چاہتے ہیں، تو اسیسمنٹ کو دوبارہ لیں۔" 
                  : "Agar aap apna level dobara check karna chahte hain, to assessment re-take karein."}
              </p>
              <button
                onClick={() => {
                  if (confirm(isUrdu ? "کیا آپ واقعی آن بورڈنگ دوبارہ شروع کرنا چاہتے ہیں؟" : "Are you sure you want to retake onboarding? This reset is visual only.")) {
                    window.location.href = "/onboarding";
                  }
                }}
                className="mt-6 flex items-center gap-1 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 text-xs font-semibold transition-all duration-200"
              >
                {isUrdu ? "اسیسمنٹ شروع کریں" : "Start Re-Onboarding"}
                <ChevronRight size={14} className={isUrdu ? "transform rotate-180" : ""} />
              </button>
            </GlassCard>
          </div>

          {/* Badges Collection */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              {isUrdu ? "بیجز گیلری" : "Badges Gallery"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {badgeShowcase.map((badge) => {
                const score = data.mastery_scores[badge.id] || 0;
                const isUnlocked = score >= 75;

                return (
                  <GlassCard
                    key={badge.id}
                    className={`!p-4 text-center border flex flex-col items-center justify-center transition-all duration-300 ${
                      isUnlocked
                        ? "border-yellow-500/40 bg-yellow-500/5 text-slate-100 shadow-md shadow-yellow-500/10 scale-[1.02]"
                        : "border-white/5 bg-slate-900/30 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className={`text-3xl mb-2 ${isUnlocked ? "animate-pulse" : "grayscale"}`}>
                      {badge.icon}
                    </div>
                    <h4 className={`text-xs font-bold ${isUnlocked ? "text-yellow-400" : "text-slate-400"}`}>
                      {isUrdu ? badge.nameUr : badge.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isUrdu ? badge.descUr : badge.desc}
                    </p>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Password Reset Form */}
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {isUrdu ? "سیکورٹی اور پاس ورڈ" : "Security & Password"}
            </h3>
            <GlassCard hover={false} className="p-6 border border-white/5">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <Key size={14} />
                  <span>{isUrdu ? "پاس ورڈ تبدیل کریں" : "Change Password"}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {isUrdu ? "پرانا پاس ورڈ" : "Old Password"}
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {isUrdu ? "نیا پاس ورڈ" : "New Password"}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {isUrdu ? "نیا پاس ورڈ دوبارہ درج کریں" : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>

                {pwdError && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                    <ShieldAlert size={14} />
                    <span>{pwdError}</span>
                  </div>
                )}

                {pwdSuccess && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-sm font-bold transition-all duration-200 shadow-lg shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                >
                  {pwdLoading ? (isUrdu ? "تبدیل ہو رہا ہے..." : "Changing...") : (isUrdu ? "تبدیل کریں" : "Update Password")}
                </button>
              </form>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
