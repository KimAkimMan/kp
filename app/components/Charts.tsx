"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  DoughnutController,
  LineController,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  DoughnutController,
  LineController
);

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

    // Custom plugin: Vertical Target Reference Line at 100%
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

          // Label "Target (100%)"
          chartCtx.fillStyle = "#1E4E8C";
          chartCtx.font = "bold 10px 'DM Sans', sans-serif";
          chartCtx.textAlign = "center";
          chartCtx.textBaseline = "bottom";
          chartCtx.fillText("Target (100%)", xPos, chartArea.top - 6);
          chartCtx.restore();
        }
      },
    };

    // Custom plugin: End-of-bar Percentage Label
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
            right: 55, // reserve room for end of bar labels
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
                if (val === null || val === undefined) return `${context.dataset.label}: -`;
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
