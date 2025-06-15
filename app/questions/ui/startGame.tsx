"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@telegram-apps/telegram-ui";
import { useRouter } from "next/navigation";

interface StartGameProps {
  onStartGame: () => void;
}

export default function StartGame({ onStartGame }: StartGameProps) {
  const t = useTranslations('questions');
  const [isEasterEggClickedTimes, setIsEasterEggClickedTimes] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (isEasterEggClickedTimes === 5) {
      router.push("/profile");
    }
  }, [isEasterEggClickedTimes]);

  const Rules = () => {
    return (
      <div className="page">
        <div
          className="easter-egg"
          onClick={() => setIsEasterEggClickedTimes((i) => i + 1)}
        />
        <div className="card">
          <div className={`card-content start-game`}>
            <p>
              <b>{t('gameTitle')}</b>
            </p>
            <br />
            <p>{t('rules')}</p>
            <ul>
              <li>{t('rule1')}</li>
              <li>{t('rule2')}</li>
              <li>{t('rule3')}</li>
            </ul>
            <br />
            <p>{t('goodGame')}</p>
          </div>
        </div>
        <div className="button-container">
          <Button size="l" mode="outline" stretched onClick={onStartGame}>
            {t('startGame')}
          </Button>
        </div>
      </div>
    );
  };

  return <Rules />;
}
