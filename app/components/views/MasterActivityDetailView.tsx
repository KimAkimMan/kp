"use client";

import React from "react";
import { Program, User } from "../../types";
import { DetailView } from "./DetailView";

interface MasterActivityDetailViewProps {
  program: Program;
  currentUser?: User;
  onBack: () => void;
}

export const MasterActivityDetailView: React.FC<MasterActivityDetailViewProps> = ({
  program,
  currentUser,
  onBack,
}) => (
  <DetailView
    program={program}
    currentUser={currentUser}
    onBack={onBack}
  />
);
