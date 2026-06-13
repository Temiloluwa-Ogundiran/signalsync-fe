"use client";

import { type ReactNode } from "react";
import { AiDock } from "./ai-dock";

export function AiDockProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AiDock />
    </>
  );
}
