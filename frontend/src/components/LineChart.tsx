"use client";

import React from "react";

interface DataPoint {
  label: string;
  nominal: number;
  real: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  className?: string;
}

export default function LineChart({
  data,
  width = 600,
  height = 300,
  className = "",
}: LineChartProps) {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 70 };
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

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="nominalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
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
            {d.label}
          </text>
        ))}

        {/* Area fills */}
        <path d={buildArea("nominal")} fill="url(#nominalGrad)" />
        <path d={buildArea("real")} fill="url(#realGrad)" />

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
          <span className="text-sm text-slate-400">Nominal Wealth</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500" />
          <span className="text-sm text-slate-400">Real Purchasing Power</span>
        </div>
      </div>
    </div>
  );
}
