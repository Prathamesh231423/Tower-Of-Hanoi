// Board geometry: turns a measured board box into disk/peg pixel positions.
// Kept free of React so the animation and the renderer share one source of truth.

export function computeLayout(width, height, diskCount) {
  const w = Math.max(260, Math.round(width || 0));
  const h = Math.max(220, Math.round(height || 0));
  const baseY = h - 48;
  const pegTopY = Math.max(48, h * 0.24);
  const stackTopY = pegTopY + 16;
  const usable = Math.max(60, baseY - stackTopY - 4);
  const diskH = Math.max(9, Math.min(26, usable / (diskCount + 0.3)));
  const towerXs = [1, 3, 5].map((step) => (w * step) / 6);
  const maxW = Math.min((w / 3) * 0.84, 200);
  const minW = Math.max(maxW * 0.3, 34);

  return { width: w, height: h, baseY, pegTopY, stackTopY, diskH, towerXs, maxW, minW, diskCount };
}

export function diskWidth(layout, size) {
  const { diskCount, minW, maxW } = layout;
  if (diskCount <= 1) return maxW;
  const ratio = (size - 1) / (diskCount - 1);
  return minW + (maxW - minW) * ratio;
}

export function diskHeight(layout) {
  return layout.diskH;
}

// Top-left y of a disk sitting at a given stack index (0 = resting on the base).
export function slotY(layout, stackIndex) {
  return layout.baseY - 4 - (stackIndex + 1) * layout.diskH;
}

export function restingPosition(layout, towerIndex, size, stackIndex) {
  const width = diskWidth(layout, size);
  return {
    x: layout.towerXs[towerIndex] - width / 2,
    y: slotY(layout, stackIndex),
    width,
    height: layout.diskH,
  };
}