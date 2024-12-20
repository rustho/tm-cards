"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import "./pageStyles.css";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    {
      id: 1,
      text: "Какие шоу тебе нравятся?",
    },
    {
      id: 2,
      text: "Каковы ваши претензии на славу?",
    },
    {
      id: 3,
      text: "Как часто вы занимаетесь спортом?",
    },
    {
      id: 4,
      text: "Вы обычно рано или поздно?",
    },
    {
      id: 5,
      text: "Какие у вас причуды?",
    },
    {
      id: 6,
      text: "Как часто вы, люди, смотрите?",
    },
    {
      id: 7,
      text: "Какой твой любимый напиток?",
    },
    {
      id: 8,
      text: "Что ты надеешься никогда не изменится?",
    },
    {
      id: 9,
      text: "Какая машина твоей мечты?",
    },
    {
      id: 10,
      text: "Откуда бы вы предпочли?",
    },
    {
      id: 11,
      text: "Какие песни вы полностью запомнили?",
    },
    {
      id: 12,
      text: "Что бы вы оценили 10/10?",
    },
    {
      id: 13,
      text: "Какой твой любимый цвет?",
    },
    {
      id: 14,
      text: "Какая твоя любимая кухня?",
    },
    {
      id: 15,
      text: "Какой твой любимый напиток?",
    },
    {
      id: 16,
      text: "Какая ваша самая рекомендуемая книга?",
    },
    {
      id: 17,
      text: "Какая твоя самая страшная история?",
    },
    {
      id: 18,
      text: "Какой ваш самый ненавистный напиток или еда?",
    },
    {
      id: 19,
      text: "Какой твой любимый фильм?",
    },
    {
      id: 20,
      text: "Какой твой любимый боевик?",
    },
  ];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < cards.length - 1) {
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
          {cards.map((card) => (
            <div key={card.id} className="card">
              <div className="card-content">{card.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dots">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
