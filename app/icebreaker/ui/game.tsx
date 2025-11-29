"use client";

import { useState, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import { useTranslations } from "next-intl";
import { Button } from "@telegram-apps/telegram-ui";
import {
  QUESTIONS,
  questionsCategoriesLabels,
  getRandomQuestionsWithoutCategoryRepetition,
} from "../constants/questions";
import logo from "../../../public/logo-black.png";

interface GameProps {
  onEndGame: () => void;
}

export default function Game({ onEndGame }: GameProps) {
  const t = useTranslations('questions');
  const randomQuestions = useMemo(
    () => getRandomQuestionsWithoutCategoryRepetition(QUESTIONS),
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    // preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="page">
      <div {...handlers} className="swipe-container">
        <div
          className="cards-wrapper"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {randomQuestions.map((card) => (
            <div key={card.id} className="card">
              <div className={`card-content ${card.type}`}>
                <div className="card-logo logo-font">
                  TRAVEL MATE
                </div>
                <div className="card-text">{card.text}</div>
                <div className="card-category">
                  {questionsCategoriesLabels[card.type]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentIndex < QUESTIONS.length - 1 && (
        <div className="button-container">
          <Button
            size="l"
            mode="filled"
            stretched
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            {t('nextQuestion')}
          </Button>
        </div>
      )}
      {currentIndex === QUESTIONS.length - 1 && (
        <div className="button-container">
          <Button size="l" mode="outline" stretched onClick={onEndGame}>
            {t('finishGame')}
          </Button>
        </div>
      )}
    </div>
  );
}
