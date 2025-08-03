import {
  colorCode,
  defaultedColor,
  dimColor,
  dimColorWhen,
} from "./TraktorColors";
import { TraktorScreens } from "./TraktorScreen";

/** The maximum value for a slider or knob. */
const INPUT_NUMBER_MAX = 0x0fff;

/** Empty input value, used before any input has been received. */
const NULL_INPUT = new Uint8Array([
  0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

type TraktorZ1MK2Config = {
  colorTheme: string;
  colorEqSwitch: string;
  colorStemsSwitch: string;
  colorFx1: string;
  colorFx2: string;
  colorFx3: string;
  colorFx4: string;
  colorFx5: string;
  colorFx6: string;
  colorFx7: string;
  colorFx8: string;
  colorPrelistenToggle: string;
  colorBottomLedsDefault: string;
  colorBottomLeds1: string;
  colorBottomLeds2: string;
  colorBottomLeds3: string;
  colorBottomLeds4: string;
  colorBottomLeds5: string;
  colorBottomLeds6: string;
  blinkBottomLeds: boolean;
};

const DEFAULT_Z1_MK2_CONFIG: TraktorZ1MK2Config = {
  colorTheme: "blue",
  colorEqSwitch: "default",
  colorStemsSwitch: "default",
  colorFx1: "red",
  colorFx2: "green",
  colorFx3: "blue",
  colorFx4: "yellow",
  colorFx5: "darkOrange",
  colorFx6: "magenta",
  colorFx7: "cyan",
  colorFx8: "plum",
  colorPrelistenToggle: "default",
  colorBottomLedsDefault: "default",
  colorBottomLeds1: "default",
  colorBottomLeds2: "default",
  colorBottomLeds3: "default",
  colorBottomLeds4: "default",
  colorBottomLeds5: "default",
  colorBottomLeds6: "default",
  blinkBottomLeds: false,
};

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

/** Provides a convenient interface to store light status and send it to the controller. */
class LightsStatus {
  vuLevel: Record<Side, number> = { left: 0, right: 0 };
  eqModeSwitch: Record<Side, string> = { left: "black", right: "black" };
  stemsModeSwitch: Record<Side, string> = { left: "black", right: "black" };
  fxToggle: Record<Side, string> = { left: "black", right: "black" };
  fxSwitches: string[] = ["black", "black", "black", "black"];
  fxFilterSwitch: string = "black";
  prelistenToggle: Record<Side, string> = { left: "black", right: "black" };
  bottomLeds: Record<Side, string[]> = {
    left: ["black", "black", "black", "black", "black", "black"],
    right: ["black", "black", "black", "black", "black", "black"],
  };

  clear() {
    this.vuLevel = { left: 0, right: 0 };
    this.eqModeSwitch = { left: "black", right: "black" };
    this.stemsModeSwitch = { left: "black", right: "black" };
    this.fxToggle = { left: "black", right: "black" };
    this.fxSwitches = ["black", "black", "black", "black"];
    this.fxFilterSwitch = "black";
    this.prelistenToggle = { left: "black", right: "black" };
    this.bottomLeds = {
      left: ["black", "black", "black", "black", "black", "black"],
      right: ["black", "black", "black", "black", "black", "black"],
    };
  }

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
    message[21] = colorCode(this.eqModeSwitch.left);

    // Stems Mode Switch Left
    message[22] = colorCode(this.stemsModeSwitch.left);

    // Unused (byte 23)
    message[23] = 0x00;

    // EQ Mode Switch Right
    message[24] = colorCode(this.eqModeSwitch.right);

    // Stems Mode Switch Right
    message[25] = colorCode(this.stemsModeSwitch.right);

    // FX Toggle Left
    message[26] = colorCode(this.fxToggle.left);

    // FX Toggle Right
    message[27] = colorCode(this.fxToggle.right);

    // FX Switches
    for (var i = 0; i < 4; i++) {
      message[28 + i] = colorCode(this.fxSwitches[i]);
    }

    // FX Filter Switch
    message[32] = colorCode(this.fxFilterSwitch);

    // Prelisten Toggle Left
    message[33] = colorCode(this.prelistenToggle.left);

    // Prelisten Toggle Right
    message[34] = colorCode(this.prelistenToggle.right);

    // Bottom LEDs Left (bytes 35-40)
    for (let i = 0; i < 6; i++) {
      message[35 + i] = colorCode(this.bottomLeds.left[i]);
    }

    // Bottom LEDs Right (bytes 41-46)
    for (let i = 0; i < 6; i++) {
      message[41 + i] = colorCode(this.bottomLeds.right[i]);
    }

    return message;
  }

  send() {
    controller.sendOutputReport(0, this.toMessage().buffer as ArrayBuffer);
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

type ChangeDescription = {
  label: string;
  value: string;
};

/** Processes a change in input and updates the engine. */
const updateEngineFromInput = (
  input: InputMessage,
  oldInput: InputMessage,
  isDebugging: boolean,
): {
  lightsChanged: boolean;
  changeDescriptions: (ChangeDescription | undefined)[];
} => {
  let lightsChanged = false;
  const changeDescriptions: (ChangeDescription | undefined)[] = [
    undefined,
    undefined,
    undefined,
  ];

  const buttonWasPressed = (fn: (input: InputMessage) => boolean): boolean => {
    return fn(input) && !fn(oldInput);
  };
  const handleValueChange = (
    side: Side | "main",
    label: string,
    getValue: (input: InputMessage) => number,
    setValue: (value: number) => void,
  ) => {
    const oldValue = getValue(oldInput);
    const value = getValue(input);
    if (!oldInput.isNull() && value !== oldValue) {
      setValue(value);
      let i = 0;
      switch (side) {
        case "left":
          i = 0;
          break;
        case "main":
          i = 1;
          break;
        case "right":
          i = 2;
          break;
      }
      changeDescriptions[i] = {
        label,
        value: `${Math.round(value * 100)}%`,
      };
    }
  };
  const toggleBoolean = (group: string, name: string): void => {
    const value = engine.getValue(group, name);
    engine.setValue(group, name, value === 0 ? 1 : 0);
    lightsChanged = true;
  };

  // Handle center knobs and sliders
  handleValueChange(
    "main",
    "Main",
    (input) => input.mainVolume(),
    (value) => {
      engine.setValue("[Master]", "gain", scaleToGain(value));
    },
  );
  handleValueChange(
    "main",
    "Hp Mix",
    (input) => input.headphonesMix(),
    (value) => {
      engine.setValue("[Master]", "headMix", scaleToCrossfade(value));
    },
  );
  handleValueChange(
    "main",
    "Hp Vol",
    (input) => input.headphonesVolume(),
    (value) => {
      engine.setValue("[Master]", "headGain", scaleToGain(value));
    },
  );
  handleValueChange(
    "main",
    "Xfade",
    (input) => input.crossfader(),
    (value) => {
      engine.setValue("[Master]", "crossfader", scaleToCrossfade(value));
    },
  );

  // Handle changes for each side
  for (const { channel, side } of mappings) {
    const eqRack = `[EqualizerRack1_${channel}_Effect1]`;
    const fxRack = `[QuickEffectRack1_${channel}]`;

    // Set side knob and fader values
    handleValueChange(
      side,
      "Gain",
      (input) => input.gain(side),
      (value) => {
        engine.setValue(channel, "pregain", scaleToGain(value));
      },
    );
    handleValueChange(
      side,
      "Hi",
      (input) => input.hi(side),
      (value) => {
        engine.setValue(eqRack, "parameter3", scaleToGain(value));
      },
    );
    handleValueChange(
      side,
      "Mid",
      (input) => input.mid(side),
      (value) => {
        engine.setValue(eqRack, "parameter2", scaleToGain(value));
      },
    );
    handleValueChange(
      side,
      "Low",
      (input) => input.low(side),
      (value) => {
        engine.setValue(eqRack, "parameter1", scaleToGain(value));
      },
    );
    handleValueChange(
      side,
      "FX",
      (input) => input.fx(side),
      (value) => {
        engine.setValue(fxRack, "super1", value);
      },
    );
    handleValueChange(
      side,
      "Volume",
      (input) => input.fader(side),
      (value) => {
        engine.setValue(channel, "volume", value);
      },
    );

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

          changeDescriptions[1] = {
            label: "FX",
            value: `#${n}`,
          };
        } else {
          console.warn(
            `Attempt to load quick effect chain preset ${n}/${numChainPresets}, but no such preset exists`,
          );
        }
      }
    }
  }

  return { lightsChanged, changeDescriptions };
};

