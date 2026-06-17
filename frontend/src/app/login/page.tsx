"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, User, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Meharbani karke dono username aur password likhein.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("user_id", data.user_id.toString());
        localStorage.setItem("username", data.username);
        localStorage.setItem("user_level", data.user_level);
        localStorage.setItem("current_level", data.current_level.toString());
        router.push("/dashboard");
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || "Authentication failed.");
      }
    } catch (err: any) {
      console.warn("Backend login failed, checking fallback credentials:", err);
      
      // Fallback local verification for robust demonstration
      if (username.trim() === "demo1" && password.trim() === "demo123") {
        localStorage.setItem("user_id", "999");
        localStorage.setItem("username", "demo1");
        localStorage.setItem("user_level", "Intermediate");
        localStorage.setItem("current_level", "3");
        router.push("/dashboard");
      } else {
        setError(err.message || "Invalid Username or Password. Dobara koshish karein.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative bg-slate-950 text-white overflow-hidden">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-10 hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Maali Mentor</h1>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <GlassCard className="!p-8" hover={false} glow>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Login</h2>
            <p className="text-sm text-slate-400">Apna Account Login Karein</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">User ID / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. demo1"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. demo123"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Demo user hint alert */}
            <div className="p-3.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-[11px] text-emerald-400/80 leading-relaxed">
              💡 **Demo Credentials:**
              <br />
              User ID: <code className="font-bold text-white bg-slate-900/50 px-1 py-0.5 rounded">demo1</code> &nbsp;&nbsp; Password: <code className="font-bold text-white bg-slate-900/50 px-1 py-0.5 rounded">demo123</code>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 transition-all duration-200 mt-6"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Login Karein
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Account Creation Link */}
          <div className="text-center mt-6 pt-6 border-t border-white/5">
            <span className="text-xs text-slate-400">Account nahi hai? </span>
            <Link href="/onboarding" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Naya Account Banayein
            </Link>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
