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

export const defaultedColor = (
  color: string | undefined,
  defaultColor: string,
): string => (color === "default" || !color ? defaultColor : color);

export const dimColor = (color: string): string => DIM_COLORS[color] ?? color;

export const dimColorWhen = (color: string, condition: boolean): string =>
  condition ? dimColor(color) : color;

export const colorCode = (color: string): number => COLOR_CODES[color] ?? 0;

export const COLOR_NAMES = [
  "black",
  "redDim",
  "red",
  "darkOrangeDim",
  "darkOrange",
  "lightOrangeDim",
  "lightOrange",
  "warmYellowDim",
  "warmYellow",
  "yellowDim",
  "yellow",
  "limeDim",
  "lime",
  "greenDim",
  "green",
  "mintDim",
  "mint",
  "cyanDim",
  "cyan",
  "turquoiseDim",
  "turquoise",
  "blueDim",
  "blue",
  "plumDim",
  "plum",
  "violetDim",
  "violet",
  "purpleDim",
  "purple",
  "magentaDim",
  "magenta",
  "fuschiaDark",
  "fuschia",
  "white",
];

export const COLOR_MAPPER = new ColorMapper({
  0x000000: 0, // Black
  0xff0000: 2, // Red
  0xff8000: 4, // Dark Orange
  0xffa000: 6, // Light Orange
  0xffc000: 8, // Warm Yellow
  0xffff00: 10, // Yellow
  0x80ff00: 12, // Lime
  0x00ff00: 14, // Green
  0x00ff80: 16, // Mint
  0x00ffff: 18, // Cyan
  0x0080ff: 20, // Turquoise
  0x0000ff: 22, // Blue
  0x8000ff: 24, // Plum
  0xa000ff: 26, // Violet
  0xc000ff: 28, // Purple
  0xff00ff: 30, // Magenta
  0xff0080: 32, // Fuschia
});
