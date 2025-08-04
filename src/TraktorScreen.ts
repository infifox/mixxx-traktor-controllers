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

  /** Sets a pixel on the screen at the given coordinates. */
  setPixel(x: number, y: number, value: boolean): void {
    // Check bounds
    if (x < 0 || x >= SCREEN_WIDTH || y < 0 || y >= SCREEN_ROWS_COUNT * 8) {
      return;
    }

    // Calculate which row and bit position
    const row = Math.floor(y / 8);
    const bitPosition = y % 8;

    if (value) {
      // Clear the bit (0 means pixel is on in this display format)
      this.rows[row][x] &= ~(1 << bitPosition);
    } else {
      // Set the bit (1 means pixel is off in this display format)
      this.rows[row][x] |= 1 << bitPosition;
    }
  }

  /**
   * Writes text do the display.
   *
   * - *text* - text to write
   * - *scale* - scale to write text at, must be an integer >= 1
   * - *x* - x offset in pixels
   * - *y* - y offset in pixels
   * - *width* - max width in characters
   * - *height* - max height in characters
   * - *invert* - inverts every pixel drawn
   */
  writeText({
    text,
    scale,
    x,
    y,
    width,
    height,
    invert = false,
  }: {
    text: string;
    scale: number;
    x: number;
    y: number;
    width: number;
    height: number;
    invert?: boolean;
  }) {
    const scaledCharWidth = FONT_CHAR_WIDTH * scale;
    const scaledCharHeight = FONT_CHAR_HEIGHT * scale;

    if (width <= 0 || height <= 0) {
      return; // No space to write
    }

    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < text.length && currentY < height; i++) {
      let char = text[i];

      // Replace unknown characters with ~
      if (!(char in FONT_DATA)) {
        char = "~";
      }

      // Check if we need to wrap to next line
      if (currentX >= width) {
        currentX = 0;
        currentY++;
        if (currentY >= height) {
          break; // Out of vertical space
        }
      }

      // Calculate pixel positions
      const pixelX = x + currentX * scaledCharWidth;
      const pixelY = y + currentY * scaledCharHeight;

      // Render scaled character to screen buffer
      for (let fontCol = 0; fontCol < FONT_CHAR_WIDTH; fontCol++) {
        for (let scaleX = 0; scaleX < scale; scaleX++) {
          const screenCol = pixelX + fontCol * scale + scaleX;
          if (screenCol >= SCREEN_WIDTH) break;

          // Process both rows of font data
          for (let dataRowIndex = 0; dataRowIndex < 2; dataRowIndex++) {
            const dataRow = FONT_DATA[char][dataRowIndex];
            // Process top half of character (first 8 rows)
            for (let fontRow = 0; fontRow < 8; fontRow++) {
              let fontPixel = (dataRow[fontCol] >> fontRow) & 1;

              // Apply invert if requested
              if (invert) {
                fontPixel = fontPixel === 0 ? 1 : 0;
              }

              for (let scaleY = 0; scaleY < scale; scaleY++) {
                const screenY =
                  pixelY + fontRow * scale + scaleY + dataRowIndex * 8 * scale;

                // Set pixel using setPixel method (font data is inverted - 0 means draw)
                this.setPixel(screenCol, screenY, fontPixel === 0);
              }
            }
          }
        }
      }
      currentX++;
    }
  }

  /**
   * Draws a box to the screen. If filled is true, all pixels within the box will be
   * filled, otherwise only the border.
   */
  drawBox({
    x,
    y,
    width,
    height,
    filled,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    filled: boolean;
  }) {
    if (width <= 0 || height <= 0) {
      return; // Nothing to draw
    }

    if (filled) {
      // Fill the entire box
      for (let drawY = y; drawY < y + height; drawY++) {
        for (let drawX = x; drawX < x + width; drawX++) {
          this.setPixel(drawX, drawY, true);
        }
      }
    } else {
      // Draw only the border
      // Top and bottom edges
      for (let drawX = x; drawX < x + width; drawX++) {
        this.setPixel(drawX, y, true); // Top edge
        this.setPixel(drawX, y + height - 1, true); // Bottom edge
      }

      // Left and right edges
      for (let drawY = y; drawY < y + height; drawY++) {
        this.setPixel(x, drawY, true); // Left edge
        this.setPixel(x + width - 1, drawY, true); // Right edge
      }
    }
  }

  drawEqGauge({
    x,
    y,
    width,
    height,
    value,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
  }) {
    if (width <= 0 || height <= 0) {
      return; // Nothing to draw
    }
    const midY = y + Math.floor(height / 2);
    const midX = x + Math.floor(width / 2);

    // Draw a line across the middle
    this.drawBox({
      x,
      y: midY,
      width,
      height: 2,
      filled: true,
    });

    // Draw two dotted vertical lines
    for (let drawY = y; drawY < y + height; drawY += 4) {
      this.setPixel(midX - 2, drawY, true);
      this.setPixel(midX + 2, drawY, true);
    }

    if (value > 0.5) {
      // Draw a box coming up from the line
      const barHeight = height * (value - 0.5);
      this.drawBox({
        x,
        y: midY - barHeight,
        width,
        height: barHeight,
        filled: true,
      });
    } else if (value < 0.5) {
      // Draw a box coming down from the line
      const barHeight = height * (0.5 - value);
      this.drawBox({
        x,
        y: midY,
        width,
        height: barHeight,
        filled: true,
      });
    }
  }

  drawVertVolGauge({
    x,
    y,
    width,
    height,
    value,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
  }) {
    if (width <= 0 || height <= 0) {
      return; // Nothing to draw
    }

    // Draw the outer border
    this.drawBox({
      x,
      y,
      width,
      height,
      filled: false,
    });

    // Calculate the inner area for the fill
    const innerX = x + 1;
    const innerY = y + 1;
    const innerWidth = width - 2;
    const innerHeight = height - 2;

    if (innerWidth <= 0 || innerHeight <= 0) {
      return; // No space for inner fill
    }

    // Calculate how much of the gauge should be filled based on value (0.0 to 1.0)
    const clampedValue = Math.max(0, Math.min(1, value));
    const fillHeight = Math.floor(innerHeight * clampedValue);

    // Fill the gauge from bottom to top
    if (fillHeight > 0) {
      this.drawBox({
        x: innerX,
        y: innerY + innerHeight - fillHeight,
        width: innerWidth,
        height: fillHeight,
        filled: true,
      });
    }
  }

  drawHorzVolGauge({
    x,
    y,
    width,
    height,
    value,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
  }) {
    if (width <= 0 || height <= 0) {
      return; // Nothing to draw
    }

    // Draw the outer border
    this.drawBox({
      x,
      y,
      width,
      height,
      filled: false,
    });

    // Calculate the inner area for the fill
    const innerX = x + 1;
    const innerY = y + 1;
    const innerWidth = width - 2;
    const innerHeight = height - 2;

    if (innerWidth <= 0 || innerHeight <= 0) {
      return; // No space for inner fill
    }

    // Calculate how much of the gauge should be filled based on value (0.0 to 1.0)
    const clampedValue = Math.max(0, Math.min(1, value));
    const fillWidth = Math.floor(innerWidth * clampedValue);

    // Fill the gauge from left to right
    if (fillWidth > 0) {
      this.drawBox({
        x: innerX,
        y: innerY,
        width: fillWidth,
        height: innerHeight,
        filled: true,
      });
    }
  }
}
