"use client";

import React, { useEffect, useState } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

type ToastType = "info" | "warning" | "success" | "error";

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
};

const colorMap = {
  info: "border-cyan-500/40 bg-cyan-500/10",
  warning: "border-yellow-500/40 bg-yellow-500/10",
  success: "border-emerald-500/40 bg-emerald-500/10",
  error: "border-red-500/40 bg-red-500/10",
};

const iconColorMap = {
  info: "text-cyan-400",
  warning: "text-yellow-400",
  success: "text-emerald-400",
  error: "text-red-400",
};

export default function Toast({
  id,
  message,
  type = "info",
  duration = 4000,
  onDismiss,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const Icon = iconMap[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm transition-all duration-300 ${
        colorMap[type]
      } ${isExiting ? "opacity-0 translate-x-8" : "animate-slide-in-right opacity-100"}`}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColorMap[type]}`} />
      <p className="text-sm text-slate-200 flex-1">{message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(id), 300);
        }}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* Toast Container */
interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          message={t.message}
          type={t.type}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
