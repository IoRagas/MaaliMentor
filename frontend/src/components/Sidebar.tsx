"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  Gamepad2,
  Target,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", urdu: "ڈیش بورڈ", icon: LayoutDashboard },
  { href: "/tutor", label: "Tutor", urdu: "ٹیوٹر", icon: MessageCircle },
  { href: "/quiz", label: "Quiz Graph", urdu: "کوئز گراف", icon: Award },
  { href: "/simulator", label: "Simulator", urdu: "سمیولیٹر", icon: Gamepad2 },
  { href: "/goals", label: "Goals", urdu: "مقاصد", icon: Target },
  { href: "/profile", label: "Profile", urdu: "پروفائل", icon: User },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isUrdu, setIsUrdu] = useState(false);
  const pathname = usePathname();

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

  const toggleLanguage = () => {
    const newUrdu = !isUrdu;
    setIsUrdu(newUrdu);
    localStorage.setItem("global_lang", newUrdu ? "ur" : "en");
    window.dispatchEvent(new Event("languageChange"));
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-white/5 bg-slate-900/50 backdrop-blur-xl ${
          collapsed ? "w-20" : "w-64"
        } ${className}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h2 className="text-base font-bold text-white leading-tight">Maali Mentor</h2>
              <p className="text-xs text-slate-400">مالی مینٹر</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-emerald-500" />
                )}
                <item.icon
                  size={22}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white"
                  }`}
                />
                {!collapsed && (
                  <div className="animate-fade-in">
                    <span className="text-sm font-medium">{isUrdu ? item.urdu : item.label}</span>
                    <span className="block text-[10px] text-slate-500">{isUrdu ? item.label : item.urdu}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language toggle */}
        <div className="px-3 py-2 border-t border-white/5">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-200 group relative"
          >
            <span className="text-lg font-bold flex-shrink-0 w-5 text-center">ع</span>
            {!collapsed && (
              <div className="animate-fade-in text-left">
                <span className="text-sm font-medium">{isUrdu ? "English" : "اردو (Urdu)"}</span>
                <span className="block text-[10px] text-cyan-500/70">{isUrdu ? "انگریزی" : "اردو میں بدلیں"}</span>
              </div>
            )}
          </button>
        </div>

        {/* Logout button */}
        <div className="px-3 py-2 border-t border-white/5">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 group relative"
          >
            <LogOut size={22} className="flex-shrink-0 text-rose-500 group-hover:text-rose-400" />
            {!collapsed && (
              <div className="animate-fade-in text-left">
                <span className="text-sm font-medium">Logout</span>
                <span className="block text-[10px] text-rose-500/70">لاگ آؤٹ</span>
              </div>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 z-40 flex items-center justify-around px-2 pb-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
            >
              <item.icon
                size={18}
                className={`transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-400"
                }`}
              />
              <span className="text-[9px] font-semibold mt-0.5">{isUrdu ? item.urdu : item.label}</span>
            </Link>
          );
        })}
        {/* Mobile Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 text-cyan-400 hover:text-cyan-300"
        >
          <span className="text-sm font-bold leading-none w-5 text-center">ع</span>
          <span className="text-[9px] font-semibold mt-0.5">{isUrdu ? "English" : "اردو"}</span>
        </button>
      </nav>
    </>
  );
}
