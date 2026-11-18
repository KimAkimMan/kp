import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "SIPANTAU - Sistem Informasi Penyimpanan Data dan Pemantauan Kegiatan PSU",
  description:
    "SIPANTAU - Sistem Informasi Penyimpanan Data dan Pemantauan Kegiatan PSU. Tagline: Data Tersimpan, Progres Terpantau. Dinas Perumahan, Kawasan Permukiman dan Pertanahan Kab. Kuningan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={dmSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
      </head>
      <body className="min-h-screen antialiased bg-[#F4F7FA] text-[#18304B]">
        {children}
      </body>
    </html>
  );
}
