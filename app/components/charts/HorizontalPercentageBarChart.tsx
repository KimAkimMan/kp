"use client";

import React, { useEffect, useRef } from "react";
import { ChartJS } from "./ChartRegistry";

export interface HorizontalBarItem {
  kategori: string;
  satuan: string;
  persentase: number;
  target: number;
  realisasi: number;
  sisa: number;
  status: string;
  color: string;
}

interface HorizontalPercentageBarChartProps {
  items: HorizontalBarItem[];
  height?: number;
}

export const HorizontalPercentageBarChart: React.FC<HorizontalPercentageBarChartProps> = ({
  items,
  height = 260,
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

    const maxVal = Math.max(...items.map((it) => it.persentase), 100);
    const xMax = Math.max(100, Math.ceil(maxVal * 1.15));

    const targetLinePlugin = {
      id: "targetLine",
      afterDraw(chart: ChartJS) {
        const {
          ctx: chartCtx,
          chartArea,
          scales: { x },
        } = chart;
        if (!chartArea || !x) return;
        const xPos = x.getPixelForValue(100);
        if (xPos >= chartArea.left && xPos <= chartArea.right + 30) {
          chartCtx.save();
          chartCtx.beginPath();
          chartCtx.strokeStyle = "#1E4E8C";
          chartCtx.lineWidth = 2;
          chartCtx.setLineDash([5, 4]);
          chartCtx.moveTo(xPos, chartArea.top - 4);
          chartCtx.lineTo(xPos, chartArea.bottom);
          chartCtx.stroke();

          chartCtx.fillStyle = "#1E4E8C";
          chartCtx.font = "bold 10px 'DM Sans', sans-serif";
          chartCtx.textAlign = "center";
          chartCtx.textBaseline = "bottom";
          chartCtx.fillText("Target (100%)", xPos, chartArea.top - 6);
          chartCtx.restore();
        }
      },
    };

    const endBarLabelsPlugin = {
      id: "endBarLabels",
      afterDatasetsDraw(chart: ChartJS) {
        const { ctx: chartCtx, scales: { x } } = chart;
        if (!x) return;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((bar, index) => {
          const it = items[index];
          if (it) {
            const formatted =
              it.persentase.toLocaleString("id-ID", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }) + "%";
            chartCtx.save();
            chartCtx.fillStyle = "#143965";
            chartCtx.font = "bold 11px 'DM Sans', sans-serif";
            chartCtx.textAlign = "left";
            chartCtx.textBaseline = "middle";
            const b = bar as unknown as { x: number; y: number };
            chartCtx.fillText(formatted, b.x + 8, b.y);
            chartCtx.restore();
          }
        });
      },
    };

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: items.map((it) => it.kategori),
        datasets: [
          {
            label: "Capaian (%)",
            data: items.map((it) => it.persentase),
            backgroundColor: items.map((it) => it.color),
            borderRadius: 6,
            barThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 22,
            right: 55,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#0F2847",
            titleFont: { family: "DM Sans, sans-serif", size: 12, weight: "bold" },
            bodyFont: { family: "DM Sans, sans-serif", size: 11 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              title: (context) => {
                const idx = context[0].dataIndex;
                const it = items[idx];
                return `${it.kategori} (${it.satuan})`;
              },
              label: (context) => {
                const idx = context.dataIndex;
                const it = items[idx];
                return [
                  `• Capaian: ${it.persentase.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
                  `• Target: ${it.target.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${it.satuan}`,
                  `• Realisasi: ${it.realisasi.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${it.satuan}`,
                  `• Sisa: ${it.sisa.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${it.satuan}`,
                  `• Status: ${it.status}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: xMax,
            ticks: {
              callback: (v) => `${v}%`,
              font: { family: "DM Sans, sans-serif", size: 10 },
              color: "#65778B",
            },
            grid: {
              color: "#EAEFF4",
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              font: { family: "DM Sans, sans-serif", size: 12, weight: "bold" },
              color: "#143965",
            },
          },
        },
      },
      plugins: [targetLinePlugin, endBarLabelsPlugin],
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [items]);

  return (
    <div style={{ height }} className="w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
};
