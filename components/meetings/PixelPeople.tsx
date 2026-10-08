/** Two pixel-art people with «spark» strokes above (XP style), drawn on a 1-unit grid. */
const FIGURE = [
  "..#####..",
  ".#.....#.",
  ".#.....#.",
  ".#.....#.",
  "..#####..",
  ".#######.",
  "#.......#",
  "#.#...#.#",
  "#.#...#.#",
  "###...###",
  "..#.#.#..",
  "..#.#.#..",
  "..#####..",
];

const pixels = (dx: number, dy: number) =>
  FIGURE.flatMap((row, y) => row.split("").map((c, x) => (c === "#" ? `M${x + dx} ${y + dy}h1v1h-1z` : ""))).join("");

export const PixelPeople = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 22 19" className={className} shapeRendering="crispEdges" aria-hidden>
    <path d={`${pixels(1, 6)}${pixels(12, 6)}`} className="fill-foreground" />
    {/* sparks */}
    <path d="M7 1h1v1H7zM8 2h1v1H8zM11 0h1v3h-1zM15 1h1v1h-1zM14 2h1v1h-1z" className="fill-foreground" />
  </svg>
);
