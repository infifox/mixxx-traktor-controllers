import {
  colorCode,
  defaultedColor,
  dimColor,
  dimColorWhen,
} from "./TraktorColors";

/**
 * Indicates the general group of inputs, to allow for generic access to inputs which are
 * duplicated on the left and right side of the controller.
 */
export type ControllerGroup = "left" | "right" | "main";

/**
 * Identifies all inputs which are buttons, with a boolean pressed value.
 *
 * - *assignLeft* - Button to assign filters to left deck
 * - *assignRight* - Button to assign filters to right deck
 * - *top* - Top button (menu, deck switch, hamburger button)
 * - *fxToggle1* - FX toggle button 1
 * - *fxToggle2* - FX toggle button 2
 * - *fxToggle3* - FX toggle button 3
 * - *fxToggle4* - FX toggle button 4
 * - *browse* - Press of the browse encoder
 * - *loop* - Press of the loop encoder
 * - *hotcue1* - Hotcue button 1
 * - *hotcue2* - Hotcue button 2
 * - *hotcue3* - Hotcue button 3
 * - *hotcue4* - Hotcue button 4
 * - *nudgeLeft* - Nudge left button
 * - *nudgeRight* - Nudge right button
 * - *cue* - Cue button
 * - *rev* - Reverse button
 * - *play* - Play button
 * - *sync* - Sync button
 */
export type ControllerButtonName =
  | "assignLeft"
  | "assignRight"
  | "top"
  | "fxToggle1"
  | "fxToggle2"
  | "fxToggle3"
  | "fxToggle4"
  | "browse"
  | "loop"
  | "shift"
  | "hotcue1"
  | "hotcue2"
  | "hotcue3"
  | "hotcue4"
  | "nudgeLeft"
  | "nudgeRight"
  | "cue"
  | "rev"
  | "play"
  | "sync";

/**
 * Identifies all inputs which are knobs or sliders, with a numerical value
 * from 0-1.
 *
 * - *fx1* - FX knob 1
 * - *fx2* - FX knob 2
 * - *fx3* - FX knob 3
 * - *fx4* - FX knob 4
 */
export type ControllerKnobName = "fx1" | "fx2" | "fx3" | "fx4";

/**
 * Identifies all inputs which are encoders, with a value which rotates
 * between 0-15 to capture changes.
 *
 * - *browse* - Browse encoder (top one)
 * - *loop* - Loop encoder (bottom one)
 */
export type ControllerEncoderName = "browse" | "loop";

/**
 * Identifies all multicolor lights on the controller.
 *
 * - *assignLeft* - Button to assign filters to left deck
 * - *assignRight* - Button to assign filters to right deck
 * - *fxToggle1* - FX toggle button 1
 * - *fxToggle2* - FX toggle button 2
 * - *fxToggle3* - FX toggle button 3
 * - *fxToggle4* - FX toggle button 4
 * - *shift* - Shift button
 * - *hotcue1* - Hotcue button 1
 * - *hotcue2* - Hotcue button 2
 * - *hotcue3* - Hotcue button 3
 * - *hotcue4* - Hotcue button 4
 * - *nudgeLeft* - Nudge left button
 * - *nudgeRight* - Nudge right button
 * - *cue* - Cue button
 * - *rev* - Reverse button
 * - *play* - Play button
 * - *sync* - Sync button
 * - *bottomLed1* - Bottom LED 1 light (frontmost)
 * - *bottomLed2* - Bottom LED 2 light
 * - *bottomLed3* - Bottom LED 3 light
 * - *bottomLed4* - Bottom LED 4 light
 * - *bottomLed5* - Bottom LED 5 light
 * - *bottomLed6* - Bottom LED 6 light (rearmost)
 */
export type ControllerColoredLightName =
  | "assignLeft"
  | "assignRight"
  | "fxToggle1"
  | "fxToggle2"
  | "fxToggle3"
  | "fxToggle4"
  | "shift"
  | "hotcue1"
  | "hotcue2"
  | "hotcue3"
  | "hotcue4"
  | "nudgeLeft"
  | "nudgeRight"
  | "cue"
  | "rev"
  | "play"
  | "sync"
  | "bottomLed1"
  | "bottomLed2"
  | "bottomLed3"
  | "bottomLed4"
  | "bottomLed5"
  | "bottomLed6";

