"use client";

import { ReactNode } from "react";
import "./SelectionCard.css";

export type SelectionCardState = "default" | "selected" | "disabled";
export type SelectionCardType = "big card" | "small card";

export interface SelectionCardProps {
  state?: SelectionCardState;
  type?: SelectionCardType;
  text: string;
  text2?: string;
  showImage?: boolean;
  showEmoji?: boolean;
  showDescription?: boolean;
  imageUrl?: string;
  emoji?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function SelectionCard({
  state = "default",
  type = "big card",
  text,
  text2,
  showImage = true,
  showEmoji = false,
  showDescription = true,
  imageUrl,
  emoji,
  onClick,
  disabled = false,
}: SelectionCardProps) {
  const isSelected = state === "selected";
  const isDisabled = disabled || state === "disabled";

  return (
    <button
      className={`selection-card selection-card--${state} selection-card--${type.replace(" ", "-")}`}
      onClick={onClick}
      disabled={isDisabled}
      type="button"
    >
      <div className="selection-card__content">
        <div className="selection-card__text-content">
          {showEmoji && emoji && (
            <span className="selection-card__emoji">{emoji}</span>
          )}
          <div className="selection-card__text-primary">{text}</div>
          {showDescription && text2 && (
            <div className="selection-card__text-secondary">{text2}</div>
          )}
        </div>
        {showImage && imageUrl && (
          <div className="selection-card__image-container">
            <img
              src={imageUrl}
              alt={text}
              className="selection-card__image"
            />
          </div>
        )}
      </div>
    </button>
  );
}