const updateLightsFromEngine = (
  lights: LightsStatus,
  config: TraktorZ1MK2Config,
  force: boolean,
): void => {
  const oldValue = lights.toMessage();

  // Update eq switch
  const eqSwitchColor = defaultedColor(config.colorEqSwitch, config.colorTheme);
  lights.eqModeSwitch.left = dimColor(eqSwitchColor);
  lights.eqModeSwitch.right = dimColor(eqSwitchColor);

  // Update stems switch
  const stemsSwitchColor = defaultedColor(
    config.colorStemsSwitch,
    config.colorTheme,
  );
  lights.stemsModeSwitch.left = dimColor(stemsSwitchColor);
  lights.stemsModeSwitch.right = dimColor(stemsSwitchColor);

  // Work out which effect presets are currently active
  const activeEffectPresets = new Set();
  for (const { channel } of mappings) {
    const fxRack = `[QuickEffectRack1_${channel}]`;
    const activeEffectPreset = engine.getValue(fxRack, "loaded_chain_preset");
    activeEffectPresets.add(activeEffectPreset);
  }

  // Update FX switching buttons
  for (let n = 1; n <= 4; n++) {
    const colorKey = `colorFx${n}`;
    if (!(colorKey in config)) {
      throw new Error("Invalid color index");
    }
    lights.fxSwitches[n - 1] = dimColorWhen(
      defaultedColor(
        config[colorKey as keyof typeof config] as string,
        config.colorTheme,
      ),
      !activeEffectPresets.has(n),
    );
  }
  lights.fxFilterSwitch = dimColorWhen(
    config.colorFx5,
    !activeEffectPresets.has(5),
  );

  // Update lights for each side
  for (const { channel, side } of mappings) {
    const fxRack = `[QuickEffectRack1_${channel}]`;

    // Update FX toggle light
    const activeEffectPreset = engine.getValue(fxRack, "loaded_chain_preset");
    if (activeEffectPreset < 1 || activeEffectPreset > 8) {
      lights.fxToggle[side] = "black";
    } else {
      const colorKey = `colorFx${activeEffectPreset}`;
      if (!(colorKey in config)) {
        throw new Error("Invalid color index");
      }
      lights.fxToggle[side] = dimColorWhen(
        defaultedColor(
          config[colorKey as keyof typeof config] as string,
          config.colorTheme,
        ),
        engine.getValue(fxRack, "enabled") === 0,
      );
    }

    // Update prelisten toggle light
    lights.prelistenToggle[side] = dimColorWhen(
      defaultedColor(config.colorPrelistenToggle, config.colorTheme),
      engine.getValue(channel, "pfl") === 0,
    );

    // Update VU meter
    lights.vuLevel[side] = engine.getValue(channel, "VuMeter") * 10;

    // Update bottom LEDs
    const isBeatActive = engine.getValue(channel, "beat_active") !== 0;
    for (let i = 0; i < 6; i++) {
      const colorKey = `colorBottomLeds${i + 1}`;
      if (!(colorKey in config)) {
        throw new Error("Invalid color index");
      }
      let color = defaultedColor(
        defaultedColor(
          config[colorKey as keyof typeof config] as string,
          config.colorBottomLedsDefault,
        ),
        config.colorTheme,
      );
      if (config.blinkBottomLeds) {
        color = dimColorWhen(color, !isBeatActive);
      }
      lights.bottomLeds[side][i] = color;
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
    lights.send();
  }
};

const ensureValidBoolean = (value: engine.SettingValue | undefined) => {
  return typeof value === "boolean" ? value : undefined;
};

class TraktorZ1MK2Class {
  id: string = "";
  isDebugging = false;
  currentInput: InputMessage = InputMessage.load(NULL_INPUT);
  lights: LightsStatus = new LightsStatus();
  config: TraktorZ1MK2Config = DEFAULT_Z1_MK2_CONFIG;
  lightsTimer?: engine.TimerID;
  screens = new TraktorScreens(3);

  init(id: string, isDebugging: boolean): void {
    this.id = id;
    this.isDebugging = isDebugging;
    if (this.isDebugging) {
      console.log(`TraktorZ1Mk2 initialized with id: ${id}`);
    }

    for (const key in this.config) {
      (this.config as Record<string, unknown>)[key] =
        engine.getSetting(key) ?? (this.config as Record<string, unknown>)[key];
    }

    updateLightsFromEngine(this.lights, this.config, true);

    this.lightsTimer = engine.beginTimer(25, () => {
      updateLightsFromEngine(this.lights, this.config, false);
    });

    this.screens.screens[1].writeTextBig("Mixxx", 0, 0, 0, 0);
    this.screens.sendAll(this.isDebugging);
  }

  shutdown(): void {
    // Stop the timer to update lights
    if (this.lightsTimer) {
      engine.stopTimer(this.lightsTimer);
      this.lightsTimer = undefined;
    }

    // Turn off all the lights
    this.lights.clear();
    this.lights.send();

    // Clear all the screens
    this.screens.clearAll();
    this.screens.sendAll(this.isDebugging);
  }

  incomingData(data: Uint8Array, _length: number): void {
    let message: InputMessage;
    try {
      message = InputMessage.load(data);
    } catch (e) {
      console.warn(`Error loading input message: ${e}`);
      return;
    }
    const { lightsChanged, changeDescriptions } = updateEngineFromInput(
      message,
      this.currentInput,
      this.isDebugging,
    );
    if (lightsChanged) {
      updateLightsFromEngine(this.lights, this.config, false);
    }
    changeDescriptions.forEach((desc, i) => {
      if (desc) {
        const screen = this.screens.screens[i];
        screen.clear();
        screen.writeTextBig(desc.label, 0, 0, 0, 1);
        screen.writeTextBig(desc.value, 0, 1, 0, 0);
      }
    });
    this.screens.sendAll(this.isDebugging);
    this.currentInput = message;
  }
}

var TraktorZ1MK2 = new TraktorZ1MK2Class();

// workaround to avoid global var being automatically removed by the bundler
var keep = TraktorZ1MK2;
