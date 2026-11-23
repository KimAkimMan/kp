"use client";

import React, { useEffect, useRef } from "react";
import { ChartJS } from "./ChartRegistry";

interface CumulativeTrendLineChartProps {
  labels: string[];
  targetData: number[];
  realisasiData: (number | null)[];
  unitLabel: string;
  height?: number;
}

export const CumulativeTrendLineChart: React.FC<CumulativeTrendLineChartProps> = ({
  labels,
  targetData,
  realisasiData,
  unitLabel,
  height = 240,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Target Terencana (${unitLabel})`,
            data: targetData,
            borderColor: "#1E4E8C",
            backgroundColor: "rgba(30, 78, 140, 0.05)",
            borderDash: [5, 4],
            borderWidth: 2,
            tension: 0.2,
            fill: false,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
          {
            label: `Realisasi Lapangan (${unitLabel})`,
            data: realisasiData,
            borderColor: "#148B87",
            backgroundColor: "rgba(20, 139, 135, 0.12)",
            borderWidth: 2.5,
            tension: 0.2,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#148B87",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 14,
              font: { family: "DM Sans, sans-serif", size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw as number | null;
                if (val === null || val === undefined)
                  return `${context.dataset.label}: -`;
                return `${context.dataset.label}: ${val.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${unitLabel}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => `${Number(v).toLocaleString("id-ID")}`,
              font: { size: 10 },
            },
            grid: { color: "#EAEFF4" },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [labels, targetData, realisasiData, unitLabel]);

  return (
    <div style={{ height }} className="w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
};
