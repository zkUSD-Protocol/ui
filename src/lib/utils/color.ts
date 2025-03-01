export function getGradientColorForLTV(percentage: number): string {
  const healthy = { h: 120, s: 70, l: 50 };
  const warning = { h: 60, s: 70, l: 50 };
  const danger = { h: 0, s: 70, l: 50 };

  if (percentage <= 40) {
    return `hsl(${healthy.h}, ${healthy.s}%, ${healthy.l}%)`;
  } else if (percentage < 50) {
    const t = (percentage - 40) / 10;
    return interpolateColor(healthy, warning, t);
  } else if (percentage < 66) {
    const t = (percentage - 50) / (66 - 50);
    return interpolateColor(warning, danger, t);
  } else {
    return `hsl(${danger.h}, ${danger.s}%, ${danger.l}%)`;
  }
}

export function getGaugeColorForHealthFactor(healthFactor: number): string {
  // Convert health factor (100-300) to percentage (0-100)
  const percentage = Math.min(
    100,
    Math.max(0, ((healthFactor - 100) / (300 - 100)) * 100)
  );

  // For demonstration purposes, we assume these HSL values:
  const danger = { h: 0, s: 80, l: 50 }; // e.g. red
  const warning = { h: 30, s: 80, l: 50 }; // e.g. orange/yellow
  const healthy = { h: 120, s: 80, l: 50 }; // e.g. green

  if (percentage <= 15) {
    const t = percentage / 15;
    return interpolateColor(danger, warning, t);
  } else if (percentage <= 30) {
    const t = (percentage - 15) / 15;
    return interpolateColor(warning, healthy, t);
  } else {
    return `hsl(${healthy.h}, ${healthy.s}%, ${healthy.l}%)`;
  }
}

function interpolateColor(
  c1: { h: number; s: number; l: number },
  c2: { h: number; s: number; l: number },
  t: number
): string {
  const h = c1.h + (c2.h - c1.h) * t;
  const s = c1.s + (c2.s - c1.s) * t;
  const l = c1.l + (c2.l - c1.l) * t;
  return `hsl(${h}, ${s}%, ${l}%)`;
}
