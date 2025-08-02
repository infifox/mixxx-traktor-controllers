/** The maximum value for a slider or knob. */
const INPUT_NUMBER_MAX = 0x0fff;

/** Empty input value, used before any input has been received. */
const NULL_INPUT = new Uint8Array([
  0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

/**
 * Indicates a side of the controller, for distinguishing controls and lights
 * which are repeated on both sides of the controller.
 */
type Side = "left" | "right";

/**
 * Provides a convenient interface to retrieve data from an input message.
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
    return this.data === NULL_INPUT;
  }

  /** EQ mode switch button status for a side */
  eqModeSwitch(side: Side): boolean {
    switch (side) {
      case "left":
        return !!(this.data[1] & 0x01);
      case "right":
        return !!(this.data[1] & 0x08);
    }
  }

  /** Stems mode switch button status for a side */
  stemsModeSwitch(side: Side): boolean {
    switch (side) {
      case "left":
        return !!(this.data[1] & 0x02);
      case "right":
        return !!(this.data[1] & 0x10);
    }
  }

  /** Decks toggle switch button status */
  decksAbCdToggle(): boolean {
    return !!(this.data[1] & 0x04);
  }

  /** FX toggle button status for a side */
  fxToggle(side: Side): boolean {
    switch (side) {
      case "left":
        return !!(this.data[1] & 0x20);
      case "right":
        return !!(this.data[1] & 0x40);
    }
  }

  /** FX switch button status */
  fxSwitch(number: number): boolean {
    switch (number) {
      case 1:
        return !!(this.data[1] & 0x80);
      case 2:
        return !!(this.data[2] & 0x01);
      case 3:
        return !!(this.data[2] & 0x02);
      case 4:
        return !!(this.data[2] & 0x04);
      case 5:
        return !!(this.data[2] & 0x08);
      default:
        return false;
    }
  }

  /** Prelisten toggle button status for a side */
  prelistenToggle(side: Side): boolean {
    switch (side) {
      case "left":
        return !!(this.data[2] & 0x10);
      case "right":
        return !!(this.data[2] & 0x20);
    }
  }

  /** Gain knob for a side, scaled to 0-1 */
  gain(side: Side): number {
    switch (side) {
      case "left":
        return (this.data[3] | (this.data[4] << 8)) / INPUT_NUMBER_MAX;
      case "right":
        return (this.data[13] | (this.data[14] << 8)) / INPUT_NUMBER_MAX;
    }
  }

  /** Hi knob for a side, scaled to 0-1 */
  hi(side: Side): number {
    switch (side) {
      case "left":
        return (this.data[5] | (this.data[6] << 8)) / INPUT_NUMBER_MAX;
      case "right":
        return (this.data[15] | (this.data[16] << 8)) / INPUT_NUMBER_MAX;
    }
  }

  /** Mid knob for a side, scaled to 0-1 */
  mid(side: Side): number {
    switch (side) {
      case "left":
        return (this.data[7] | (this.data[8] << 8)) / INPUT_NUMBER_MAX;
      case "right":
        return (this.data[17] | (this.data[18] << 8)) / INPUT_NUMBER_MAX;
    }
  }

  /** Low knob for a side, scaled to 0-1 */
  low(side: Side): number {
    switch (side) {
      case "left":
        return (this.data[9] | (this.data[10] << 8)) / INPUT_NUMBER_MAX;
      case "right":
        return (this.data[19] | (this.data[20] << 8)) / INPUT_NUMBER_MAX;
    }
  }

  /** FX knob for a side, scaled to 0-1 */
  fx(side: Side): number {
    switch (side) {
      case "left":
        return (this.data[11] | (this.data[12] << 8)) / INPUT_NUMBER_MAX;
      case "right":
        return (this.data[21] | (this.data[22] << 8)) / INPUT_NUMBER_MAX;
    }
  }

  /** Headphone mix, scaled to 0-1 */
  headphonesMix(): number {
    return (this.data[23] | (this.data[24] << 8)) / INPUT_NUMBER_MAX;
  }

  /** Main volume, scaled to 0-1 */
  mainVolume(): number {
    return (this.data[25] | (this.data[26] << 8)) / INPUT_NUMBER_MAX;
  }

  /** Headphone volume, scaled to 0-1 */
  headphonesVolume(): number {
    return (this.data[27] | (this.data[28] << 8)) / INPUT_NUMBER_MAX;
  }

  /** Fader position, scaled to 0-1 */
  fader(side: Side): number {
    switch (side) {
      case "left":
        return (this.data[29] | (this.data[30] << 8)) / INPUT_NUMBER_MAX;
      case "right":
        return (this.data[31] | (this.data[32] << 8)) / INPUT_NUMBER_MAX;
    }
  }

  /** Crossfader position, scaled to 0-1 */
  crossfader(): number {
    return (this.data[33] | (this.data[34] << 8)) / INPUT_NUMBER_MAX;
  }
}

const mappings = [
  {
    channel: "[Channel1]",
    side: "left" as const,
  },
  {
    channel: "[Channel2]",
    side: "right" as const,
  },
];

/**
 * Scales a value from 0-1 into a value from 0-4, for use as a gain value. Values < 0.5 are
 * linearly mapped to 0-1, and 0.5-1 are mapped to 1-4. */
const scaleToGain = (value: number): number => {
  if (value < 0.5) {
    return value * 2;
  } else {
    return (value - 0.5) * 6 + 1;
  }
};

/** Scales a value from 0-1 into a value from -1-1 for use as a crossfade value. */
const scaleToCrossfade = (value: number): number => {
  return value * 2 - 1;
};

/** Processes a change in input and updates the engine. */
function updateEngineFromInput(
  input: InputMessage,
  oldInput: InputMessage,
  isDebugging: boolean,
): void {
  const buttonWasPressed = (fn: (input: InputMessage) => boolean): boolean => {
    return fn(input) && !fn(oldInput);
  };
  const toggleBoolean = (group: string, name: string): void => {
    const value = engine.getValue(group, name);
    engine.setValue(group, name, value === 0 ? 1 : 0);
  };

  // Handle center knobs and sliders
  engine.setValue("[Master]", "gain", scaleToGain(input.mainVolume()));
  engine.setValue(
    "[Master]",
    "headMix",
    scaleToCrossfade(input.headphonesMix()),
  );
  engine.setValue(
    "[Master]",
    "headGain",
    scaleToGain(input.headphonesVolume()),
  );
  engine.setValue(
    "[Master]",
    "crossfader",
    scaleToCrossfade(input.crossfader()),
  );

  // Handle changes for each side
  for (const { channel, side } of mappings) {
    const eqRack = `[EqualizerRack1_${channel}_Effect1]`;
    const fxRack = `[QuickEffectRack1_${channel}]`;

    // Set side knob and fader values
    engine.setValue(channel, "pregain", scaleToGain(input.gain(side)));
    engine.setValue(eqRack, "parameter3", scaleToGain(input.hi(side)));
    engine.setValue(eqRack, "parameter2", scaleToGain(input.mid(side)));
    engine.setValue(eqRack, "parameter1", scaleToGain(input.low(side)));
    engine.setValue(fxRack, "super1", input.fx(side));
    engine.setValue(channel, "volume", input.fader(side));

    // Handle toggle FX
    if (input.fxToggle(side) && !oldInput.fxToggle(side)) {
      toggleBoolean(fxRack, "enabled");
      if (isDebugging) {
        console.debug(`FX toggled for channel ${channel}`);
      }
    }

    // Handle toggle prelisten
    if (buttonWasPressed((input) => input.prelistenToggle(side))) {
      toggleBoolean(channel, "pfl");
      if (isDebugging) {
        console.debug(`Prelisten toggled for channel ${channel}`);
      }
    }

    // Handle FX switch buttons
    for (let n = 1; n <= 5; n++) {
      if (buttonWasPressed((input) => input.fxSwitch(n))) {
        const numChainPresets = engine.getValue(fxRack, "num_chain_presets");
        if (n < numChainPresets) {
          console.debug(
            `Loading quick effect chain preset ${n}/${numChainPresets} for channel ${channel}`,
          );
          engine.setValue(fxRack, "loaded_chain_preset", n);

          // Workaround for FX super wheel not updating if preset is loaded at the same time
          engine.beginTimer(
            1,
            () => {
              engine.setValue(fxRack, "super1", input.fx(side));
            },
            false,
          );
        } else {
          console.warn(
            `Attempt to load quick effect chain preset ${n}/${numChainPresets}, but no such preset exists`,
          );
        }
      }
    }
  }
}

class TraktorZ1MK2Class {
  id: string = "";
  isDebugging = false;
  currentInput: InputMessage = InputMessage.load(NULL_INPUT);

  init(id: string, isDebugging: boolean): void {
    this.id = id;
    this.isDebugging = isDebugging;
    if (this.isDebugging) {
      console.log(`TraktorZ1Mk2 initialized with id: ${id}`);
    }
  }

  shutdown(): void {}

  incomingData(data: Uint8Array, _length: number): void {
    let message: InputMessage;
    try {
      message = InputMessage.load(data);
    } catch (e) {
      console.warn(`Error loading input message: ${e}`);
      return;
    }
    updateEngineFromInput(message, this.currentInput, this.isDebugging);
    this.currentInput = message;
  }
}

// eslint-disable-next-line no-var
var TraktorZ1MK2 = new TraktorZ1MK2Class();
