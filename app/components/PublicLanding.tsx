/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { PimpninAchievementSection } from "./PimpninAchievementSection";
import { usePublicLanding } from "./landing/usePublicLanding";
import { PublicLandingHeader } from "./landing/PublicLandingHeader";
import { PublicLandingHero } from "./landing/PublicLandingHero";
import { PublicLandingStats } from "./landing/PublicLandingStats";
import { PublicLandingProjects } from "./landing/PublicLandingProjects";
import { PublicLandingDocumentation } from "./landing/PublicLandingDocumentation";
import { PublicLandingLocation } from "./landing/PublicLandingLocation";
import { PublicLandingFooter } from "./landing/PublicLandingFooter";

interface PublicLandingProps {
  onOpenLogin: () => void;
  onSelectProgram: (id: number) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onOpenLogin,
  onSelectProgram,
}) => {
  const {
    landingYearFilter,
    setLandingYearFilter,
    landingCategoryFilter,
    setLandingCategoryFilter,
    loading,
    error,
    heroIndex,
    setHeroIndex,
    documentationCards,
    availableYears,
    availableCategories,
    filteredProjects,
    summary,
    activeCount,
    doneCount,
    paguBelumDitetapkan,
    triggerRefresh,
  } = usePublicLanding({ onSelectProgram });

  return (
    <div className="w-full min-h-screen bg-[#F5F8FB]">
      <PublicLandingHeader
        onOpenLogin={onOpenLogin}
        triggerRefresh={triggerRefresh}
      />

      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C] mb-4"></div>
          <p className="text-[#65778B] text-sm">Memuat data kegiatan...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[#65778B] text-sm mb-3">{error}</p>
          <button
            onClick={triggerRefresh}
            className="px-4 py-2 rounded-lg text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && (
        <>
          <PublicLandingHero heroIndex={heroIndex} setHeroIndex={setHeroIndex} />

          <PublicLandingStats
            activeCount={activeCount}
            doneCount={doneCount}
            summary={summary}
            paguBelumDitetapkan={paguBelumDitetapkan}
          />

          <PublicLandingProjects
            filteredProjects={filteredProjects}
            availableYears={availableYears}
            availableCategories={availableCategories}
            yearFilter={landingYearFilter}
            categoryFilter={landingCategoryFilter}
            onYearChange={setLandingYearFilter}
            onCategoryChange={setLandingCategoryFilter}
            onReset={() => {
              setLandingYearFilter("");
              setLandingCategoryFilter("");
            }}
            onSelectProgram={onSelectProgram}
          />

          <PublicLandingDocumentation documentationCards={documentationCards} />

          <section id="pencapaian" className="bg-[#F5F8FB] px-[5%] py-16">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="mb-2">
                <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
                  TRANSPARANSI KINERJA
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
                  Pencapaian Kegiatan & Capaian Fisik
                </h2>
                <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
                  Akumulasi capaian target dan realisasi fisik per kategori kegiatan pembangunan infrastruktur permukiman secara transparan.
                </p>
              </div>
              <PimpninAchievementSection programs={filteredProjects} />
            </div>
          </section>

          <PublicLandingLocation />
          <PublicLandingFooter />
        </>
      )}
    </div>
  );
};
