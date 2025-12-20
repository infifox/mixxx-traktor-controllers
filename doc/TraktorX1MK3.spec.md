# Traktor X1 Mk3 Protocol Spec

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

## Encoders

Encoders are sent as a half-byte value between 0 and F. The value moves up or down as the
encoder is turned, wrapping around when it exceeds the range.

### Input message

Message ID: 0x01
Total Length: 25 bytes

- Byte 1: Message ID (0x01)
- Byte 2:
  - Bit 1: Shift button
  - Bit 2: Left Play
  - Bit 3: Left Sync
  - Bit 4: Right Play
  - Bit 5: Right Sync
  - Bit 6: Left Cue
  - Bit 7: Left Rev
  - Bit 8: Right Cue
- Byte 3:
  - Bit 1: Right Rev
  - Bit 2: Left Nudge Left
  - Bit 3: Left Nudge Right
  - Bit 4: Right Nudge Left
  - Bit 5: Right Nudge Right
  - Bit 6: Left Hotcue 3
  - Bit 7: Left Hotcue 4
  - Bit 8: Right Hotcue 3
- Byte 4:
  - Bit 1: Right Hotcue 4
  - Bit 2: Left Hotcue 1
  - Bit 3: Left Hotcue 2
  - Bit 4: Right Hotcue 1
  - Bit 5: Right Hotcue 2
  - Bit 6: Left FX Toggle 4
  - Bit 7: Right FX Toggle 4
  - Bit 8: Left FX Toggle 3
- Byte 5:
  - Bit 1: Right FX Toggle 3
  - Bit 2: Left FX Toggle 2
  - Bit 3: Right FX Toggle 2
  - Bit 4: Left FX Toggle 1
  - Bit 5: Right FX Toggle 1
  - Bit 6: Left assign left
  - Bit 7: Left assign right
  - Bit 8: Menu button
- Byte 6:
  - Bit 1: Right assign left
  - Bit 2: Right assign right
  - Bit 3: Left Loop Encoder Push
  - Bit 4: Right Loop Encoder Push
  - Bit 5: Left Browse Encoder Push
  - Bit 6: Right Browse Encoder Push
  - Bit 7:
  - Bit 8:
- Byte 7: Unused
- Byte 8:
  - Bits 1-4: Left Loop Encoder Turn
  - Bits 5-8: Right Loop Encoder Turn
- Byte 9:
  - Bits 1-4: Left Browse Encoder Turn
  - Bits 5-8: Right Browse Encoder Turn
- Bytes 10-11: Left FX Knob 4
- Bytes 12-13: Right FX Knob 4
- Bytes 14-15: Left FX Knob 3
- Bytes 16-17: Right FX Knob 3
- Bytes 18-19: Left FX Knob 2
- Bytes 20-21: Right FX Knob 2
- Bytes 22-23: Left FX Knob 1
- Bytes 24-25: Right FX Knob 1
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
Total Length: 50 bytes

- Byte 1: Message ID (0x80)
- Byte 2: Shift
- Byte 3: Left Loop Indicator
  - 00 for off
  - 7e for on
- Byte 4: Right Loop Indicator
  - 00 for off
  - 7e for on
- Byte 5: Left Play
- Byte 6: Left Sync
- Byte 7: Right Play
- Byte 8: Right Sync
- Byte 9: Left Cue
- Byte 10: Left Rev
- Byte 11: Right Cue
- Byte 12: Right Rev
- Byte 13: Left Nudge Left
- Byte 14: Left Nudge Right
- Byte 15: Right Nudge Left
- Byte 16: Right Nudge Right
- Byte 17: Left Hotcue 3
- Byte 18: Left Hotcue 4
- Byte 19: Right Hotcue 3
- Byte 20: Right Hotcue 4
- Byte 21: Left Hotcue 1
- Byte 22: Left Hotcue 2
- Byte 23: Right Hotcue 1
- Byte 24: Right Hotcue 2
- Byte 25: Left FX Toggle 4
- Byte 26: Right FX Toggle 4
- Byte 27: Left FX Toggle 3
- Byte 28: Right FX Toggle 3
- Byte 29: Left FX Toggle 2
- Byte 30: Right FX Toggle 2
- Byte 31: Left FX Toggle 1
- Byte 32: Right FX Toggle 1
- Byte 33: Left Assign Left
- Byte 34: Left Assign Right
- Byte 36: Right Assign Left
- Byte 37: Right Assign Right
- Bytes 38-43: Bottom LEDs Left (6 lights from front to back)
- Byte 44: Unused
- Bytes 45-50: Bottom LEDS Right (6 lights from front to back)
