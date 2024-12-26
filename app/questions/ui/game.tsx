"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Button } from "@telegram-apps/telegram-ui";
import { QUESTIONS } from "../constants/questions";

const typePages = [
  "green-paper",
  "light-blue-paper",
  "gray-blue-paper",
  "blue-paper",
  "light-gray-paper",
];

interface GameProps {
  onEndGame: () => void;
}

export default function Game({ onEndGame }: GameProps) {
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

  const cardContentClass = typePages[currentIndex % typePages.length];

  return (
    <div className="page">
      <div {...handlers} className="swipe-container">
        <div
          className="cards-wrapper"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {QUESTIONS.map((card) => (
            <div key={card.id} className="card">
              <div className={`card-content ${cardContentClass}`}>
                {card.text}
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
