"use client";

import React from "react";

interface ConceptBadgeProps {
  name: string;
  mastery: number;
  className?: string;
}

export default function ConceptBadge({
  name,
  mastery,
  className = "",
}: ConceptBadgeProps) {
  const getColor = () => {
    if (mastery >= 70) return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" };
    if (mastery >= 40) return { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" };
    return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" };
  };

  const colors = getColor();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          mastery >= 70 ? "bg-emerald-400" : mastery >= 40 ? "bg-yellow-400" : "bg-red-400"
        }`}
      />
      {name}
      <span className="opacity-70">{mastery}%</span>
    </span>
  );
}
