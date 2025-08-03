# Traktor Screens Protocol Spec

This document describes the protocol to communicate with the screens on the
Traktor Z1 MK2 and Traktor X1 MK3 controllers, as derived from reverse
engineering the devices.

## Hardware overview

Each screen is a 128x64 1-bit display, with the Z1 having 3 screens at the
top, and the X1 having 5 screens total, including 3 at the top and 2 in the
middle.

## Protocol

Updating the screen requires sending 4 total HID messages, each of which
updates 2 rows of 8 pixels high each, updating in total a 128x16 horizontal
slice of the display.

The screen pixel data is sent as a series of bytes, with each byte representing
an area of 1x8 pixels. In a typical update message, 128 bytes are sent for
one row of 128x8 pixels, immediately followed by the bytes for the next row,
thus sending a 128x16 segment of the display in a single message.

Each bit in the byte represents a single value, with a 1 for OFF and a 0 for ON.

Each message is sent with as an HID output report, with the report ID being
a number in the range of 0xE0-0xE5. The exact ID is different for each screen,
with 0xE0 referring to the first screen, 0xE1 referring to the second and so on.

### Message structure

The message structure follows the following format. Note that some values are in
pixels, and other in rows representing 8 pixels each:

Byte 0 / descriptor: Screen selection E0-E5
Bytes 1-2: X offset in pixels, little-endian word
Bytes 2-3: Y offset in rows, little-endian word
Bytes 4-5: X width in pixels, little-endian word
Bytes 6-7: Y height in rows, little-endian word
Bytes 8+: Pixel data

### Pixel data examples

The following diagrams depict how pixels are packed into each byte, as
a pair of hexadecimal digits:

```

F  E  D  C  B  A  9  8  7  6  5  4  3  2  1  0
-- ## -- ## -- ## -- ## -- ## -- ## -- ## -- ## < Top
-- -- ## ## -- -- ## ## -- -- ## ## -- -- ## ##
-- -- -- -- ## ## ## ## -- -- -- -- ## ## ## ##
-- -- -- -- -- -- -- -- ## ## ## ## ## ## ## ## < Bottom

-- ## -- -- -- ## -- T
## ## ## -- ## ## ## T
## ## ## ## ## ## ## T
## ## ## ## ## ## ## T
## ## ## ## ## ## ## B
-- ## ## ## ## ## -- B
-- -- ## ## ## -- -- B
-- -- -- ## -- -- -- B
E1 C0 81 03 81 C0 E1
BT BT BT BT BT BT BT

```

### Notes about the offset and width values

As described above, Traktor updates the screens by sending 4 messages,
each updating two of the 8 total rows at once. From the message format, it
would seem that it should be possible to update the screen in other patterns
by changing the offset and size values, but there are a couple of issues:

1. Messages containing more than 256 bytes of pixel data are not accepted
  by the controllers
2. While messages that update other subsegments of the screen are accepted
  by the controllers, I've observered a behavior (possibly a bug), where
  all rows beyond the first are positioned incorrectly, being offset an
  extra distance to the right, corresponding to the width of the input.
  The only way to avoid the issue is to send only a single row, which has
  limited use, or to send multiple rows with a width of 128 pixels, limiting
  the number of rows that can be sent at once to 2.
