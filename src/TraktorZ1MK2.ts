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

/** Represents an RGB color code which can be displayed by a light. */
type Color =
  | "black"
  | "red"
  | "redDim"
  | "darkOrange"
  | "darkOrangeDim"
  | "lightOrange"
  | "lightOrangeDim"
  | "warmOrange"
  | "warmOrangeDim"
  | "warmYellow"
  | "yellow"
  | "yellowDim"
  | "lime"
  | "limeDim"
  | "green"
  | "greenDim"
  | "mint"
  | "mintDim"
  | "cyan"
  | "cyanDim"
  | "turquoise"
  | "turquoiseDim"
  | "blue"
  | "blueDim"
  | "plum"
  | "plumDim"
  | "violet"
  | "violetDim"
  | "purple"
  | "purpleDim"
  | "magenta"
  | "magentaDim"
  | "fuschiaDark"
  | "fuschia"
  | "white";

const COLOR_CODES: Record<Color, number> = {
  black: 0x00,
  redDim: 0x04,
  red: 0x06,
  darkOrangeDim: 0x08,
  darkOrange: 0x0a,
  lightOrangeDim: 0x0c,
  lightOrange: 0x0e,
  warmOrangeDim: 0x10,
  warmOrange: 0x12,
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
  warmYellow: 0x12,
};

const DIM_COLORS: Record<Color, Color> = {
  black: "black",
  redDim: "redDim",
  red: "redDim",
  darkOrangeDim: "darkOrangeDim",
  darkOrange: "darkOrangeDim",
  lightOrangeDim: "lightOrangeDim",
  lightOrange: "lightOrangeDim",
  warmOrangeDim: "warmOrangeDim",
  warmOrange: "warmOrangeDim",
  warmYellow: "warmOrangeDim",
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
  white: "white",
};

type ColorConfig = {
  theme: Color;
  eqSwitch: Color | "default";
  stemsSwitch: Color | "default";
  fx: Color[];
  prelistenToggle: Color | "default";
  bottomLedsDefault: Color | "default";
  bottomLeds: (Color | "default")[];
};

const DEFAULT_COLOR_CONFIG: ColorConfig = {
  theme: "lightOrange",
  eqSwitch: "default",
  stemsSwitch: "default",
  fx: ["red", "green", "blue", "magenta", "darkOrange"],
  prelistenToggle: "default",
  bottomLedsDefault: "default",
  bottomLeds: [
    "default",
    "default",
    "default",
    "default",
    "default",
    "default",
  ],
};

/** Provides a convenient interface to store light status and send it to the controller. */
class LightsStatus {
  vuLevel: Record<Side, number> = { left: 0, right: 0 };
  eqModeSwitch: Record<Side, Color> = { left: "black", right: "black" };
  stemsModeSwitch: Record<Side, Color> = { left: "black", right: "black" };
  fxToggle: Record<Side, Color> = { left: "black", right: "black" };
  fxSwitches: Color[] = ["black", "black", "black", "black"];
  fxFilterSwitch: Color = "black";
  prelistenToggle: Record<Side, Color> = { left: "black", right: "black" };
  bottomLeds: Record<Side, Color[]> = {
    left: ["black", "black", "black", "black", "black", "black"],
    right: ["black", "black", "black", "black", "black", "black"],
  };

  toMessage(): Uint8Array {
    const message = new Uint8Array(47);

    // Message ID
    message[0] = 0x80;

    // VU Meter Left (bytes 1-10)
    for (let i = 0; i < 10; i++) {
      message[1 + i] = i < this.vuLevel.left ? 0x7e : 0x00;
    }

    // VU Meter Right (bytes 11-20)
    for (let i = 0; i < 10; i++) {
      message[11 + i] = i < this.vuLevel.right ? 0x7e : 0x00;
    }

    // EQ Mode Switch Left
    message[21] = COLOR_CODES[this.eqModeSwitch.left];

    // Stems Mode Switch Left
    message[22] = COLOR_CODES[this.stemsModeSwitch.left];

    // Unused (byte 23)
    message[23] = 0x00;

    // EQ Mode Switch Right
    message[24] = COLOR_CODES[this.eqModeSwitch.right];

    // Stems Mode Switch Right
    message[25] = COLOR_CODES[this.stemsModeSwitch.right];

    // FX Toggle Left
    message[26] = COLOR_CODES[this.fxToggle.left];

    // FX Toggle Right
    message[27] = COLOR_CODES[this.fxToggle.right];

    // FX Switches
    for (var i = 0; i < 4; i++) {
      message[28 + i] = COLOR_CODES[this.fxSwitches[i]];
    }

    // FX Filter Switch
    message[32] = COLOR_CODES[this.fxFilterSwitch];

    // Prelisten Toggle Left
    message[33] = COLOR_CODES[this.prelistenToggle.left];

    // Prelisten Toggle Right
    message[34] = COLOR_CODES[this.prelistenToggle.right];

    // Bottom LEDs Left (bytes 35-40)
    for (let i = 0; i < 6; i++) {
      message[35 + i] = COLOR_CODES[this.bottomLeds.left[i]];
    }

    // Bottom LEDs Right (bytes 41-46)
    for (let i = 0; i < 6; i++) {
      message[41 + i] = COLOR_CODES[this.bottomLeds.right[i]];
    }

    return message;
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
const updateEngineFromInput = (
  input: InputMessage,
  oldInput: InputMessage,
  isDebugging: boolean,
): boolean => {
  let lightsChanged = false;

  const buttonWasPressed = (fn: (input: InputMessage) => boolean): boolean => {
    return fn(input) && !fn(oldInput);
  };
  const toggleBoolean = (group: string, name: string): void => {
    const value = engine.getValue(group, name);
    engine.setValue(group, name, value === 0 ? 1 : 0);
    lightsChanged = true;
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
          lightsChanged = true;

          // Workaround for FX super wheel not updating if preset is loaded at the same time
          engine.beginTimer(
            1,
            () => {
              engine.setValue(fxRack, "super1", input.fx(side));
            },
            true,
          );
        } else {
          console.warn(
            `Attempt to load quick effect chain preset ${n}/${numChainPresets}, but no such preset exists`,
          );
        }
      }
    }
  }

  return lightsChanged;
};

