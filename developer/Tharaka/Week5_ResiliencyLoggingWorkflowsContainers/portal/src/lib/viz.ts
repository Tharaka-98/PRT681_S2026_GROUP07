/**
 * Chart tokens, kept in one place so every chart in the portal reads the same.
 *
 * Priority is an *ordinal* scale (Low -> Critical), so it gets a single-hue blue
 * ramp that steps light to dark rather than four unrelated hues - the darker the
 * mark, the more urgent. Validated: monotone lightness, adjacent dL >= 0.06,
 * light end clears the surface at 2.11:1.
 */
export const PRIORITY_RAMP: Record<string, string> = {
  Low: '#86b6ef',
  Medium: '#5598e7',
  High: '#2a78d6',
  Critical: '#184f95'
};

/** Single-series charts use one hue and no legend - the title names the series. */
export const SERIES_1 = '#2a78d6';

export const CHART_INK = {
  surface: '#ffffff',
  primary: '#1b2733',
  secondary: '#52514e',
  muted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7'
};

export const priorityColor = (name: string) => PRIORITY_RAMP[name] ?? SERIES_1;
