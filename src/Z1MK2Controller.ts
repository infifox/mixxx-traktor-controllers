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
 * - *eqMode* - EQ mode switch button for a side
 * - *stemMode* - Stems mode switch button for a side
 * - *top* - Top button (menu, deck switch, hamburger button)
 * - *fxToggle* - FX toggle button for a side
 * - *fx1* - FX switch button 1
 * - *fx2* - FX switch button 2
 * - *fx3* - FX switch button 3
 * - *fx4* - FX switch button 4
 * - *fxFilter* - FX switch "filter" button
 * - *prelisten* - Prelisten toggle button for a side
 */
export type ControllerButtonName =
  | "eqMode"
  | "stemMode"
  | "top"
  | "fxToggle"
  | "fx1"
  | "fx2"
  | "fx3"
  | "fx4"
  | "fxFilter"
  | "prelisten";

/**
 * Identifies all inputs which are knobs or sliders, with a numerical value
 * from 0-1.
 *
 * - *main* - Main volume knob
 * - *hpmix* - Headphone mix knob
 * - *hpvol* - Headphone volume knob
 * - *crossfader* - Crossfader
 * - *gain* - Gain knob for a side
 * - *hi* - High EQ knob for a side
 * - *mid* - Mid EQ knob for a side
 * - *low* - Low EQ knob for a side
 * - *fx* - FX knob for a side
 * - *fader* - Fader for a side
 */
export type ControllerKnobName =
  | "main"
  | "hpmix"
  | "hpvol"
  | "crossfader"
  | "gain"
  | "hi"
  | "mid"
  | "low"
  | "fx"
  | "fader";

/**
 * Identifies all multicolor lights on the controller.
 *
 * - *eqModeSwitch* - EQ mode switch light
 * - *stemModeSwitch* - Stem mode switch light
 * - *fxToggle* - FX toggle light
 * - *fx1* - FX switch 1 light
 * - *fx2* - FX switch 2 light
 * - *fx3* - FX switch 3 light
 * - *fx4* - FX switch 4 light
 * - *fx5* - FX switch 5 light
 * - *fxFilter* - FX switch "filter" light
 * - *prelisten* - Prelisten toggle light
 * - *bottomLed1* - Bottom LED 1 light (frontmost)
 * - *bottomLed2* - Bottom LED 2 light
 * - *bottomLed3* - Bottom LED 3 light
 * - *bottomLed4* - Bottom LED 4 light
 * - *bottomLed5* - Bottom LED 5 light
 * - *bottomLed6* - Bottom LED 6 light (rearmost)
 */
export type ControllerColoredLightName =
  | "eqModeSwitch"
  | "stemModeSwitch"
  | "fxToggle"
  | "fx1"
  | "fx2"
  | "fx3"
  | "fx4"
  | "fx5"
  | "fxFilter"
  | "prelisten"
  | "bottomLed1"
  | "bottomLed2"
  | "bottomLed3"
  | "bottomLed4"
  | "bottomLed5"
  | "bottomLed6";

/** Empty input data, used before any input has been received. */
const NULL_INPUT_DATA = new Uint8Array([
  0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
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
    if (data.length !== 35) {
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
            return !!(this.data[1] & 0x04);
          case "fx1":
            return !!(this.data[1] & 0x80);
          case "fx2":
            return !!(this.data[2] & 0x01);
          case "fx3":
            return !!(this.data[2] & 0x02);
          case "fx4":
            return !!(this.data[2] & 0x04);
          case "fxFilter":
            return !!(this.data[2] & 0x08);
        }
      case "left":
        switch (name) {
          case "eqMode":
            return !!(this.data[1] & 0x01);
          case "stemMode":
            return !!(this.data[1] & 0x02);
          case "fxToggle":
            return !!(this.data[1] & 0x20);
          case "prelisten":
            return !!(this.data[2] & 0x10);
          default:
        }
      case "right":
        switch (name) {
          case "eqMode":
            return !!(this.data[1] & 0x08);
          case "stemMode":
            return !!(this.data[1] & 0x10);
          case "fxToggle":
            return !!(this.data[1] & 0x40);
          case "prelisten":
            return !!(this.data[2] & 0x20);
        }
    }

    throw new Error(`Invalid button -- ${group}:${name}`);
  }

  getKnobValue(group: ControllerGroup, name: ControllerKnobName): number {
    switch (group) {
      case "main":
        switch (name) {
          case "main":
            return (this.data[25] | (this.data[26] << 8)) / INPUT_NUMBER_MAX;
          case "hpmix":
            return (this.data[23] | (this.data[24] << 8)) / INPUT_NUMBER_MAX;
          case "hpvol":
            return (this.data[27] | (this.data[28] << 8)) / INPUT_NUMBER_MAX;
          case "crossfader":
            return (this.data[33] | (this.data[34] << 8)) / INPUT_NUMBER_MAX;
        }
      case "left":
        switch (name) {
          case "gain":
            return (this.data[3] | (this.data[4] << 8)) / INPUT_NUMBER_MAX;
          case "hi":
            return (this.data[5] | (this.data[6] << 8)) / INPUT_NUMBER_MAX;
          case "mid":
            return (this.data[7] | (this.data[8] << 8)) / INPUT_NUMBER_MAX;
          case "low":
            return (this.data[9] | (this.data[10] << 8)) / INPUT_NUMBER_MAX;
          case "fx":
            return (this.data[11] | (this.data[12] << 8)) / INPUT_NUMBER_MAX;
          case "fader":
            return (this.data[29] | (this.data[30] << 8)) / INPUT_NUMBER_MAX;
        }
      case "right":
        switch (name) {
          case "gain":
            return (this.data[13] | (this.data[14] << 8)) / INPUT_NUMBER_MAX;
          case "hi":
            return (this.data[15] | (this.data[16] << 8)) / INPUT_NUMBER_MAX;
          case "mid":
            return (this.data[17] | (this.data[18] << 8)) / INPUT_NUMBER_MAX;
          case "low":
            return (this.data[19] | (this.data[20] << 8)) / INPUT_NUMBER_MAX;
          case "fx":
            return (this.data[21] | (this.data[22] << 8)) / INPUT_NUMBER_MAX;
          case "fader":
            return (this.data[31] | (this.data[32] << 8)) / INPUT_NUMBER_MAX;
        }
    }

    throw new Error(`Invalid input -- ${group}:${name}`);
  }
}

