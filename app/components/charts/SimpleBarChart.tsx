"use client";

import React, { useEffect, useRef } from "react";
import { ChartJS } from "./ChartRegistry";

interface BarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderRadius?: number;
  }[];
  formatValue?: (val: number) => string;
  height?: number;
  horizontal?: boolean;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  labels,
  datasets,
  formatValue = (v) => v.toLocaleString("id-ID"),
  height = 250,
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
      type: "bar",
      data: {
        labels,
        datasets: datasets.map((d) => ({
          ...d,
          borderRadius: d.borderRadius ?? 6,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              boxWidth: 12,
              font: {
                family: "DM Sans, sans-serif",
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                const val = item.raw as number;
                return `${item.dataset.label}: ${formatValue(val)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => formatValue(Number(v)),
              font: {
                size: 11,
              },
            },
            grid: {
              color: "#EAEFF4",
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 11,
              },
            },
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
  }, [labels, datasets, formatValue]);

  return (
    <div style={{ height }} className="w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
};
