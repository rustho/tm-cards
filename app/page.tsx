"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import "./pageStyles.css";
import { Button } from "@telegram-apps/telegram-ui";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState("rules");

  const cards = [
    {
      id: 1,
      text: "Если бы ты мог пригласить кого-нибудь на ужин (близкого человека, умершего родственника, знаменитость), кого бы ты выбрал?",
    },
    {
      id: 2,
      text: "Если бы ты мог, что бы ты изменил в том, как тебя воспитывали?",
    },
    {
      id: 3,
      text: "За 4 минуты расскажи партнеру историю твоей жизни настолько подробно, насколько это возможно.",
    },
    {
      id: 4,
      text: "Если бы ты смог сейчас оказаться в любой стране в мире, то что бы ты выбрал (а)",
    },
    {
      id: 5,
      text: "Какое твое самое ценное воспоминание из детства?",
    },
    {
      id: 6,
      text: "Что для тебя является изменой в отношениях?",
    },
    {
      id: 7,
      text: "Какая песня вызывает в тебе самые сильные чувства? Почему именно она?",
    },
    {
      id: 8,
      text: "Есть ли что-то, что ты уже давно мечтаешь сделать? Почему ты еще не сделал этого?",
    },
    {
      id: 9,
      text: "Что в дружбе для тебя наиболее ценно?",
    },
    {
      id: 10,
      text: "Что для тебя значит дружба?",
    },
    {
      id: 11,
      text: "Какое путешествие сильнее всего повлияло на тебя?",
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

  const Rules = () => {
    return (
      <div className="page">
        <div className="card">
          <div className="card-content">
            <p>Игра состоит из 11 вопросов.</p>
            <br />
            <p>Отвечайте честно и откровенно.</p>
          </div>
        </div>
        <div className="button-container">
          <Button
            size="l"
            mode="outline"
            stretched
            onClick={() => setCurrentPage("game")}
          >
            Начать игру
          </Button>
        </div>
      </div>
    );
  };

  const End = () => {
    return (
      <div className="page">
        <div className="card">
          <div className="card-content">
            <h1>Игра завершена</h1>
          </div>
        </div>
      </div>
    );
  };

  const Game = () => {
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

        {currentIndex < cards.length - 1 && (
          <div className="button-container">
            <Button
              size="l"
              mode="outline"
              stretched
              onClick={() => setCurrentIndex(currentIndex + 1)}
              label="Следующий вопрос"
            >
              Следующий вопрос
            </Button>
          </div>
        )}
        {currentIndex === cards.length - 1 && (
          <div className="button-container">
            <Button size="l" mode="outline" stretched>
              Завершить игру
            </Button>
          </div>
        )}
      </div>
    );
  };

  return currentPage === "rules" ? (
    <Rules />
  ) : currentPage === "end" ? (
    <End />
  ) : (
    <Game />
  );
}
