"use client";

import React from "react";
import { Program, User } from "../../types";
import { DetailView } from "./DetailView";

interface MasterActivityDetailViewProps {
  program: Program;
  currentUser?: User;
  onBack: () => void;
  onNotify: (message: string, type?: "success" | "error") => void;
}

export const MasterActivityDetailView: React.FC<MasterActivityDetailViewProps> = ({
  program,
  currentUser,
  onBack,
  onNotify,
}) => (
  <DetailView
    program={program}
    currentUser={currentUser}
    onBack={onBack}
    onNotify={onNotify}
  />
);
