"use client";

import { FooterMenu } from "@/components/FooterMenu";
import "./pageStyles.css";
import { Wizard } from "./ui/Wizard";

/** Onboarding page: the wizard fills the screen above the fixed footer (pb-24). */
export default function Profile() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden px-4 pb-24">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
        <Wizard />
      </div>
      <FooterMenu />
    </div>
  );
}
