import { useElementSize } from "./useElementSize";

const getSeatConfig = (count: number) => {
  // frac ≈ 讓相鄰座位相接的比例；radius 是座位離圓心的距離（%）；
  // 6 人與 8 人用相同 frac（手機上不再放大，中間留給筆記）；13 人以上維持原樣。
  if (count <= 6) return { max: 460, frac: 0.248, floor: 58, radius: 34 };
  if (count <= 8) return { max: 500, frac: 0.248, floor: 58, radius: 36 };
  if (count <= 10) return { max: 420, frac: 0.206, floor: 50, radius: 37 };
  if (count <= 12) return { max: 360, frac: 0.177, floor: 46, radius: 38 };
  if (count <= 15) return { max: 300, frac: 0.150, floor: 38, radius: 40 };
  return { max: 232, frac: 0.115, floor: 32, radius: 41 };
};

/**
 * 圓桌等比縮放：量測外框可用區，取內接正方形當圓桌，座位 = min(桌機上限, 板寬 * 比例)。
 * 說書人魔典（Grimoire）與舞台中央（CenterStage）共用。
 */
export const useSeatLayout = (totalSeats: number) => {
  const [boardWrapRef, boardWrap] = useElementSize<HTMLDivElement>();
  const boardPx = Math.min(boardWrap.width, boardWrap.height) || 0;

  const computeSeatPx = (count: number) => {
    const cfg = getSeatConfig(count);
    // 桌機（板寬 ≥ 560）且 ≤12 人時，座位縮 0.82 → 間隔加大、較不擁擠；窄屏與 13+ 不受影響
    const gf = boardPx >= 560 && count <= 12 ? 0.82 : 1;
    return Math.min(cfg.max, Math.max(cfg.floor, (boardPx || 720) * cfg.frac * gf));
  };

  const seatCfg = getSeatConfig(totalSeats);
  const seatPx = computeSeatPx(totalSeats);
  // 筆記圈圈基準：座位大小夾在「9 人排版」與「15 人排版」之間，避免少人時太大、多人時太小
  const tokenBaseSeatPx = Math.min(computeSeatPx(9), Math.max(computeSeatPx(15), seatPx));
  // 夜晚順序標示：以 10 人的座位大小為上限，9 人以下不再放大
  const badgePx = Math.max(18, Math.min(seatPx, computeSeatPx(10)) * 0.32);

  const getSeatStyle = (index: number) => {
    const angleDeg = ((index - 1) / totalSeats) * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const { radius } = seatCfg;
    return {
      left: `${50 + radius * Math.cos(angleRad)}%`,
      top: `${50 + radius * Math.sin(angleRad)}%`,
      transform: 'translate(-50%, -50%)',
      width: `${seatPx}px`,
      height: `${seatPx}px`,
    };
  };

  return { boardWrapRef, boardPx, seatPx, seatCfg, tokenBaseSeatPx, badgePx, getSeatStyle };
};
