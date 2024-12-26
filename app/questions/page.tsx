"use client";

import { useState } from "react";
import Game from "./ui/game";
import StartGame from "./ui/startGame";
import EndGame from "./ui/endGame";
import "./pageStyles.css";

export default function Questions() {
  const [currentPage, setCurrentPage] = useState("rules");

  const handleEndGame = () => {
    setCurrentPage("end");
  };

  const handleStartGame = () => {
    setCurrentPage("game");
  };

  return currentPage === "rules" ? (
    <StartGame onStartGame={handleStartGame} />
  ) : currentPage === "end" ? (
    <EndGame />
  ) : (
    <Game onEndGame={handleEndGame} />
  );
}
