/** Represents an RGB color code which can be displayed by a light. */
const COLOR_CODES: Record<string, number> = {
  black: 0x00,
  redDim: 0x04,
  red: 0x06,
  darkOrangeDim: 0x08,
  darkOrange: 0x0a,
  lightOrangeDim: 0x0c,
  lightOrange: 0x0e,
  warmYellowDim: 0x10,
  warmYellow: 0x12,
  yellowDim: 0x14,
  yellow: 0x16,
  limeDim: 0x18,
  lime: 0x1a,
  greenDim: 0x1c,
  green: 0x1e,
  mintDim: 0x20,
  mint: 0x22,
  cyanDim: 0x24,
  cyan: 0x26,
  turquoiseDim: 0x28,
  turquoise: 0x2a,
  blueDim: 0x2c,
  blue: 0x2e,
  plumDim: 0x30,
  plum: 0x32,
  violetDim: 0x34,
  violet: 0x36,
  purpleDim: 0x38,
  purple: 0x3a,
  magentaDim: 0x3c,
  magenta: 0x3e,
  fuschiaDark: 0x40,
  fuschia: 0x42,
  white: 0x46,
};

/**
 * Mapping from each color to the dim equivalent of that color if it exists.
 */
const DIM_COLORS: Record<string, string> = {
  redDim: "redDim",
  red: "redDim",
  darkOrangeDim: "darkOrangeDim",
  darkOrange: "darkOrangeDim",
  lightOrangeDim: "lightOrangeDim",
  lightOrange: "lightOrangeDim",
  warmYellowDim: "warmYellowDim",
  warmYellow: "warmYellowDim",
  yellowDim: "yellowDim",
  yellow: "yellowDim",
  limeDim: "limeDim",
  lime: "limeDim",
  greenDim: "greenDim",
  green: "greenDim",
  mintDim: "mintDim",
  mint: "mintDim",
  cyanDim: "cyanDim",
  cyan: "cyanDim",
  turquoiseDim: "turquoiseDim",
  turquoise: "turquoiseDim",
  blueDim: "blueDim",
  blue: "blueDim",
  plumDim: "plumDim",
  plum: "plumDim",
  violetDim: "violetDim",
  violet: "violetDim",
  purpleDim: "purpleDim",
  purple: "purpleDim",
  magentaDim: "magentaDim",
  magenta: "magentaDim",
  fuschiaDark: "fuschiaDark",
  fuschia: "fuschiaDark",
  black: "black",
  white: "black",
};

export const defaultedColor = (color: string, defaultColor: string): string =>
  color === "default" ? defaultColor : color;

export const dimColor = (color: string): string => DIM_COLORS[color] ?? color;

export const dimColorWhen = (color: string, condition: boolean): string =>
  condition ? dimColor(color) : color;

export const colorCode = (color: string): number => COLOR_CODES[color] ?? 0;
