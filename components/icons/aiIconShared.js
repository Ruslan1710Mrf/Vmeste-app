export const NEON_CYAN = '#00E5FF';
export const NEON_BLUE = '#0EA5E9';
export const NEON_LIGHT = '#38BDF8';
export const NEON_GLOW = '#67E8F9';
export const NEON_WHITE = '#E0F7FF';
export const CORE_DARK = '#041E2A';
export const CORE_MID = '#0C4A6E';

export const CENTER = 12;
export const CHIP = { x: 8.6, y: 8.6, size: 6.8, rx: 1.4 };

export function getOrbitNodes(count, radius, cx = CENTER, cy = CENTER) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}
