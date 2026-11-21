// SPDX-License-Identifier: MPL-2.0

export type BrainFrame = { x: number; y: number; scale: number }

export function frameAbovePrompt(
  canvas: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>,
  viewport: { left: number; top: number; width: number; height: number },
  promptTop: number,
): BrainFrame {
  const left = Math.max(canvas.left, viewport.left)
  const right = Math.min(canvas.right, viewport.left + viewport.width)
  const top = Math.max(canvas.top, viewport.top)
  const bottom = Math.min(canvas.bottom, viewport.top + viewport.height)
  const available = Math.max(0, bottom - top)
  const above = Math.min(bottom, promptTop) - top
  const height = above >= Math.min(112, available * 0.65) ? above : available
  const width = Math.max(0, right - left)
  return {
    x: left + width / 2 - canvas.left,
    y: top + height / 2 - canvas.top,
    scale: Math.max(1, Math.min(width * 0.40, (height - 24) / 1.5)),
  }
}