/** Abstraction to update lights on for the controller. */
class ControllerLights {
  oldData: Uint8Array = new Uint8Array(46);
  data: Uint8Array = new Uint8Array(46);

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
      case "main":
        switch (name) {
          case "fx1":
            this.data[27] = colorCode(color);
            return;
          case "fx2":
            this.data[28] = colorCode(color);
            return;
          case "fx3":
            this.data[29] = colorCode(color);
            return;
          case "fx4":
            this.data[30] = colorCode(color);
            return;
          case "fxFilter":
            this.data[31] = colorCode(color);
            return;
          default:
            throw new Error(`Invalid main light -- ${name}`);
        }
      case "left":
        switch (name) {
          case "eqModeSwitch":
            this.data[20] = colorCode(color);
            return;
          case "stemModeSwitch":
            this.data[21] = colorCode(color);
            return;
          case "fxToggle":
            this.data[25] = colorCode(color);
            return;
          case "prelisten":
            this.data[32] = colorCode(color);
            return;
          case "bottomLed1":
            this.data[34] = colorCode(color);
            return;
          case "bottomLed2":
            this.data[35] = colorCode(color);
            return;
          case "bottomLed3":
            this.data[36] = colorCode(color);
            return;
          case "bottomLed4":
            this.data[37] = colorCode(color);
            return;
          case "bottomLed5":
            this.data[38] = colorCode(color);
            return;
          case "bottomLed6":
            this.data[39] = colorCode(color);
            return;
          default:
            throw new Error(`Invalid left light -- ${name}`);
        }
      case "right":
        switch (name) {
          case "eqModeSwitch":
            this.data[23] = colorCode(color);
            return;
          case "stemModeSwitch":
            this.data[24] = colorCode(color);
            return;
          case "fxToggle":
            this.data[26] = colorCode(color);
            return;
          case "prelisten":
            this.data[33] = colorCode(color);
            return;
          case "bottomLed1":
            this.data[40] = colorCode(color);
            return;
          case "bottomLed2":
            this.data[41] = colorCode(color);
            return;
          case "bottomLed3":
            this.data[42] = colorCode(color);
            return;
          case "bottomLed4":
            this.data[43] = colorCode(color);
            return;
          case "bottomLed5":
            this.data[44] = colorCode(color);
            return;
          case "bottomLed6":
            this.data[45] = colorCode(color);
            return;
          default:
            throw new Error(`Invalid right light -- ${name}`);
        }
      default:
        throw new Error(`Invalid group -- ${group}`);
    }
  }

  /** Sets the value of a VU meter. Value is a number out of 10 */
  setVuValue(group: ControllerGroup, value: number) {
    switch (group) {
      case "left":
        for (let i = 0; i < 10; i++) {
          this.data[i] = i < value ? 0x7e : 0x00;
        }
        return;
      case "right":
        for (let i = 0; i < 10; i++) {
          this.data[10 + i] = i < value ? 0x7e : 0x00;
        }
        return;
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
   * Gets the value for a knob if it was just changed, otehrwise returns
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
}
