import { FONT_DATA, FONT_CHAR_HEIGHT, FONT_CHAR_WIDTH } from "./FontData";

const SCREEN_WIDTH = 128;
const SCREEN_ROWS_COUNT = 8;
const SCREEN_UPDATE_COOLDOWN_MS = 20;

/** Displays a Uint8Array as formatted hex for debugging. */
const dumpMessageForDebug = (message: Uint8Array): void => {
  let debugMessage = Array.from(message)
    .map((x) => x.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
  console.debug(`Message (${message.length} bytes):\n${debugMessage}`);
};

/**
 * Class to handle drawing to a screen buffer, and flushing the
 * changes to the controller.
 */
export class TraktorScreen {
  oldRows: Uint8Array[] = [];
  rows: Uint8Array[] = [];
  screenId: number;
  onCooldown = false;

  constructor(screenId: number) {
    this.screenId = screenId;
    for (let i = 0; i < SCREEN_ROWS_COUNT; i++) {
      this.oldRows.push(this.makeEmptyRow());
      this.rows.push(this.makeEmptyRow());
    }
    this.clear();
  }

  private makeEmptyRow() {
    const row = new Uint8Array(SCREEN_WIDTH);
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      row[i] = 0xff;
    }
    return row;
  }

  clear() {
    for (const row of this.rows) {
      for (let i = 0; i < SCREEN_WIDTH; i++) {
        row[i] = 0xff;
      }
    }
  }

  /**
   * Sends the updated screen data to the controller. This is automatically throttled with
   * a cooldown period to prevent rapid updates from saturating the connection.
   */
  send(isDebugging: boolean): void {
    // Set a delay to prevent rapid resending of the screen
    if (this.onCooldown) {
      return;
    } else {
      this.performSend(isDebugging);
      this.onCooldown = true;
      engine.beginTimer(
        SCREEN_UPDATE_COOLDOWN_MS,
        () => {
          this.onCooldown = false;
          this.performSend(isDebugging);
        },
        true,
      );
    }
  }

  /**
   * Sends the screen data to the controller using the screen protocol.
   *
   * Sends data in pairs of rows (0-1, 2-3, 4-5, 6-7) to match Traktor behaviour.
   */
  private performSend(isDebugging: boolean): void {
    // Screen message IDs: 0xE0 (left), 0xE1 (center), 0xE2 (right)
    const messageId = 0xe0 + this.screenId;

    // Send data in pairs of rows
    for (let row1 = 0; row1 < SCREEN_ROWS_COUNT; row1 += 2) {
      const row2 = row1 + 1;

      // Check if rows have changed
      let hasChanged = false;
      for (let x = 0; x < SCREEN_WIDTH; x++) {
        if (
          this.rows[row1][x] !== this.oldRows[row1][x] ||
          this.rows[row2][x] !== this.oldRows[row2][x]
        ) {
          hasChanged = true;
          break;
        }
      }
      if (!hasChanged) {
        continue;
      }

      const message = new Uint8Array(272);

      // Header
      message[0] = 0x00; // Offset X in pixels
      message[1] = 0x00;
      message[2] = row1; // Offset Y in rows
      message[3] = 0x00;
      message[4] = 0x80; // Width in pixels
      message[5] = 0x00;
      message[6] = 0x02; // Height in rows
      message[7] = 0x00;

      // Pixel data - 2 rows of 64 pixels each

      // Copy rows to buffer
      for (let col = 0; col < SCREEN_WIDTH; col++) {
        message[8 + col] =
          row1 < SCREEN_ROWS_COUNT ? this.rows[row1][col] : 0xff;
        message[8 + SCREEN_WIDTH + col] =
          row2 < SCREEN_ROWS_COUNT ? this.rows[row2][col] : 0xff;
      }

      // Send the message
      if (isDebugging) {
        dumpMessageForDebug(message);
      }

      controller.sendOutputReport(
        messageId,
        message.buffer as ArrayBuffer,
        true, // Need to disable auto-skipping as we're sending multiple reports with the same ID in quick succession
      );

      // Copy the data to oldData
      this.oldRows[row1] = this.rows[row1].slice();
      this.oldRows[row2] = this.rows[row2].slice();
    }
  }

  /**
   * Writes text do the display, wrapping if necessary. Wrapping can break anywhere
   * in the word, not just within whitespace. If there is too much text to fit within
   * the allowed space, it will be truncated.
   *
   * Any characters not contained in the font dataset will be replaced with a "~"
   *
   * @param text The text to write to the display.
   * @param left Left margin for the text from the left of the screen, in characters.
   * @param top Top margin for the text from the top of the screen, in characters.
   * @param right Right margin for the text from the right of the screen, in characters.
   * @param bottom Bottom margin for the text from the bottom of the screen, in characters.
   */
  writeText(
    text: string,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ) {
    // Calculate available space in pixels
    const availableWidth = SCREEN_WIDTH / FONT_CHAR_WIDTH - left - right;
    const availableHeight =
      (SCREEN_ROWS_COUNT * 8) / FONT_CHAR_HEIGHT - top - bottom;

    if (availableWidth <= 0 || availableHeight <= 0) {
      return; // No space to write
    }

    let currentX = left;
    let currentY = top;

    for (let i = 0; i < text.length && currentY < top + availableHeight; i++) {
      let char = text[i];

      // Replace unknown characters with ~
      if (!(char in FONT_DATA)) {
        char = "~";
      }

      // Check if we need to wrap to next line
      if (currentX >= left + availableWidth) {
        currentX = left;
        currentY++;
        if (currentY >= top + availableHeight) {
          break; // Out of vertical space
        }
      }

      // Get font data for this character
      const [topSection, bottomSection] = FONT_DATA[char];

      // Calculate pixel positions
      const pixelX = currentX * FONT_CHAR_WIDTH;
      const pixelY = currentY * FONT_CHAR_HEIGHT;

      // Render character to screen buffer
      for (let col = 0; col < FONT_CHAR_WIDTH; col++) {
        const screenCol = pixelX + col;
        if (screenCol >= SCREEN_WIDTH) break;

        // Top half (first 8 rows of character)
        const topRowStart = Math.floor(pixelY / 8);
        if (topRowStart < SCREEN_ROWS_COUNT) {
          this.rows[topRowStart][screenCol] = topSection[col];
        }

        // Bottom half (second 8 rows of character)
        const bottomRowStart = Math.floor((pixelY + 8) / 8);
        if (bottomRowStart < SCREEN_ROWS_COUNT) {
          this.rows[bottomRowStart][screenCol] = bottomSection[col];
        }
      }
      currentX++;
    }
  }

  /**
   * Writes text do the display, at double the normal size. This will work in the
   * same way as writeText, but every pixel is doubled in size. The margins are
   * still specified as small sized characters, not doubles.
   *
   * @param text The text to write to the display.
   * @param left Left margin for the text from the left of the screen, in characters.
   * @param top Top margin for the text from the top of the screen, in characters.
   * @param right Right margin for the text from the right of the screen, in characters.
   * @param bottom Bottom margin for the text from the bottom of the screen, in characters.
   */
  writeTextBig(
    text: string,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ) {
    const scale = 2;
    const scaledCharWidth = FONT_CHAR_WIDTH * scale;
    const scaledCharHeight = FONT_CHAR_HEIGHT * scale;

    // Calculate available space in characters (accounting for scaling)
    const availableWidthChars = Math.floor(
      (SCREEN_WIDTH - left * scaledCharWidth - right * scaledCharWidth) /
        scaledCharWidth,
    );
    const availableHeightChars = Math.floor(
      (SCREEN_ROWS_COUNT * 8 -
        top * scaledCharHeight -
        bottom * scaledCharHeight) /
        scaledCharHeight,
    );

    if (availableWidthChars <= 0 || availableHeightChars <= 0) {
      return; // No space to write
    }

    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < text.length && currentY < availableHeightChars; i++) {
      let char = text[i];

      // Replace unknown characters with ~
      if (!(char in FONT_DATA)) {
        char = "~";
      }

      // Check if we need to wrap to next line
      if (currentX >= availableWidthChars) {
        currentX = 0;
        currentY++;
        if (currentY >= availableHeightChars) {
          break; // Out of vertical space
        }
      }

      // Get font data for this character
      const [topSection, bottomSection] = FONT_DATA[char];

      // Calculate pixel positions
      const pixelX = left * scaledCharWidth + currentX * scaledCharWidth;
      const pixelY = top * scaledCharHeight + currentY * scaledCharHeight;

      // Render scaled character to screen buffer
      for (let fontCol = 0; fontCol < FONT_CHAR_WIDTH; fontCol++) {
        for (let scaleX = 0; scaleX < scale; scaleX++) {
          const screenCol = pixelX + fontCol * scale + scaleX;
          if (screenCol >= SCREEN_WIDTH) break;

          // Process top half of character (first 8 rows)
          for (let fontRow = 0; fontRow < 8; fontRow++) {
            const fontPixel = (topSection[fontCol] >> fontRow) & 1;

            for (let scaleY = 0; scaleY < scale; scaleY++) {
              const screenRowPixel = pixelY + fontRow * scale + scaleY;
              const screenRow = Math.floor(screenRowPixel / 8);
              const pixelInRow = screenRowPixel % 8;

              if (screenRow < SCREEN_ROWS_COUNT) {
                if (fontPixel === 0) {
                  // Set pixel (font data is inverted - 0 means draw)
                  this.rows[screenRow][screenCol] &= ~(1 << pixelInRow);
                } else {
                  // Clear pixel
                  this.rows[screenRow][screenCol] |= 1 << pixelInRow;
                }
              }
            }
          }

          // Process bottom half of character (second 8 rows)
          for (let fontRow = 0; fontRow < 8; fontRow++) {
            const fontPixel = (bottomSection[fontCol] >> fontRow) & 1;

            for (let scaleY = 0; scaleY < scale; scaleY++) {
              const screenRowPixel = pixelY + (8 + fontRow) * scale + scaleY;
              const screenRow = Math.floor(screenRowPixel / 8);
              const pixelInRow = screenRowPixel % 8;

              if (screenRow < SCREEN_ROWS_COUNT) {
                if (fontPixel === 0) {
                  // Set pixel (font data is inverted - 0 means draw)
                  this.rows[screenRow][screenCol] &= ~(1 << pixelInRow);
                } else {
                  // Clear pixel
                  this.rows[screenRow][screenCol] |= 1 << pixelInRow;
                }
              }
            }
          }
        }
      }
      currentX++;
    }
  }
}

export class TraktorScreens {
  public screens: TraktorScreen[];

  constructor(count: number) {
    this.screens = Array(count)
      .fill(null)
      .map((_, i) => new TraktorScreen(i));
  }

  clearAll() {
    this.screens.forEach((screen) => screen.clear());
  }

  sendAll(isDebugging: boolean) {
    this.screens.forEach((screen) => screen.send(isDebugging));
  }
}
