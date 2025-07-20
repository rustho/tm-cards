"use client";

import { useEffect, useState } from "react";
import "./SuccessToast.css";

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}

export function SuccessToast({ message, isVisible, onHide }: SuccessToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="success-toast">
      <div className="toast-content">
        <span className="toast-icon">✅</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
} 