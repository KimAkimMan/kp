"use client";

import React, { useEffect, useRef } from "react";
import { ChartJS } from "./ChartRegistry";

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  backgroundColors: string[];
  formatValue?: (val: number) => string;
  height?: number;
}

export const SimpleDoughnutChart: React.FC<DoughnutChartProps> = ({
  labels,
  data,
  backgroundColors,
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
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
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
                return `${item.label}: ${formatValue(val)}`;
              },
            },
          },
        },
        cutout: "68%",
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [labels, data, backgroundColors, formatValue]);

  return (
    <div style={{ height }} className="w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
};
