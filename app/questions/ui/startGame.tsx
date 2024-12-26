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
          <div className={`card-content light-blue-paper`}>
            <p>Игра состоит из 11 вопросов.</p>
            <br />
            <p>Отвечайте честно и откровенно.</p>
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