/** Empty input data, used before any input has been received. */
const NULL_INPUT_DATA = new Uint8Array([
  0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

/** The maximum value for a slider or knob. */
const INPUT_NUMBER_MAX = 0x0fff;

/**
 * Abstraction to retrieve data from an input message.
 */
class InputMessage {
  private data: Uint8Array;

  private constructor(data: Uint8Array) {
    this.data = data;
  }

  /** Checks that value is a valid input message and constructs an object for it. */
  static load(data: Uint8Array): InputMessage {
    if (data[0] !== 0x01) {
      throw new Error(`Invalid message ID 0x${data[0].toString(16)}`);
    }
    if (data.length !== 25) {
      throw new Error(`Invalid message length ${data.length}`);
    }
    return new InputMessage(data);
  }

  /**
   * Indicates that is the default null message which is loaded before any
   * input has been received.
   */
  isNull(): boolean {
    return this.data === NULL_INPUT_DATA;
  }

  getButtonValue(group: ControllerGroup, name: ControllerButtonName): boolean {
    switch (group) {
      case "main":
        switch (name) {
          case "top":
            return !!(this.data[4] & 0x80);
          case "shift":
            return !!(this.data[1] & 0x01);
          default:
            throw new Error(`Invalid main button -- ${name}`);
        }
      case "left":
        switch (name) {
          case "assignLeft":
            return !!(this.data[4] & 0x20);
          case "assignRight":
            return !!(this.data[4] & 0x40);
          case "fxToggle1":
            return !!(this.data[4] & 0x08);
          case "fxToggle2":
            return !!(this.data[4] & 0x02);
          case "fxToggle3":
            return !!(this.data[3] & 0x80);
          case "fxToggle4":
            return !!(this.data[3] & 0x20);
          case "browse":
            return !!(this.data[5] & 0x10);
          case "loop":
            return !!(this.data[5] & 0x04);
          case "hotcue1":
            return !!(this.data[3] & 0x02);
          case "hotcue2":
            return !!(this.data[3] & 0x04);
          case "hotcue3":
            return !!(this.data[2] & 0x20);
          case "hotcue4":
            return !!(this.data[2] & 0x40);
          case "nudgeLeft":
            return !!(this.data[2] & 0x02);
          case "nudgeRight":
            return !!(this.data[2] & 0x04);
          case "cue":
            return !!(this.data[1] & 0x20);
          case "rev":
            return !!(this.data[1] & 0x40);
          case "play":
            return !!(this.data[1] & 0x02);
          case "sync":
            return !!(this.data[1] & 0x04);
          default:
            throw new Error(`Invalid left button -- ${name}`);
        }
      case "right":
        switch (name) {
          case "assignLeft":
            return !!(this.data[5] & 0x01);
          case "assignRight":
            return !!(this.data[5] & 0x02);
          case "fxToggle1":
            return !!(this.data[4] & 0x10);
          case "fxToggle2":
            return !!(this.data[4] & 0x04);
          case "fxToggle3":
            return !!(this.data[4] & 0x01);
          case "fxToggle4":
            return !!(this.data[3] & 0x40);
          case "browse":
            return !!(this.data[5] & 0x20);
          case "loop":
            return !!(this.data[5] & 0x08);
          case "hotcue1":
            return !!(this.data[3] & 0x08);
          case "hotcue2":
            return !!(this.data[3] & 0x10);
          case "hotcue3":
            return !!(this.data[2] & 0x80);
          case "hotcue4":
            return !!(this.data[3] & 0x01);
          case "nudgeLeft":
            return !!(this.data[2] & 0x08);
          case "nudgeRight":
            return !!(this.data[2] & 0x10);
          case "cue":
            return !!(this.data[1] & 0x80);
          case "rev":
            return !!(this.data[2] & 0x01);
          case "play":
            return !!(this.data[1] & 0x08);
          case "sync":
            return !!(this.data[1] & 0x10);
          default:
            throw new Error(`Invalid right button -- ${name}`);
        }
    }

    throw new Error(`Invalid button -- ${group}:${name}`);
  }

  getKnobValue(group: ControllerGroup, name: ControllerKnobName): number {
    switch (group) {
      case "left":
        switch (name) {
          case "fx1":
            return (this.data[21] | (this.data[22] << 8)) / INPUT_NUMBER_MAX;
          case "fx2":
            return (this.data[17] | (this.data[18] << 8)) / INPUT_NUMBER_MAX;
          case "fx3":
            return (this.data[13] | (this.data[14] << 8)) / INPUT_NUMBER_MAX;
          case "fx4":
            return (this.data[9] | (this.data[10] << 8)) / INPUT_NUMBER_MAX;
          default:
            throw new Error(`Invalid left knob -- ${name}`);
        }
      case "right":
        switch (name) {
          case "fx1":
            return (this.data[23] | (this.data[24] << 8)) / INPUT_NUMBER_MAX;
          case "fx2":
            return (this.data[19] | (this.data[20] << 8)) / INPUT_NUMBER_MAX;
          case "fx3":
            return (this.data[15] | (this.data[16] << 8)) / INPUT_NUMBER_MAX;
          case "fx4":
            return (this.data[11] | (this.data[12] << 8)) / INPUT_NUMBER_MAX;
          default:
            throw new Error(`Invalid right knob -- ${name}`);
        }
    }

    throw new Error(`Invalid knob -- ${group}:${name}`);
  }

  /** Gets the current value of an encoder, from 0-15 */
  getEncoderValue(group: ControllerGroup, name: ControllerEncoderName): number {
    switch (group) {
      case "left":
        switch (name) {
          case "browse":
            return this.data[8] & 0x0f;
          case "loop":
            return this.data[7] & 0x0f;
          default:
            throw new Error(`Invalid left encoder -- ${name}`);
        }
      case "right":
        switch (name) {
          case "browse":
            return (this.data[8] >> 4) & 0x0f;
          case "loop":
            return (this.data[7] >> 4) & 0x0f;
          default:
            throw new Error(`Invalid right encoder -- ${name}`);
        }
    }

    throw new Error(`Invalid encoder -- ${group}:${name}`);
  }
}

/** Abstraction to update lights on for the controller. */
class ControllerLights {
  oldData: Uint8Array = new Uint8Array(50);
  data: Uint8Array = new Uint8Array(50);

  /** Clears all light data, turning off all the lights. */
  clear() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = 0x00;
    }
  }

  /** Sets the value of a multicolor light. */
  setColoredLight(
    group: ControllerGroup,
    name: ControllerColoredLightName,
    color: string,
  ): void {
    switch (group) {
      case "left":
        switch (name) {
          case "assignLeft":
            this.data[31] = colorCode(color);
            return;
          case "assignRight":
            this.data[32] = colorCode(color);
            return;
          case "fxToggle1":
            this.data[29] = colorCode(color);
            return;
          case "fxToggle2":
            this.data[27] = colorCode(color);
            return;
          case "fxToggle3":
            this.data[25] = colorCode(color);
            return;
          case "fxToggle4":
            this.data[23] = colorCode(color);
            return;
          case "hotcue1":
            this.data[19] = colorCode(color);
            return;
          case "hotcue2":
            this.data[20] = colorCode(color);
            return;
          case "hotcue3":
            this.data[15] = colorCode(color);
            return;
          case "hotcue4":
            this.data[16] = colorCode(color);
            return;
          case "nudgeLeft":
            this.data[11] = colorCode(color);
            return;
          case "nudgeRight":
            this.data[12] = colorCode(color);
            return;
          case "cue":
            this.data[7] = colorCode(color);
            return;
          case "rev":
            this.data[8] = colorCode(color);
            return;
          case "play":
            this.data[3] = colorCode(color);
            return;
          case "sync":
            this.data[4] = colorCode(color);
            return;
          case "bottomLed1":
            this.data[36] = colorCode(color);
            return;
          case "bottomLed2":
            this.data[37] = colorCode(color);
            return;
          case "bottomLed3":
            this.data[38] = colorCode(color);
            return;
          case "bottomLed4":
            this.data[39] = colorCode(color);
            return;
          case "bottomLed5":
            this.data[40] = colorCode(color);
            return;
          case "bottomLed6":
            this.data[41] = colorCode(color);
            return;
          default:
            throw new Error(`Invalid left light -- ${name}`);
        }
      case "right":
        switch (name) {
          case "assignLeft":
            this.data[34] = colorCode(color);
            return;
          case "assignRight":
            this.data[35] = colorCode(color);
            return;
          case "fxToggle1":
            this.data[30] = colorCode(color);
            return;
          case "fxToggle2":
            this.data[28] = colorCode(color);
            return;
          case "fxToggle3":
            this.data[26] = colorCode(color);
            return;
          case "fxToggle4":
            this.data[24] = colorCode(color);
            return;
          case "hotcue1":
            this.data[21] = colorCode(color);
            return;
          case "hotcue2":
            this.data[22] = colorCode(color);
            return;
          case "hotcue3":
            this.data[17] = colorCode(color);
            return;
          case "hotcue4":
            this.data[18] = colorCode(color);
            return;
          case "nudgeLeft":
            this.data[13] = colorCode(color);
            return;
          case "nudgeRight":
            this.data[14] = colorCode(color);
            return;
          case "cue":
            this.data[9] = colorCode(color);
            return;
          case "rev":
            this.data[10] = colorCode(color);
            return;
          case "play":
            this.data[5] = colorCode(color);
            return;
          case "sync":
            this.data[6] = colorCode(color);
            return;
          case "bottomLed1":
            this.data[43] = colorCode(color);
            return;
          case "bottomLed2":
            this.data[44] = colorCode(color);
            return;
          case "bottomLed3":
            this.data[45] = colorCode(color);
            return;
          case "bottomLed4":
            this.data[46] = colorCode(color);
            return;
          case "bottomLed5":
            this.data[47] = colorCode(color);
            return;
          case "bottomLed6":
            this.data[48] = colorCode(color);
            return;
          default:
            throw new Error(`Invalid right light -- ${name}`);
        }
      case "main":
        switch (name) {
          case "shift":
            this.data[0] = colorCode(color);
            return;
          default:
            throw new Error(`Invalid main light -- ${name}`);
        }
      default:
        throw new Error(`Invalid group -- ${group}`);
    }
  }

  /** Sends current values to the controller, if anything has changed. */
  send() {
    let hasChanged = false;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] !== this.oldData[i]) {
        hasChanged = true;
        break;
      }
    }

    if (hasChanged) {
      controller.sendOutputReport(0x80, this.data.buffer as ArrayBuffer);
      for (let i = 0; i < this.data.length; i++) {
        this.oldData[i] = this.data[i];
      }
    }
  }
}

