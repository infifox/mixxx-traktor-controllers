import {
  colorCode,
  defaultedColor,
  dimColor,
  dimColorWhen,
} from "./TraktorColors";
import { TraktorScreen, TraktorScreens } from "./TraktorScreen";

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
 * Indicates the general group of inputs, to allow for generic access to inputs which are
 * duplicated on the left and right side of the controller.
 */
type InputChannel = "left" | "right" | "main";

/**
 * Identifies all inputs which are buttons, with a boolean pressed value.
 *
 * - *eq* - EQ mode switch button for a side
 * - *stems* - Stems mode switch button for a side
 * - *menu* - Decks toggle switch button
 * - *fxToggle* - FX toggle button for a side
 * - *fx1* - FX switch button 1
 * - *fx2* - FX switch button 2
 * - *fx3* - FX switch button 3
 * - *fx4* - FX switch button 4
 * - *fx5* - FX switch "filter" button
 * - *prelisten* - Prelisten toggle button for a side
 */
type ButtonInputName =
  | "eq"
  | "stems"
  | "menu"
  | "fxToggle"
  | "fx1"
  | "fx2"
  | "fx3"
  | "fx4"
  | "fx5"
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
type NumberInputName =
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

  getButtonValue(channel: InputChannel, name: ButtonInputName): boolean {
    switch (channel) {
      case "main":
        switch (name) {
          case "menu":
            return !!(this.data[1] & 0x04);
          case "fx1":
            return !!(this.data[1] & 0x80);
          case "fx2":
            return !!(this.data[2] & 0x01);
          case "fx3":
            return !!(this.data[2] & 0x02);
          case "fx4":
            return !!(this.data[2] & 0x04);
          case "fx5":
            return !!(this.data[2] & 0x08);
        }
      case "left":
        switch (name) {
          case "eq":
            return !!(this.data[1] & 0x01);
          case "stems":
            return !!(this.data[1] & 0x02);
          case "fxToggle":
            return !!(this.data[1] & 0x20);
          case "prelisten":
            return !!(this.data[2] & 0x10);
          default:
        }
      case "right":
        switch (name) {
          case "eq":
            return !!(this.data[1] & 0x08);
          case "stems":
            return !!(this.data[1] & 0x10);
          case "fxToggle":
            return !!(this.data[1] & 0x40);
          case "prelisten":
            return !!(this.data[2] & 0x20);
        }
    }

    throw new Error(`Invalid button -- ${channel}:${name}`);
  }

  getNumberValue(channel: InputChannel, name: NumberInputName): number {
    switch (channel) {
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

    throw new Error(`Invalid input -- ${channel}:${name}`);
  }
}

/**
 * Provides a description of a change to input, to be displayed on
 * a screen.
 */
type ChangeDescription = {
  channel: InputChannel;
  label: string;
  value: string;
};

/** Provides helper methods to deal with changes to input. */
class InputChange {
  oldMessage: InputMessage;
  newMessage: InputMessage;
  changeDescription?: ChangeDescription;

  constructor(oldMessage: InputMessage, newMessage: InputMessage) {
    this.oldMessage = oldMessage;
    this.newMessage = newMessage;
  }

  private wasButtonPressed(
    channel: InputChannel,
    name: ButtonInputName,
  ): boolean {
    const oldValue = this.oldMessage.getButtonValue(channel, name);
    const newValue = this.newMessage.getButtonValue(channel, name);
    return newValue && !oldValue;
  }

  private handleBooleanToggle({
    channel,
    name,
    engineGroup,
    engineName,
  }: {
    channel: InputChannel;
    name: ButtonInputName;
    engineGroup: string;
    engineName: string;
  }) {
    if (this.wasButtonPressed(channel, name)) {
      const value = engine.getValue(engineGroup, engineName);
      engine.setValue(engineGroup, engineName, value === 0 ? 1 : 0);
    }
  }

  private handleValueChange({
    channel,
    name,
    label,
    engineGroup,
    engineName,
    scale,
  }: {
    channel: InputChannel;
    name: NumberInputName;
    label?: string;
    engineGroup: string;
    engineName: string;
    scale: "flat" | "gain" | "crossfader";
  }) {
    const oldValue = this.oldMessage.getNumberValue(channel, name);
    const newValue = this.newMessage.getNumberValue(channel, name);
    if (!this.oldMessage.isNull() && oldValue !== newValue) {
      let scaledValue;
      switch (scale) {
        case "flat":
          scaledValue = newValue;
          break;
        case "gain":
          /**
           * Scales a value from 0-1 into a value from 0-4, for use as a gain value. Values < 0.5 are
           * linearly mapped to 0-1, and 0.5-1 are mapped to 1-4. */
          if (newValue < 0.5) {
            scaledValue = newValue * 2;
          } else {
            scaledValue = (newValue - 0.5) * 6 + 1;
          }
          break;
        case "crossfader":
          /** Scales a value from 0-1 into a value from -1-1 for use as a crossfader value. */
          scaledValue = newValue * 2 - 1;
          break;
      }

      engine.setValue(engineGroup, engineName, scaledValue);

      if (label) {
        this.changeDescription = {
          channel,
          label,
          value: `${Math.round(newValue * 100)}%`,
        };
      }
    }
  }

