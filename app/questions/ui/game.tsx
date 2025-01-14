"use client";

import { useState, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import { Button } from "@telegram-apps/telegram-ui";
import { QUESTIONS, questionsCategoriesLabels } from "../constants/questions";

interface GameProps {
  onEndGame: () => void;
}

export default function Game({ onEndGame }: GameProps) {
  const randomQuestions = useMemo(
    () => QUESTIONS.sort(() => Math.random() - 0.5),
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
            mode="outline"
            stretched
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Следующий вопрос
          </Button>
        </div>
      )}
      {currentIndex === QUESTIONS.length - 1 && (
        <div className="button-container">
          <Button size="l" mode="outline" stretched onClick={onEndGame}>
            Завершить игру
          </Button>
        </div>
      )}
    </div>
  );
}
