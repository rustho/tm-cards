"use client";

export default function EndGame() {
  const End = () => {
    return (
      <div className="page">
        <div className="card">
          <div className={`card-content ${"light-gray-paper"}`}>
            <h1>Игра завершена</h1>
          </div>
        </div>
      </div>
    );
  };

  return <End />;
}
