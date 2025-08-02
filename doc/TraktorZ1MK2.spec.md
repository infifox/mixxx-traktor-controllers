# Traktor Z1 Mk2 Protocol Spec

This document describes all messages sent and received by the controller in normal use, as
derived from reverse-engineering. Every message begins with a single byte message ID which
determines the type of message.

## Input

### Buttons

Buttons are sent as packed bytes, with a 1 when the button is pressed and 0 when it isn't.

For packed bytes, the following naming convention is used:
  Bit 1: 0x01
  Bit 2: 0x02
  Bit 3: 0x04
  Bit 4: 0x08
  Bit 5: 0x10
  Bit 6: 0x20
  Bit 7: 0x40
  Bit 8: 0x80

### Knobs and Faders

Knobs and faders are sent as 2-byte word values, in little-endian format.

Values range from 0x0000 to 0x0FFF.

Knobs that click into place in the middle will report exactly 0x07FF for the middle value.

### Input message

Message ID: 0x01
Total Length: 35 bytes

- Byte 1: Message ID (0x01)
- Byte 2:
  - Bit 1: EQ Mode Switch Left
  - Bit 2: Stems Mode Switch Left
  - Bit 3: Decks AB/CD Toggle
  - Bit 4: EQ Mode Switch Right
  - Bit 5: Stems Mode Switch Right
  - Bit 6: FX Toggle Left
  - Bit 7: FX Toggle Right
  - Bit 8: FX Switch 1
- Byte 3:
  - Bit 1: FX Switch 2
  - Bit 2: FX Switch 3
  - Bit 3: FX Switch 4
  - Bit 4: FX Filter Switch
  - Bit 5: Prelisten Toggle Left
  - Bit 6: Prelisten Toggle Right
- Bytes 4-5: Gain Left
- Bytes 6-7: Hi Left
- Bytes 8-9: Mid Left
- Bytes 10-11: Low Left
- Bytes 12-13: FX Left
- Bytes 14-15: Gain Right
- Bytes 16-17: High Right
- Bytes 18-19: Mid Right
- Bytes 20-21: Low Right
- Bytes 22-23: FX Right
- Bytes 24-25: Headphones Mix
- Bytes 26-27: Main Volume
- Bytes 28-29: Headphones Volume
- Bytes 30-31: Left Fader
- Bytes 32-33: Right Fader
- Bytes 34-35: Crossfader
`

## Output

### Lights

Monochrome lights (only the VU meters), are sent as single bytes, with 0x7E to turn the light on, and 0x00 to turn it off.

Colored lights are sent as single bytes, using the following table:

- 0x00 -- Black
- 0x04 -- Red (DIM)
- 0x06 -- Red
- 0x08 -- Dark Orange (DIM)
- 0x0A -- Dark Orange
- 0x0C -- Light Orange (DIM)
- 0x0E -- Light Orange
- 0x10 -- Warm Orange (DIM)
- 0x12 -- Warm Yellow
- 0x14 -- Yellow (DIM)
- 0x16 -- Yellow
- 0x18 -- Lime (DIM)
- 0x1A -- Lime
- 0x1C -- Green (DIM)
- 0x1E -- Green
- 0x20 -- Mint (DIM)
- 0x22 -- Mint
- 0x24 -- Cyan (DIM)
- 0x26 -- Cyan
- 0x28 -- Turquoise (DIM)
- 0x2A -- Turquoise
- 0x2C -- Blue (DIM)
- 0x2E -- Blue
- 0x30 -- Plum (DIM)
- 0x32 -- Plum
- 0x34 -- Violet (DIM)
- 0x36 -- Violet
- 0x38 -- Purple (DIM)
- 0x3A -- Purple
- 0x3C -- Magenta (DIM)
- 0x3E -- Magenta
- 0x40 -- Fuschia (DARK)
- 0x42 -- Fuschia
- 0x46 -- White

### Lights message

Message ID: 0x80
Total Length: 47 bytes

- Byte 1: Message ID (0x80)
- Bytes 2-11: VU Meter Left (10 lights from bottom to top, monochrome)
- Bytes 12-21: VU Meter Right (10 lights from bottom to top, monochrome)
- Byte 22: EQ Mode Switch Left
- Byte 23: Stems Mode Switch Left
- Byte 24: Unused
  - *Probably reserved for the Deck Switch button, which does not change color in normal use*
- Byte 25: EQ Mode Switch Right
- Byte 26: Stems Mode Switch Right
- Byte 27: FX Toggle Left
- Byte 28: FX Toggle Right
- Byte 29: FX Switch 1
- Byte 30: FX Switch 2
- Byte 31: FX Switch 3
- Byte 32: FX Switch 4
- Byte 33: FX Filter Switch
- Byte 34: Prelisten Toggle Left
- Byte 35: Prelisten Toggle Right
- Bytes 36-41: Bottom LEDs Left (6 lights from front to back)
- Bytes 42-47: Bottom LEDS Right (6 lights from front to back)

### Screens

Screen data is sent as lines of 8-pixel high bit-packed columns.

Each bit is 1 to turn the pixel off, or 0 to turn the pixel on. The least-significant bit is at
the top of the column and the most-significant at the bottom.

### Screen message

Message ID: 0xE0, 0xE1, 0xE2
Message length: 137 bytes

This message sends 2 rows of pixel data to the screen (out of 8 total)

- Byte 1: Message ID (0xE0, 0xE1, 0xE2)
  - The message ID controls which screen is updated, 0xE0 for the left screen, 0xE1 for the
    center screen, and 0xE2 for the right screen
- Byte 2: 0x00
- Byte 3: Row to update, from 0x00 to 0x06.
  - *While it's possible to use any number in this range, each message will update two rows at
    once, and Traktor always sends even values for this (0x00, 0x02, 0x04, or 0x06)*
- Bytes 4-9: 0x00 00 80 00 02 00
  - *These have something to do with controlling how much pixel data is loaded from the message, but
    Traktor always uses this same value and I haven't investigated enough to fully understand them*
  - *Likely the 0x80 is the size of the pixel data and the 0x02 is the number of rows*
- Bytes 10-137: Pixel data -- 2 rows of 64 pixels each, one after another
