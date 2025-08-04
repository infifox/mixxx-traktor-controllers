import {
  colorCode,
  defaultedColor,
  dimColor,
  dimColorWhen,
} from "./TraktorColors";
import { TraktorScreen, TraktorScreens } from "./TraktorScreen";
import {
  Controller,
  ControllerButtonName,
  ControllerColoredLightName,
  ControllerGroup,
  ControllerKnobName,
} from "./Z1MK2Controller";

type ButtonAction =
  | "shift"
  | "toggleDecks"
  | "toggleEqStem"
  | "toggleRecording"
  | "toggleLive"
  | "fx1"
  | "fx2"
  | "fx3"
  | "fx4"
  | "fx5"
  | "fx6"
  | "fx7"
  | "fx8"
  | "selectEqMode"
  | "selectStemMode"
  | "selectDeckAC"
  | "selectDeckBD"
  | "toggleFx"
  | "togglePrelisten"
  | "play"
  | "sync"
  | "cue"
  | "skipToStart"
  | "nudgeLeft"
  | "nudgeRight"
  | "disabled";

type TraktorZ1MK2Config = {
  fxButton1Push: ButtonAction;
  fxButton1ShiftPush: ButtonAction;
  fxButton2Push: ButtonAction;
  fxButton2ShiftPush: ButtonAction;
  fxButton3Push: ButtonAction;
  fxButton3ShiftPush: ButtonAction;
  fxButton4Push: ButtonAction;
  fxButton4ShiftPush: ButtonAction;
  filterButtonPush: ButtonAction;
  eqModeButtonPush: ButtonAction;
  eqModeButtonShiftPush: ButtonAction;
  stemModeButtonPush: ButtonAction;
  stemModeButtonShiftPush: ButtonAction;
  topButtonPush: ButtonAction;
  fxTogglePush: ButtonAction;
  fxToggleShiftPush: ButtonAction;
  prelistenTogglePush: ButtonAction;
  prelistenToggleShiftPush: ButtonAction;

  disableCrossfader: boolean;

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
  fxButton1Push: "fx1",
  fxButton1ShiftPush: "fx1",
  fxButton2Push: "fx2",
  fxButton2ShiftPush: "fx2",
  fxButton3Push: "fx3",
  fxButton3ShiftPush: "fx3",
  fxButton4Push: "fx4",
  fxButton4ShiftPush: "fx4",
  filterButtonPush: "fx5",
  eqModeButtonPush: "selectEqMode",
  eqModeButtonShiftPush: "selectEqMode",
  stemModeButtonPush: "selectStemMode",
  stemModeButtonShiftPush: "selectStemMode",
  topButtonPush: "toggleDecks",
  fxTogglePush: "toggleFx",
  fxToggleShiftPush: "toggleFx",
  prelistenTogglePush: "togglePrelisten",
  prelistenToggleShiftPush: "togglePrelisten",

  disableCrossfader: false,

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
  colorFx8: "purple",
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

type ControllerState = {
  shift: boolean;
  decksToggle: {
    left: boolean;
    right: boolean;
  };
  stemToggle: {
    left: boolean;
    right: boolean;
  };
};

/**
 * Stores display status for a screen.
 */
type ScreenStatus =
  | {
      kind: "home";
    }
  | {
      kind: "value";
      label: string;
      value: string;
    }
  | {
      kind: "softTakeover";
      value: string;
      target: string;
    };

type Side = "left" | "right";

class TraktorZ1MK2Class {
  id: string = "";
  isDebugging = false;
  config: TraktorZ1MK2Config = Object.assign({}, DEFAULT_Z1_MK2_CONFIG);
  lightsTimer?: engine.TimerID;
  screens = new TraktorScreens(3);

  controller = new Controller();
  controllerState: ControllerState = {
    shift: false,
    decksToggle: {
      left: false,
      right: false,
    },
    stemToggle: {
      left: false,
      right: false,
    },
  };
  screenStatuses: Record<ControllerGroup, ScreenStatus> = {
    left: { kind: "home" },
    main: { kind: "home" },
    right: { kind: "home" },
  };

  public init(id: string, isDebugging: boolean): void {
    this.id = id;
    this.isDebugging = isDebugging;
    if (this.isDebugging) {
      console.log(`TraktorZ1Mk2 initialized with id: ${id}`);
    }

    for (const key in this.config) {
      (this.config as Record<string, unknown>)[key] =
        engine.getSetting(key) ?? (this.config as Record<string, unknown>)[key];
    }

    this.syncLights();
    this.lightsTimer = engine.beginTimer(25, () => {
      this.syncLights();
    });

    this.screens.screens[1].writeTextBig("Mixxx", 0, 0, 0, 0);
    this.screens.sendAll(this.isDebugging);
  }

  public incomingData(data: Uint8Array, _length: number): void {
    this.controller.processInput(data);
    this.handleInput();
    this.syncLights();
  }

  public shutdown(): void {
    // Stop the timer to update lights
    if (this.lightsTimer) {
      engine.stopTimer(this.lightsTimer);
      this.lightsTimer = undefined;
    }

    // Turn off all the lights
    this.controller.lights.clear();
    this.controller.lights.send();

    // Clear all the screens
    this.screens.clearAll();
    this.screens.sendAll(this.isDebugging);
  }

  /** Toggles the value of an engine boolean. */
  private toggleEngineBoolean(group: string, name: string) {
    const value = engine.getValue(group, name);
    engine.setValue(group, name, value === 0 ? 1 : 0);
  }

  /**
   * Scales a controller value between 0-1 into an engine value using the
   * specified algorithm.
   */
  private scaleValue(
    value: number,
    scale: "flat" | "gain" | "crossfader",
  ): number {
    switch (scale) {
      case "flat":
        return value;
      case "gain":
        /**
         * Scales a value from 0-1 into a value from 0-4, for use as a gain value. Values < 0.5 are
         * linearly mapped to 0-1, and 0.5-1 are mapped to 1-4. */
        if (value < 0.5) {
          return value * 2;
        } else {
          return (value - 0.5) * 6 + 1;
        }
      case "crossfader":
        /** Scales a value from 0-1 into a value from -1-1 for use as a crossfader value. */
        return value * 2 - 1;
    }
  }

  /** Formats a numerical value for display on a screen */
  private formatValueForScreen(
    value: number,
    format: "signed" | "unsigned",
  ): string {
    switch (format) {
      case "signed": {
        const scaled = Math.round(Math.abs(value - 0.5) * 100);
        return value < 0.5 ? `-${scaled}` : `${scaled}`;
      }
      case "unsigned":
        return `${Math.round(value * 100)}%`;
    }
  }

  private syncKnobToEngine({
    controllerGroup,
    controllerKnobName,
    engineGroup,
    engineName,
    label,
    format,
    scale,
  }: {
    controllerGroup: ControllerGroup;
    controllerKnobName: ControllerKnobName;
    engineGroup: string;
    engineName: string;
    label?: string;
    format: "signed" | "unsigned";
    scale: "flat" | "gain" | "crossfader";
  }) {
    const value = this.controller.getKnobIfChanged(
      controllerGroup,
      controllerKnobName,
    );

    if (value === undefined) return;

    const scaledValue = this.scaleValue(value, scale);

    engine.setValue(engineGroup, engineName, scaledValue);

    if (this.isDebugging) {
      console.debug(
        `Synced knob ${controllerGroup}.${controllerKnobName} with value ${value} to engine ${engineGroup}.${engineName} value ${scaledValue}`,
      );
    }

    if (label) {
      this.screenStatuses[controllerGroup] = {
        kind: "value",
        label,
        value: this.formatValueForScreen(value, format),
      };
    }
  }

  /** Gets the engine group which currently corresponds to a controller group. */
  getEngineGroup(group: ControllerGroup): string {
    switch (group) {
      case "main":
        return "[Master]";
      case "left":
        return this.controllerState.decksToggle.left
          ? "[Channel3]"
          : "[Channel1]";
      case "right":
        return this.controllerState.decksToggle.right
          ? "[Channel4]"
          : "[Channel2]";
    }
  }

  /**
   * Gets the current engine group for the quick effects rack which currently
   * corresponds to a controller group.
   */
  getFxRackGroup(group: ControllerGroup) {
    return `[QuickEffectRack1_${this.getEngineGroup(group)}]`;
  }

  private switchFx(fx: number) {
    const numChainPresets = engine.getValue(
      this.getFxRackGroup("left"),
      "num_chain_presets",
    );
    if (fx >= numChainPresets) {
      console.warn(
        `Attempt to load quick effect chain preset ${fx}/${numChainPresets}, but no such preset exists`,
      );
      return;
    }

    if (this.isDebugging) {
      console.debug(`Loading quick FX chain preset ${fx}/${numChainPresets}`);
    }
    for (const channel of [
      "[Channel1]",
      "[Channel2]",
      "[Channel3]",
      "[Channel4]",
    ]) {
      engine.setValue(
        `[QuickEffectRack1_${channel}]`,
        "loaded_chain_preset",
        fx,
      );
    }

    // Workaround for FX super value being lost when preset switched
    engine.beginTimer(
      1,
      () => {
        for (const group of ["left" as const, "right" as const]) {
          engine.setValue(
            this.getFxRackGroup(group),
            "super1",
            this.scaleValue(
              this.controller.currentMessage.getKnobValue(group, "fx"),
              "flat",
            ),
          );
        }
      },
      true,
    );
  }

  private handleButtonDown({
    group,
    name,
    action,
  }: {
    group: ControllerGroup;
    name: ControllerButtonName;
    action: ButtonAction;
  }) {
    if (!this.controller.wasButtonPressed(group, name)) {
      return;
    }

    switch (group) {
      case "main":
        switch (action) {
          case "shift":
            this.controllerState.shift = true;
            break;
          case "toggleDecks": {
            const newValue =
              !this.controllerState.decksToggle.left &&
              !this.controllerState.decksToggle.right;
            this.controllerState.decksToggle.left = newValue;
            this.controllerState.decksToggle.right = newValue;
            break;
          }
          case "toggleEqStem": {
            const newValue =
              !this.controllerState.stemToggle.left &&
              !this.controllerState.stemToggle.right;
            this.controllerState.stemToggle.left = newValue;
            this.controllerState.stemToggle.right = newValue;
            break;
          }
          case "toggleRecording":
            engine.setValue("[Recording]", "toggle_recording", 1);
            break;
          case "toggleLive":
            this.toggleEngineBoolean("[Shoutcast]", "enabled");
            break;
          case "fx1":
            this.switchFx(1);
            break;
          case "fx2":
            this.switchFx(2);
            break;
          case "fx3":
            this.switchFx(3);
            break;
          case "fx4":
            this.switchFx(4);
            break;
          case "fx5":
            this.switchFx(5);
            break;
          case "fx6":
            this.switchFx(6);
            break;
          case "fx7":
            this.switchFx(7);
            break;
          case "fx8":
            this.switchFx(8);
            break;
          case "disabled":
            break;
          default:
            if (this.isDebugging) {
              console.warn(
                `No button down action for ${group} group: ${action}`,
              );
            }
        }
      case "left":
      case "right":
        switch (action) {
          case "selectEqMode":
            this.controllerState.stemToggle[group as "left" | "right"] = false;
            break;
          case "selectStemMode":
            this.controllerState.stemToggle[group as "left" | "right"] = true;
            break;
          case "selectDeckAC":
            this.controllerState.decksToggle[group as "left" | "right"] = false;
            break;
          case "selectDeckBD":
            this.controllerState.decksToggle[group as "left" | "right"] = true;
            break;
          case "toggleFx":
            this.toggleEngineBoolean(this.getFxRackGroup(group), "enabled");
            break;
          case "togglePrelisten":
            this.toggleEngineBoolean(this.getEngineGroup(group), "pfl");
            break;
          case "play":
            this.toggleEngineBoolean(this.getEngineGroup(group), "play");
            break;
          case "sync":
            this.toggleEngineBoolean(
              this.getEngineGroup(group),
              "sync_enabled",
            );
            break;
          case "cue":
            engine.setValue(this.getEngineGroup(group), "cue_default", 1);
            break;
          case "skipToStart":
            engine.setValue(this.getEngineGroup(group), "start", 1);
            break;
          case "nudgeLeft":
            engine.setValue(this.getEngineGroup(group), "beatjump_backward", 1);
            break;
          case "nudgeRight":
            engine.setValue(this.getEngineGroup(group), "beatjump_forward", 1);
            break;
          case "disabled":
            break;
          default:
            if (this.isDebugging) {
              console.warn(
                `No button down action for ${group} group: ${action}`,
              );
            }
        }
        break;
      default:
        throw new Error(`Invalid group name ${group}`);
    }
  }

  private handleButtonUp({
    group,
    name,
    action,
  }: {
    group: ControllerGroup;
    name: ControllerButtonName;
    action: ButtonAction;
  }) {
    if (!this.controller.wasButtonReleased(group, name)) {
      return;
    }

    switch (group) {
      case "main":
        switch (action) {
          case "shift":
            this.controllerState.shift = false;
            break;
          case "toggleRecording":
            engine.setValue("[Recording]", "toggle_recording", 0);
            break;
          case "disabled":
            break;
          default:
            if (this.isDebugging) {
              console.debug(
                `No button up action for ${group} group: ${action}`,
              );
            }
        }
      case "left":
      case "right":
        switch (action) {
          case "cue":
            engine.setValue(this.getEngineGroup(group), "cue_default", 0);
            break;
          case "skipToStart":
            engine.setValue(this.getEngineGroup(group), "start", 0);
            break;
          case "nudgeLeft":
            engine.setValue(this.getEngineGroup(group), "beatjump_backward", 0);
            break;
          case "nudgeRight":
            engine.setValue(this.getEngineGroup(group), "beatjump_forward", 0);
            break;
          case "disabled":
            break;
          default:
            if (this.isDebugging) {
              console.warn(`No button up action for ${group} group: ${action}`);
            }
        }
        break;
      default:
        throw new Error(`Invalid group name ${group}`);
    }
  }

  private handleButton({
    group,
    name,
    action,
  }: {
    group: ControllerGroup;
    name: ControllerButtonName;
    action: ButtonAction;
  }) {
    this.handleButtonDown({ group, name, action });
    this.handleButtonUp({ group, name, action });
  }

  /** Handles changes to input. */
  private handleInput() {
    // Handle center knobs and sliders
    this.syncKnobToEngine({
      controllerGroup: "main",
      controllerKnobName: "main",
      label: "Main",
      engineGroup: "[Master]",
      engineName: "gain",
      scale: "gain",
      format: "unsigned",
    });
    this.syncKnobToEngine({
      controllerGroup: "main",
      controllerKnobName: "hpmix",
      label: "Hp Mix",
      engineGroup: "[Master]",
      engineName: "headMix",
      scale: "crossfader",
      format: "signed",
    });
    this.syncKnobToEngine({
      controllerGroup: "main",
      controllerKnobName: "hpvol",
      label: "Hp Vol",
      engineGroup: "[Master]",
      engineName: "headGain",
      scale: "gain",
      format: "unsigned",
    });
    if (!this.config.disableCrossfader) {
      this.syncKnobToEngine({
        controllerGroup: "main",
        controllerKnobName: "crossfader",
        label: "Xfade",
        engineGroup: "[Master]",
        engineName: "crossfader",
        scale: "crossfader",
        format: "signed",
      });
    }

    // Handle changes for each side
    for (const controllerGroup of ["left" as const, "right" as const]) {
      const engineGroup = this.getEngineGroup(controllerGroup);
      const eqRackGroup = `[EqualizerRack1_${engineGroup}_Effect1]`;
      const fxRackGroup = this.getFxRackGroup(controllerGroup);

      // Sync EQ or Stem knobs
      if (this.controllerState.stemToggle[controllerGroup]) {
      } else {
        this.syncKnobToEngine({
          controllerGroup,
          controllerKnobName: "gain",
          label: "Gain",
          engineGroup,
          engineName: "pregain",
          scale: "gain",
          format: "unsigned",
        });
        this.syncKnobToEngine({
          controllerGroup,
          controllerKnobName: "hi",
          label: "Hi",
          engineGroup: eqRackGroup,
          engineName: "parameter3",
          scale: "gain",
          format: "signed",
        });
        this.syncKnobToEngine({
          controllerGroup,
          controllerKnobName: "mid",
          label: "Mid",
          engineGroup: eqRackGroup,
          engineName: "parameter2",
          scale: "gain",
          format: "signed",
        });
        this.syncKnobToEngine({
          controllerGroup,
          controllerKnobName: "low",
          label: "Low",
          engineGroup: eqRackGroup,
          engineName: "parameter1",
          scale: "gain",
          format: "signed",
        });
      }

      // Sync fx and fader knobs
      this.syncKnobToEngine({
        controllerGroup,
        controllerKnobName: "fx",
        label: "FX",
        engineGroup: fxRackGroup,
        engineName: "super1",
        scale: "flat",
        format: "signed",
      });
      this.syncKnobToEngine({
        controllerGroup,
        controllerKnobName: "fader",
        label: "Volume",
        engineGroup,
        engineName: "volume",
        scale: "flat",
        format: "unsigned",
      });
    }

    const { shift } = this.controllerState;

    // Handle main group buttons
    this.handleButton({
      group: "main",
      name: "top",
      action: this.config.topButtonPush,
    });
    this.handleButton({
      group: "main",
      name: "fxFilter",
      action: this.config.filterButtonPush,
    });
    this.handleButton({
      group: "main",
      name: "fx1",
      action: shift
        ? this.config.fxButton1ShiftPush
        : this.config.fxButton1Push,
    });
    this.handleButton({
      group: "main",
      name: "fx2",
      action: shift
        ? this.config.fxButton2ShiftPush
        : this.config.fxButton2Push,
    });
    this.handleButton({
      group: "main",
      name: "fx3",
      action: shift
        ? this.config.fxButton3ShiftPush
        : this.config.fxButton3Push,
    });
    this.handleButton({
      group: "main",
      name: "fx4",
      action: shift
        ? this.config.fxButton4ShiftPush
        : this.config.fxButton4Push,
    });

    // Handle side group buttons
    for (const group of ["left" as const, "right" as const]) {
      this.handleButton({
        group,
        name: "eqMode",
        action: shift
          ? this.config.eqModeButtonShiftPush
          : this.config.eqModeButtonPush,
      });
      this.handleButton({
        group,
        name: "stemMode",
        action: shift
          ? this.config.stemModeButtonShiftPush
          : this.config.stemModeButtonPush,
      });
      this.handleButton({
        group,
        name: "fxToggle",
        action: shift
          ? this.config.fxToggleShiftPush
          : this.config.fxTogglePush,
      });
      this.handleButton({
        group,
        name: "prelisten",
        action: shift
          ? this.config.prelistenToggleShiftPush
          : this.config.prelistenTogglePush,
      });
    }
  }

  /**
   * For actions with an associated color, gets the light color for
   * that action. Otherwise, uses the provided theme color, dimming it
   * if appropriate.
   */
  private getActionLightColor(
    group: ControllerGroup,
    action: ButtonAction,
    defaultColor: string,
  ): string {
    switch (action) {
      case "shift":
        return dimColorWhen(
          defaultedColor(
            this.config.colorTheme,
            DEFAULT_Z1_MK2_CONFIG.colorTheme,
          ),
          !this.controllerState.shift,
        );
      case "fx1":
      case "fx2":
      case "fx3":
      case "fx4":
      case "fx5":
      case "fx6":
      case "fx7":
      case "fx8": {
        const n = Number(action[2]);
        const colorKey = `colorFx${n}` as keyof TraktorZ1MK2Config;

        return dimColorWhen(
          defaultedColor(
            this.config[colorKey] as string,
            DEFAULT_Z1_MK2_CONFIG[colorKey] as string,
          ),
          engine.getValue(
            this.getFxRackGroup("left"),
            "loaded_chain_preset",
          ) !== n,
        );
      }
      case "selectEqMode":
        return dimColorWhen(
          defaultColor,
          this.controllerState.stemToggle[group as "left" | "right"] ?? false,
        );
      case "selectStemMode":
        return dimColorWhen(
          defaultColor,
          !(
            this.controllerState.stemToggle[group as "left" | "right"] ?? false
          ),
        );
      case "selectDeckAC":
        return dimColorWhen(
          defaultColor,
          this.controllerState.decksToggle[group as "left" | "right"] ?? false,
        );
      case "selectDeckBD":
        return dimColorWhen(
          defaultColor,
          !(
            this.controllerState.decksToggle[group as "left" | "right"] ?? false
          ),
        );
      case "toggleFx": {
        const value = engine.getValue(
          this.getFxRackGroup(group),
          "loaded_chain_preset",
        );
        let color = defaultColor;
        if (value >= 1 && value <= 8) {
          const colorKey = `colorFx${value}` as keyof TraktorZ1MK2Config;
          color = defaultedColor(
            this.config[colorKey] as string,
            DEFAULT_Z1_MK2_CONFIG[colorKey] as string,
          );
        }
        return dimColorWhen(
          color,
          engine.getValue(this.getFxRackGroup(group), "enabled") === 0,
        );
      }
      case "togglePrelisten":
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "pfl") === 0,
        );

      case "play":
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "play") === 0,
        );
      case "sync":
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "sync_enabled") === 0,
        );
      case "cue":
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "cue_default") === 0,
        );
      case "skipToStart":
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "start") === 0,
        );
      case "nudgeLeft":
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "beatjump_backward") ===
            0,
        );
      case "nudgeRight":
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "beatjump_forward") === 0,
        );
      case "disabled":
        return dimColor(defaultColor);
      default:
        return defaultColor;
    }
  }

  private updateButtonLight(
    group: ControllerGroup,
    name: ControllerColoredLightName,
    action: ButtonAction,
    configColor: string,
  ) {
    let color = defaultedColor(
      defaultedColor(configColor, this.config.colorTheme),
      DEFAULT_Z1_MK2_CONFIG.colorTheme,
    );
    color = this.getActionLightColor(group, action, color);
    this.controller.lights.setColoredLight(group, name, color);
  }

  /** Syncs data from the engine to the lights. */
  private syncLights() {
    const { shift } = this.controllerState;

    for (let n = 1; n <= 4; n++) {
      this.updateButtonLight(
        "main",
        `fx${n}` as ControllerColoredLightName,
        shift
          ? (this.config[
              `fxButton${n}ShiftPush` as keyof TraktorZ1MK2Config
            ] as ButtonAction)
          : (this.config[
              `fxButton${n}Push` as keyof TraktorZ1MK2Config
            ] as ButtonAction),
        this.config[`colorFx${n}` as keyof TraktorZ1MK2Config] as string,
      );
    }
    this.updateButtonLight(
      "main",
      "fxFilter",
      this.config.filterButtonPush,
      this.config.colorFx5,
    );

    for (const group of ["left" as const, "right" as const]) {
      // Update buttons
      this.updateButtonLight(
        group,
        "eqModeSwitch",
        shift
          ? this.config.eqModeButtonShiftPush
          : this.config.eqModeButtonPush,
        this.config.colorEqSwitch,
      );
      this.updateButtonLight(
        group,
        "stemModeSwitch",
        shift
          ? this.config.stemModeButtonShiftPush
          : this.config.stemModeButtonPush,
        this.config.colorStemsSwitch,
      );
      this.updateButtonLight(
        group,
        "fxToggle",
        shift ? this.config.fxToggleShiftPush : this.config.fxTogglePush,
        defaultedColor(
          this.config.colorTheme,
          DEFAULT_Z1_MK2_CONFIG.colorTheme,
        ),
      );
      this.updateButtonLight(
        group,
        "prelisten",
        shift
          ? this.config.prelistenToggleShiftPush
          : this.config.prelistenTogglePush,
        this.config.colorPrelistenToggle,
      );

      // Update VU meter
      this.controller.lights.setVuValue(
        group,
        engine.getValue(this.getEngineGroup(group), "VuMeter") * 10,
      );

      // Update bottom LEDs
      const isBeatActive =
        engine.getValue(this.getEngineGroup(group), "beat_active") !== 0;
      for (let n = 1; n <= 6; n++) {
        const colorKey = `colorBottomLeds${n}`;
        if (!(colorKey in this.config)) {
          throw new Error("Invalid color index");
        }
        let color = defaultedColor(
          defaultedColor(
            defaultedColor(
              this.config[colorKey as keyof TraktorZ1MK2Config] as string,
              this.config.colorBottomLedsDefault,
            ),
            this.config.colorTheme,
          ),
          DEFAULT_Z1_MK2_CONFIG.colorTheme,
        );
        if (this.config.blinkBottomLeds) {
          color = dimColorWhen(color, !isBeatActive);
        }
        this.controller.lights.setColoredLight(
          group,
          `bottomLed${n}` as ControllerColoredLightName,
          color,
        );
      }
    }
    this.controller.lights.send();
  }
}

var TraktorZ1MK2 = new TraktorZ1MK2Class();

// workaround to avoid global var being automatically removed by the bundler
var keep = TraktorZ1MK2;
