"use client";

import { ReactNode } from "react";
import "./SelectionGrid.css";

interface SelectionGridProps {
  children: ReactNode;
  maxSelections?: number;
  currentSelections?: number;
}

export function SelectionGrid({ 
  children, 
  maxSelections, 
  currentSelections 
}: SelectionGridProps) {
  return (
    <>
      <div className="button-grid">
        {children}
      </div>
      {maxSelections !== undefined && currentSelections !== undefined && (
        <div className="selection-count">
          Выбрано: {currentSelections}/{maxSelections}
        </div>
      )}
    </>
  );
} 