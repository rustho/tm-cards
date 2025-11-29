"use client";

import { useTranslations } from "next-intl";
import { FooterMenu } from "@/components/FooterMenu";
import "./pageStyles.css";
import { Wizard } from "./ui/Wizard";

export default function Profile() {
  const t = useTranslations('profile');

  return (
    <div style={{ minHeight: 'calc(100vh - 55px)', height: 'calc(100vh - 55px)', display: 'flex', flexDirection: 'column' }}>
      <div className="max-w-4xl p-6" style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
        <Wizard />
      </div>
      <FooterMenu />
    </div>
  );
}
