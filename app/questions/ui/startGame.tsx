"use client";

import { Button } from "@telegram-apps/telegram-ui";

interface StartGameProps {
  onStartGame: () => void;
}

export default function StartGame({ onStartGame }: StartGameProps) {
  const Rules = () => {
    return (
      <div className="page">
        <div className="card">
          <div className={`card-content start-game`}>
            <p>
              <b>Идеальные незнакомцы</b>
            </p>
            <br />
            <p>Правила</p>
            <ul>
              <li>1. Задавайте вопросы друг другу</li>
              <li>
                2. Отвечайте подробно и искренне, чтобы лучше узнать друг друга
              </li>
              <li>3. Можно пропускать неудобные вопросы</li>
            </ul>
            <br />
            <p>Хорошей игры 🫂</p>
          </div>
        </div>
        <div className="button-container">
          <Button size="l" mode="outline" stretched onClick={onStartGame}>
            Начать игру
          </Button>
        </div>
      </div>
    );
  };

  return <Rules />;
}
