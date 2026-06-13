"use client";

import React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

type VoiceState = "idle" | "recording" | "processing";

interface VoiceButtonProps {
  state: VoiceState;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VoiceButton({
  state,
  onClick,
  size = "md",
  className = "",
}: VoiceButtonProps) {
  const sizeMap = {
    sm: { btn: "w-12 h-12", icon: 18, ring: "w-16 h-16" },
    md: { btn: "w-16 h-16", icon: 24, ring: "w-20 h-20" },
    lg: { btn: "w-20 h-20", icon: 32, ring: "w-28 h-28" },
  };

  const s = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Pulse rings when recording */}
      {state === "recording" && (
        <>
          <span
            className={`absolute ${s.ring} rounded-full bg-emerald-500/20`}
            style={{ animation: "pulse-ring 1.5s ease-out infinite" }}
          />
          <span
            className={`absolute ${s.ring} rounded-full bg-emerald-500/10`}
            style={{ animation: "pulse-ring 1.5s ease-out infinite 0.5s" }}
          />
        </>
      )}

      <button
        onClick={onClick}
        className={`${s.btn} rounded-full flex items-center justify-center transition-all duration-300 relative z-10
          ${
            state === "recording"
              ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:bg-red-600"
              : state === "processing"
              ? "bg-slate-600 cursor-wait"
              : "bg-gradient-to-br from-emerald-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95"
          }`}
        disabled={state === "processing"}
        aria-label={
          state === "recording"
            ? "Stop recording"
            : state === "processing"
            ? "Processing voice..."
            : "Start voice input"
        }
      >
        {state === "processing" ? (
          <Loader2 size={s.icon} className="text-white animate-spin" />
        ) : state === "recording" ? (
          <MicOff size={s.icon} className="text-white" />
        ) : (
          <Mic size={s.icon} className="text-white" />
        )}
      </button>
    </div>
  );
}
