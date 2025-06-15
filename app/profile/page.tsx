"use client";

import { useTranslations } from "next-intl";
import { FooterMenu } from "@/components/FooterMenu";
import "./pageStyles.css";
import { Wizard } from "./ui/Wizard";

export default function Profile() {
  const t = useTranslations('profile');

  return (
    <div className="profile-page">
      <h1>{t('title')}</h1>
      <Wizard />
      <FooterMenu />
    </div>
  );
}