  updateEngine() {
    // Handle center knobs and sliders
    this.handleValueChange({
      channel: "main",
      name: "main",
      label: "Main",
      engineGroup: "[Master]",
      engineName: "gain",
      scale: "gain",
    });
    this.handleValueChange({
      channel: "main",
      name: "hpmix",
      label: "Hp Mix",
      engineGroup: "[Master]",
      engineName: "headMix",
      scale: "crossfader",
    });
    this.handleValueChange({
      channel: "main",
      name: "hpvol",
      label: "Hp Vol",
      engineGroup: "[Master]",
      engineName: "headGain",
      scale: "gain",
    });
    this.handleValueChange({
      channel: "main",
      name: "crossfader",
      label: "Xfade",
      engineGroup: "[Master]",
      engineName: "crossfader",
      scale: "crossfader",
    });

    // Handle changes for each side
    for (const { channel: engineGroup, side: channel } of mappings) {
      const eqRack = `[EqualizerRack1_${engineGroup}_Effect1]`;
      const fxRack = `[QuickEffectRack1_${engineGroup}]`;

      // Set side knob and fader values
      this.handleValueChange({
        channel,
        name: "gain",
        label: "Gain",
        engineGroup,
        engineName: "pregain",
        scale: "gain",
      });
      this.handleValueChange({
        channel,
        name: "hi",
        label: "Hi",
        engineGroup: eqRack,
        engineName: "parameter3",
        scale: "gain",
      });
      this.handleValueChange({
        channel,
        name: "mid",
        label: "Mid",
        engineGroup: eqRack,
        engineName: "parameter2",
        scale: "gain",
      });
      this.handleValueChange({
        channel,
        name: "low",
        label: "Low",
        engineGroup: eqRack,
        engineName: "parameter1",
        scale: "gain",
      });
      this.handleValueChange({
        channel,
        name: "fx",
        label: "FX",
        engineGroup: fxRack,
        engineName: "super1",
        scale: "gain",
      });
      this.handleValueChange({
        channel,
        name: "fader",
        label: "Volume",
        engineGroup,
        engineName: "volume",
        scale: "flat",
      });

      // Handle toggle FX
      this.handleBooleanToggle({
        channel,
        name: "fxToggle",
        engineGroup: fxRack,
        engineName: "enabled",
      });

      // Handle toggle prelisten
      this.handleBooleanToggle({
        channel,
        name: "prelisten",
        engineGroup,
        engineName: "pfl",
      });

      // Handle FX switch buttons
      for (let n = 1; n <= 5; n++) {
        if (this.wasButtonPressed("main", `fx${n}` as ButtonInputName)) {
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
                engine.setValue(
                  fxRack,
                  "super1",
                  this.newMessage.getNumberValue(channel, "fx"),
                );
              },
              true,
            );

            this.changeDescription = {
              channel: "main",
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
  }
}

type Side = "left" | "right";

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
        DEFAULT_Z1_MK2_CONFIG[colorKey as keyof typeof config] as string,
      ),
      !activeEffectPresets.has(n),
    );
  }
  lights.fxFilterSwitch = dimColorWhen(
    defaultedColor(config.colorFx5, DEFAULT_Z1_MK2_CONFIG.colorFx5),
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
          DEFAULT_Z1_MK2_CONFIG[colorKey as keyof typeof config] as string,
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

class TraktorZ1MK2Class {
  id: string = "";
  isDebugging = false;
  oldMessage: InputMessage = InputMessage.load(NULL_INPUT);
  lights: LightsStatus = new LightsStatus();
  config: TraktorZ1MK2Config = Object.assign({}, DEFAULT_Z1_MK2_CONFIG);
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

  private getScreenForChannel(channel: InputChannel): TraktorScreen {
    switch (channel) {
      case "left":
        return this.screens.screens[0];
      case "main":
        return this.screens.screens[1];
      case "right":
        return this.screens.screens[2];
      default:
        throw new Error(`Unknown channel: ${channel}`);
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
    const change = new InputChange(this.oldMessage, message);
    change.updateEngine();
    if (change.changeDescription) {
      const screen = this.getScreenForChannel(change.changeDescription.channel);
      screen.clear();
      screen.writeTextBig(change.changeDescription.label, 0, 0, 0, 1);
      screen.writeTextBig(change.changeDescription.value, 0, 1, 0, 0);
      this.screens.sendAll(this.isDebugging);
    }
    this.oldMessage = message;
  }
}

var TraktorZ1MK2 = new TraktorZ1MK2Class();

// workaround to avoid global var being automatically removed by the bundler
var keep = TraktorZ1MK2;
