// BitGridDepth.tsx
import React, { useEffect, useState } from "react";

const CELL_SIZE = 16;

export const BitGridDepth: React.FC = () => {
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });

  useEffect(() => {
    const updateGrid = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // ⬇️ ceil → floor に変更して「はみ出さないように」する
      const cols = Math.max(1, Math.floor(width / CELL_SIZE));
      const rows = Math.max(1, Math.floor(height / CELL_SIZE));

      setGridSize({ cols, rows });
    };

    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, []);

  const total = gridSize.rows * gridSize.cols;
  const cells = Array.from({ length: total }, (_, i) => i);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden", // ⬅️ 念のためここでもスクロールを殺す
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize.cols}, ${CELL_SIZE}px)`,
        gridAutoRows: `${CELL_SIZE}px`,
      }}
    >
      {cells.map((i) => {
        const row = Math.floor(i / gridSize.cols);
        const col = i % gridSize.cols;

        const depth =
          (row / Math.max(1, gridSize.rows - 1)) * 0.6 +
          (col / Math.max(1, gridSize.cols - 1)) * 0.4;

        const shade = Math.floor(255 * (1 - depth));

        return (
          <div
            key={i}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: `rgb(${shade}, ${shade}, ${shade})`,
            }}
          />
        );
      })}
    </div>
  );
};
