// SplitBitGrid.tsx
import React, { useEffect, useState } from "react";

const TOP_CELL_SIZE = 24;   // 上半分（大きめ）
const BOTTOM_CELL_SIZE = 8; // 下半分（細かめ）

export const BitGridFull: React.FC = () => {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { width, height } = viewport;
  if (!width || !height) return null;

  const halfHeight = height / 2;
  const centerX = width / 2;
  const centerY = height / 2;

  // 0〜1 に正規化された “中心からの距離” から shade を計算
  const calcShade = (cx: number, cy: number) => {
    const nx = (cx - centerX) / centerX; // -1〜1
    const ny = (cy - centerY) / centerY; // -1〜1

    // 縦方向を強めに効かせて遠近感っぽくする（0.4:0.6 の重み）
    const dist = Math.sqrt(nx * nx * 0.4 + ny * ny * 0.6); // 0〜だいたい1.4くらい
    const t = Math.min(1, dist); // 0〜1にクランプ

    // 中央(距離0)がほぼ黒、端に行くほど白
    const shade = Math.floor(255 * Math.pow(t, 0.8)); // 0〜255
    return shade;
  };

  // ==== 上半分（大きいビット） ====
  const topCols = Math.max(1, Math.floor(width / TOP_CELL_SIZE));
  const topRows = Math.max(1, Math.floor(halfHeight / TOP_CELL_SIZE));
  const topCells = Array.from({ length: topRows * topCols }, (_, i) => i);

  // ==== 下半分（細かいビット） ====
  const bottomCols = Math.max(1, Math.floor(width / BOTTOM_CELL_SIZE));
  const bottomRows = Math.max(1, Math.floor(halfHeight / BOTTOM_CELL_SIZE));
  const bottomCells = Array.from(
    { length: bottomRows * bottomCols },
    (_, i) => i
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden", // スクロール禁止
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
      }}
    >
      {/* 上半分（大きいビット） */}
      <div
        style={{
          flex: "0 0 50%",
          display: "grid",
          gridTemplateColumns: `repeat(${topCols}, ${TOP_CELL_SIZE}px)`,
          gridAutoRows: `${TOP_CELL_SIZE}px`,
        }}
      >
        {topCells.map((i) => {
          const row = Math.floor(i / topCols);
          const col = i % topCols;

          const cx = (col + 1 / 2) * TOP_CELL_SIZE;
          const cy = (row + 1 / 2) * TOP_CELL_SIZE;

          const shade = calcShade(cx, cy);

          return (
            <div
              key={i}
              style={{
                width: TOP_CELL_SIZE,
                height: TOP_CELL_SIZE,
                backgroundColor: `rgb(${shade}, ${shade}, ${shade})`,
              }}
            />
          );
        })}
      </div>

      {/* 下半分（細かいビット） */}
      <div
        style={{
          flex: "0 0 50%",
          display: "grid",
          gridTemplateColumns: `repeat(${bottomCols}, ${BOTTOM_CELL_SIZE}px)`,
          gridAutoRows: `${BOTTOM_CELL_SIZE}px`,
        }}
      >
        {bottomCells.map((i) => {
          const row = Math.floor(i / bottomCols);
          const col = i % bottomCols;

          const cx = (col + 1 / 2) * BOTTOM_CELL_SIZE;
          const cy = halfHeight + (row + 1 / 2) * BOTTOM_CELL_SIZE;

          const shade = calcShade(cx, cy);

          return (
            <div
              key={i}
              style={{
                width: BOTTOM_CELL_SIZE,
                height: BOTTOM_CELL_SIZE,
                backgroundColor: `rgb(${shade}, ${shade}, ${shade})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};