export class Controller {
  previousMessage: InputMessage = InputMessage.load(NULL_INPUT_DATA);
  currentMessage: InputMessage = InputMessage.load(NULL_INPUT_DATA);
  lights: ControllerLights = new ControllerLights();

  /**
   * Processes new input data. This should immediately be followed by a
   * sync operation to sync the results to the engine.
   */
  processInput(data: Uint8Array) {
    this.previousMessage = this.currentMessage;
    this.currentMessage = InputMessage.load(data);
  }

  /**
   * Checks if a button was just pressed.
   */
  wasButtonPressed(
    group: ControllerGroup,
    name: ControllerButtonName,
  ): boolean {
    const oldValue = this.previousMessage.getButtonValue(group, name);
    const newValue = this.currentMessage.getButtonValue(group, name);
    return newValue && !oldValue;
  }

  /**
   * Checks if a button was just released.
   */
  wasButtonReleased(
    group: ControllerGroup,
    name: ControllerButtonName,
  ): boolean {
    const oldValue = this.previousMessage.getButtonValue(group, name);
    const newValue = this.currentMessage.getButtonValue(group, name);
    return !newValue && oldValue;
  }

  /**
   * Gets the value for a knob if it was just changed, otherwise returns
   * undefined.
   */
  getKnobIfChanged(
    group: ControllerGroup,
    name: ControllerKnobName,
  ): number | undefined {
    if (this.previousMessage.isNull()) {
      return undefined;
    }

    const oldValue = this.previousMessage.getKnobValue(group, name);
    const newValue = this.currentMessage.getKnobValue(group, name);
    if (oldValue !== newValue) {
      return newValue;
    } else {
      return undefined;
    }
  }

  /**
   * Gets the amount an encoder just changed by.
   */
  getEncoderChange(
    group: ControllerGroup,
    name: ControllerEncoderName,
  ): number {
    if (this.previousMessage.isNull()) {
      return 0;
    }

    const oldValue = this.previousMessage.getEncoderValue(group, name);
    const newValue = this.currentMessage.getEncoderValue(group, name);

    // Detect wrap-around
    if (Math.abs(oldValue - newValue) > 8) {
      if (oldValue < newValue) {
        return newValue - oldValue - 16;
      } else {
        return newValue - oldValue + 16;
      }
    } else {
      return newValue - oldValue;
    }
  }
}
