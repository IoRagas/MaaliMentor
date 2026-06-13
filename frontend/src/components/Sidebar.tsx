"use client";

import React, { useState } from "react";
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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", urdu: "ڈیش بورڈ", icon: LayoutDashboard },
  { href: "/tutor", label: "Tutor", urdu: "ٹیوٹر", icon: MessageCircle },
  { href: "/simulator", label: "Simulator", urdu: "سمیولیٹر", icon: Gamepad2 },
  { href: "/goals", label: "Goals", urdu: "مقاصد", icon: Target },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="block text-[10px] text-slate-500">{item.urdu}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 z-40 flex items-center justify-around px-6 pb-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200
                ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
            >
              <item.icon
                size={20}
                className={`transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-400"
                }`}
              />
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
