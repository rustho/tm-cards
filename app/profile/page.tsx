"use client";

import { FooterMenu } from "@/components/FooterMenu";
import "./pageStyles.css";
import { Wizard } from "./ui/Wizard";

export default function Profile() {
  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <Wizard />
      <FooterMenu />
    </div>
  );
}
