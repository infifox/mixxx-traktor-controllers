#!/bin/env node
import { PNG } from "pngjs";
import * as fs from "fs";

const FONT_FILE_NAME = "res/serif_10x14.png";
const GLYPHS =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ";
const COLS = 16;
const ROWS = GLYPHS.length / COLS;

// Read PNG source image
const png = PNG.sync.read(fs.readFileSync(FONT_FILE_NAME));

const output: string[] = [
  "const FONT_DATA: Record<string, [Uint8Array, Uint8Array]> = {",
];

// Convert each glyph in the font into font data. To determine the correct data,
// we look at the pixels for each character, interpreting transparent as off, and
// any opaque data as on. The output data goes into two arrays representing the first
// 8 rows of pixels, and the next 8 rows of pixels respectively.
//
// 8 rows of pixels for each column are encoded in a 1-byte bitmask, with the least
// significant bit representing the pixel and the top, and the most-significat bit
// representing the one at the bottom. Each bit should be 1 to indicate that the pixel
// is OFF, or 0 to indicate that it's ON
//
// For each glyph that's generated, it's added to the generated TypeScript object
// literal, with the key being the glyph name and the value being the two byte array
// representing the two rows of data.
//
// As the input data is only 14 rows high, not 16, the top and bottom rows in the
// output are left blank, and the text starts from row 2.

const GLYPH_WIDTH = 10;
const GLYPH_HEIGHT = 14;
const OUTPUT_HEIGHT = 16; // 14 + 1 blank row top + 1 blank row bottom

for (let i = 0; i < GLYPHS.length; i++) {
  const char = GLYPHS[i];
  const col = i % COLS;
  const row = Math.floor(i / COLS);

  // Calculate the position of this glyph in the source image
  const startX = col * GLYPH_WIDTH;
  const startY = row * GLYPH_HEIGHT;

  // Create two byte arrays for the two 8-row sections
  const topSection = new Uint8Array(GLYPH_WIDTH);
  const bottomSection = new Uint8Array(GLYPH_WIDTH);

  // Process each column of the glyph
  for (let x = 0; x < GLYPH_WIDTH; x++) {
    let topByte = 0;
    let bottomByte = 0;

    // Process top 8 rows (including 1 blank row at top + first 7 rows of glyph)
    for (let y = 0; y < 8; y++) {
      let pixelOn = false;

      if (y >= 1 && y <= 7) {
        // This is part of the actual glyph (y-1 because we skip the first blank row)
        const sourceY = startY + (y - 1);
        const pixelIndex = (sourceY * png.width + (startX + x)) * 4;
        const alpha = png.data[pixelIndex + 3];
        pixelOn = alpha > 128; // Consider pixel "on" if alpha > 128
      }
      // y === 0 is the blank row at top, so pixelOn stays false

      // Set bit (0 = on, 1 = off, so we invert the logic)
      if (!pixelOn) {
        topByte |= 1 << y;
      }
    }

    // Process bottom 8 rows (last 7 rows of glyph + 1 blank row at bottom)
    for (let y = 0; y < 8; y++) {
      let pixelOn = false;

      if (y < 7) {
        // This is part of the actual glyph
        const sourceY = startY + 7 + y; // Start from row 7 of the glyph
        const pixelIndex = (sourceY * png.width + (startX + x)) * 4;
        const alpha = png.data[pixelIndex + 3];
        pixelOn = alpha > 128; // Consider pixel "on" if alpha > 128
      }
      // y === 7 is the blank row at bottom, so pixelOn stays false

      // Set bit (0 = on, 1 = off, so we invert the logic)
      if (!pixelOn) {
        bottomByte |= 1 << y;
      }
    }

    topSection[x] = topByte;
    bottomSection[x] = bottomByte;
  }

  // Add this glyph to the output
  const escapedChar = char === '"' ? '\\"' : char === "\\" ? "\\\\" : char;
  output.push(
    `  "${escapedChar}": [new Uint8Array([${Array.from(topSection, (x) => `0x${x.toString(16)}`).join(", ")}]), new Uint8Array([${Array.from(bottomSection, (x) => `0x${x.toString(16)}`).join(", ")}])],`,
  );
}

output.push("};");

// Write the output to a TypeScript file
fs.writeFileSync("src/font-data.ts", output.join("\n"));
console.log("Font conversion complete! Generated src/font-data.ts");