const updateLightsFromEngine = (
  lights: LightsStatus,
  colors: ColorConfig,
  force: boolean,
): void => {
  const oldValue = lights.toMessage();

  // Update eq switch
  const eqSwitchColor =
    colors.eqSwitch === "default" ? colors.theme : colors.eqSwitch;
  lights.eqModeSwitch.left = DIM_COLORS[eqSwitchColor];
  lights.eqModeSwitch.right = DIM_COLORS[eqSwitchColor];

  // Update stems switch
  const stemsSwitchColor =
    colors.stemsSwitch === "default" ? colors.theme : colors.stemsSwitch;
  lights.stemsModeSwitch.left = DIM_COLORS[stemsSwitchColor];
  lights.stemsModeSwitch.right = DIM_COLORS[stemsSwitchColor];

  // Work out which effect presets are currently active
  const activeEffectPresets = new Set();
  for (const { channel } of mappings) {
    const fxRack = `[QuickEffectRack1_${channel}]`;
    const activeEffectPreset = engine.getValue(fxRack, "loaded_chain_preset");
    activeEffectPresets.add(activeEffectPreset);
  }

  // Update FX switching buttons
  for (let n = 1; n <= 5; n++) {
    const filterSwitchColor = colors.fx[n - 1] ?? "blue";
    const colorWithStatus = activeEffectPresets.has(n)
      ? filterSwitchColor
      : DIM_COLORS[filterSwitchColor];
    if (n === 5) {
      lights.fxFilterSwitch = colorWithStatus;
    } else {
      lights.fxSwitches[n - 1] = colorWithStatus;
    }
  }

  // Update lights for each side
  for (const { channel, side } of mappings) {
    const fxRack = `[QuickEffectRack1_${channel}]`;

    // Update FX toggle light
    const activeEffectPreset = engine.getValue(fxRack, "loaded_chain_preset");
    if (activeEffectPreset < 1 || activeEffectPreset > 5) {
      lights.fxToggle[side] = "black";
    } else {
      const isActive = engine.getValue(fxRack, "enabled") !== 0;
      const fxColor = colors.fx[activeEffectPreset - 1] ?? "blue";
      lights.fxToggle[side] = isActive ? fxColor : DIM_COLORS[fxColor];
    }

    // Update prelisten toggle light
    const prelistenEnabled = engine.getValue(channel, "pfl") !== 0;
    const prelistenColor =
      colors.prelistenToggle !== "default"
        ? colors.prelistenToggle
        : colors.theme;
    lights.prelistenToggle[side] = prelistenEnabled
      ? prelistenColor
      : DIM_COLORS[prelistenColor];

    // Update VU meter
    lights.vuLevel[side] = engine.getValue(channel, "VuMeter") * 10;

    // Update bottom LEDs
    const isBeatActive = engine.getValue(channel, "beat_active") !== 0;
    for (let i = 0; i < 6; i++) {
      const individualColor = colors.bottomLeds[i] ?? "default";
      const color =
        individualColor !== "default"
          ? individualColor
          : colors.bottomLedsDefault !== "default"
            ? colors.bottomLedsDefault
            : colors.theme;
      lights.bottomLeds[side][i] = isBeatActive ? color : DIM_COLORS[color];
    }
  }

  const newValue = lights.toMessage();
  let isChanged = false;
  for (let i = 0; i < oldValue.length; i++) {
    if (newValue[i] !== oldValue[i]) {
      isChanged = true;
      break;
    }
  }

  if (isChanged || force) {
    controller.sendOutputReport(0, newValue.buffer as ArrayBuffer);
  }
};

class TraktorZ1MK2Class {
  id: string = "";
  isDebugging = false;
  currentInput: InputMessage = InputMessage.load(NULL_INPUT);
  lights: LightsStatus = new LightsStatus();
  colorConfig: ColorConfig = DEFAULT_COLOR_CONFIG;
  lightsTimer?: engine.TimerID;

  init(id: string, isDebugging: boolean): void {
    this.id = id;
    this.isDebugging = isDebugging;
    if (this.isDebugging) {
      console.log(`TraktorZ1Mk2 initialized with id: ${id}`);
    }

    updateLightsFromEngine(this.lights, this.colorConfig, true);

    this.lightsTimer = engine.beginTimer(25, () => {
      updateLightsFromEngine(this.lights, this.colorConfig, false);
    });
  }

  shutdown(): void {
    if (this.lightsTimer) {
      engine.stopTimer(this.lightsTimer);
      this.lightsTimer = undefined;
    }
  }

  incomingData(data: Uint8Array, _length: number): void {
    let message: InputMessage;
    try {
      message = InputMessage.load(data);
    } catch (e) {
      console.warn(`Error loading input message: ${e}`);
      return;
    }
    const lightsChanged = updateEngineFromInput(
      message,
      this.currentInput,
      this.isDebugging,
    );
    if (lightsChanged) {
      updateLightsFromEngine(this.lights, this.colorConfig, false);
    }
    this.currentInput = message;
  }
}

// eslint-disable-next-line no-var
var TraktorZ1MK2 = new TraktorZ1MK2Class();
