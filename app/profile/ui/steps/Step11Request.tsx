"use client";

import { Textarea } from "@telegram-apps/telegram-ui";
import { ProfileData, StepProps } from "../../types";

interface Step11RequestProps extends StepProps {
  data: ProfileData["request"];
  onUpdate: (request: ProfileData["request"]) => void;
}

export function Step11Request({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step11RequestProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.trim()) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      <h2>Теперь самое время рассказать про свой запрос на встречу.</h2>
      <p className="step-description">
        Это свободный формат без ограничений по символам. Ты можешь написать
        только одно и самое актуальное объявление и менять его в любое время или
        сразу указать несколько вариантов 😊
      </p>
      <form onSubmit={handleSubmit}>
        <Textarea
          value={data}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Опишите ваш запрос на встречу..."
          required
        />
        <div className="navigation-buttons">
          <button type="button" onClick={onBack}>
            Назад
          </button>
          <button type="submit" disabled={!data.trim()}>
            Далее
          </button>
        </div>
      </form>
    </div>
  );
}
