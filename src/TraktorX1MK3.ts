import { defaultedColor, dimColor, dimColorWhen } from "./TraktorColors";
import { TraktorScreen } from "./TraktorScreen";
import {
  Controller,
  ControllerButtonName,
  ControllerColoredLightName,
  ControllerGroup,
  ControllerKnobName,
} from "./X1MK3Controller";

const SCREEN_RESET_MS = 800;
const SOFT_TAKEOVER_MARGIN = 0.05;
const MIN_BEATLOOP = 0.03125;
const MAX_BEATLOOP = 512;

enum ButtonAction {
  Disabled = "Disabled",
  Inherit = "Inherit",
  Shift = "Shift",
  Super = "Super",
  ToggleDecks = "ToggleDecks",
  AssignDeckAC = "AssignDeckAC",
  AssignDeckBD = "AssignDeckBD",
  AssignDeckA = "AssignDeckA",
  AssignDeckB = "AssignDeckB",
  AssignDeckC = "AssignDeckC",
  AssignDeckD = "AssignDeckD",
  ToggleFx1 = "ToggleFx1",
  ToggleFx2 = "ToggleFx2",
  ToggleFx3 = "ToggleFx3",
  LoadTrack = "LoadTrack",
  ToggleLoop = "ToggleLoop",
  ToggleLoop4 = "ToggleLoop4",
  LoopDown = "LoopDown",
  LoopUp = "LoopUp",
  Hotcue1 = "Hotcue1",
  Hotcue2 = "Hotcue2",
  Hotcue3 = "Hotcue3",
  Hotcue4 = "Hotcue4",
  Hotcue5 = "Hotcue5",
  Hotcue6 = "Hotcue6",
  Hotcue7 = "Hotcue7",
  Hotcue8 = "Hotcue8",
  ClearHotcue1 = "ClearHotcue1",
  ClearHotcue2 = "ClearHotcue2",
  ClearHotcue3 = "ClearHotcue3",
  ClearHotcue4 = "ClearHotcue4",
  ClearHotcue5 = "ClearHotcue5",
  ClearHotcue6 = "ClearHotcue6",
  ClearHotcue7 = "ClearHotcue7",
  ClearHotcue8 = "ClearHotcue8",
  BeatjumpLeft1 = "BeatjumpLeft1",
  BeatjumpLeft2 = "BeatjumpLeft2",
  BeatjumpLeft4 = "BeatjumpLeft4",
  BeatjumpLeft8 = "BeatjumpLeft8",
  BeatjumpLeft16 = "BeatjumpLeft16",
  BeatjumpLeft32 = "BeatjumpLeft32",
  BeatjumpLeft64 = "BeatjumpLeft64",
  BeatjumpRight1 = "BeatjumpRight1",
  BeatjumpRight2 = "BeatjumpRight2",
  BeatjumpRight4 = "BeatjumpRight4",
  BeatjumpRight8 = "BeatjumpRight8",
  BeatjumpRight16 = "BeatjumpRight16",
  BeatjumpRight32 = "BeatjumpRight32",
  BeatjumpRight64 = "BeatjumpRight64",
  BeatjumpLeftByLoop = "BeatjumpLeftByLoop",
  BeatjumpRightByLoop = "BeatjumpRightByLoop",
  Cue = "Cue",
  Rev = "Rev",
  Play = "Play",
  Sync = "Sync",
  SkipToStart = "SkipToStart",
}

type ButtonAssignment = {
  push: ButtonAction;
  shiftPush: ButtonAction;
  superPush: ButtonAction;
};

type TraktorX1MK3Config = {
  top: ButtonAssignment;
  assignLeft: ButtonAssignment;
  assignRight: ButtonAssignment;
  fxToggle1: ButtonAssignment;
  fxToggle2: ButtonAssignment;
  fxToggle3: ButtonAssignment;
  fxToggle4: ButtonAssignment;
  browse: ButtonAssignment;
  loop: ButtonAssignment;
  shift: ButtonAssignment;
  hotcue1: ButtonAssignment;
  hotcue2: ButtonAssignment;
  hotcue3: ButtonAssignment;
  hotcue4: ButtonAssignment;
  nudgeLeft: ButtonAssignment;
  nudgeRight: ButtonAssignment;
  cue: ButtonAssignment;
  rev: ButtonAssignment;
  play: ButtonAssignment;
  sync: ButtonAssignment;

  colorTheme: string;
  colorBottomLedsDefault: string;
  colorEndWarning: string;
  colorActiveLoop: string;
  colorBottomLeds1: string;
  colorBottomLeds2: string;
  colorBottomLeds3: string;
  colorBottomLeds4: string;
  colorBottomLeds5: string;
  colorBottomLeds6: string;
  actionColors: Record<ButtonAction, string>;

  blinkBottomLeds: boolean;
  endWarning: boolean;
  activeLoop: boolean;
};

const assignment = ({
  push,
  shiftPush = ButtonAction.Inherit,
  superPush = ButtonAction.Inherit,
}: {
  push: ButtonAction;
  shiftPush?: ButtonAction;
  superPush?: ButtonAction;
}): ButtonAssignment => {
  return {
    push,
    shiftPush,
    superPush,
  };
};

const DEFAULT_X1_MK3_CONFIG: TraktorX1MK3Config = {
  top: assignment({ push: ButtonAction.ToggleDecks }),
  assignLeft: assignment({ push: ButtonAction.AssignDeckAC }),
  assignRight: assignment({ push: ButtonAction.AssignDeckBD }),
  fxToggle1: assignment({ push: ButtonAction.Disabled }),
  fxToggle2: assignment({ push: ButtonAction.ToggleFx1 }),
  fxToggle3: assignment({ push: ButtonAction.ToggleFx2 }),
  fxToggle4: assignment({ push: ButtonAction.ToggleFx3 }),
  browse: assignment({ push: ButtonAction.LoadTrack }),
  loop: assignment({ push: ButtonAction.ToggleLoop }),
  shift: assignment({ push: ButtonAction.Shift }),
  hotcue1: assignment({
    push: ButtonAction.Hotcue1,
    shiftPush: ButtonAction.ClearHotcue1,
  }),
  hotcue2: assignment({
    push: ButtonAction.Hotcue2,
    shiftPush: ButtonAction.ClearHotcue2,
  }),
  hotcue3: assignment({
    push: ButtonAction.Hotcue3,
    shiftPush: ButtonAction.ClearHotcue3,
  }),
  hotcue4: assignment({
    push: ButtonAction.Hotcue4,
    shiftPush: ButtonAction.ClearHotcue4,
  }),
  nudgeLeft: assignment({
    push: ButtonAction.BeatjumpLeft1,
  }),
  nudgeRight: assignment({
    push: ButtonAction.BeatjumpRight1,
  }),
  cue: assignment({
    push: ButtonAction.Cue,
  }),
  rev: assignment({
    push: ButtonAction.Rev,
  }),
  play: assignment({
    push: ButtonAction.Play,
  }),
  sync: assignment({
    push: ButtonAction.Sync,
  }),

  colorTheme: "blue",
  colorBottomLedsDefault: "default",
  colorEndWarning: "red",
  colorActiveLoop: "green",
  colorBottomLeds1: "default",
  colorBottomLeds2: "default",
  colorBottomLeds3: "default",
  colorBottomLeds4: "default",
  colorBottomLeds5: "default",
  colorBottomLeds6: "default",
  actionColors: {
    Disabled: "default",
    Inherit: "default",
    Shift: "default",
    Super: "default",
    ToggleDecks: "default",
    AssignDeckAC: "default",
    AssignDeckBD: "default",
    AssignDeckA: "default",
    AssignDeckB: "default",
    AssignDeckC: "default",
    AssignDeckD: "default",
    ToggleFx1: "default",
    ToggleFx2: "default",
    ToggleFx3: "default",
    LoadTrack: "default",
    ToggleLoop: "default",
    ToggleLoop4: "default",
    LoopDown: "default",
    LoopUp: "default",
    Hotcue1: "hotcue",
    Hotcue2: "hotcue",
    Hotcue3: "hotcue",
    Hotcue4: "hotcue",
    Hotcue5: "hotcue",
    Hotcue6: "hotcue",
    Hotcue7: "hotcue",
    Hotcue8: "hotcue",
    ClearHotcue1: "hotcue",
    ClearHotcue2: "hotcue",
    ClearHotcue3: "hotcue",
    ClearHotcue4: "hotcue",
    ClearHotcue5: "hotcue",
    ClearHotcue6: "hotcue",
    ClearHotcue7: "hotcue",
    ClearHotcue8: "hotcue",
    BeatjumpLeft1: "default",
    BeatjumpLeft2: "default",
    BeatjumpLeft4: "default",
    BeatjumpLeft8: "default",
    BeatjumpLeft16: "default",
    BeatjumpLeft32: "default",
    BeatjumpLeft64: "default",
    BeatjumpRight1: "default",
    BeatjumpRight2: "default",
    BeatjumpRight4: "default",
    BeatjumpRight8: "default",
    BeatjumpRight16: "default",
    BeatjumpRight32: "default",
    BeatjumpRight64: "default",
    BeatjumpLeftByLoop: "default",
    BeatjumpRightByLoop: "default",
    Cue: "default",
    Rev: "default",
    Play: "default",
    Sync: "default",
    SkipToStart: "default",
  },

  blinkBottomLeds: false,
  endWarning: true,
  activeLoop: true,
};

type ControllerState = {
  shift: boolean;
  super: boolean;
  decksToggle: {
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
      value: number;
      target: number;
      format: "signed" | "unsigned";
      label: string;
    };

enum Screen {
  TopLeft = "topLeft",
  Main = "main",
  TopRight = "topRight",
  BottomLeft = "bottomLeft",
  BottomRight = "bottomRight",
}

/**
 * Mappings from controller groups to the screen where values for that controller group are
 * displayed.
 */
const SCREEN_MAPPING: Record<ControllerGroup, Screen> = {
  left: Screen.TopLeft,
  main: Screen.Main,
  right: Screen.TopRight,
};

class TraktorX1MK3Class {
  /** Controller ID in Mixxx. */
  id: string = "";

  /** Are we in controller debugging mode.  */
  isDebugging = false;

  /** Configuration from Mixxx. */
  config: TraktorX1MK3Config = Object.assign({}, DEFAULT_X1_MK3_CONFIG);

  /** Timer to update the lights and animations. */
  lightsTimer?: engine.TimerID;

  /** Time offset for animations. */
  time = 0;

  /** Display screens */
  screens: Record<Screen, TraktorScreen> = {
    [Screen.TopLeft]: new TraktorScreen(0),
    [Screen.Main]: new TraktorScreen(1),
    [Screen.TopRight]: new TraktorScreen(2),
    [Screen.BottomLeft]: new TraktorScreen(3),
    [Screen.BottomRight]: new TraktorScreen(4),
  };

  /** Timers to return to the homescreen for each screen */
  screenResetTimerIds: Record<Screen, engine.TimerID | undefined> = {
    [Screen.TopLeft]: undefined,
    [Screen.Main]: undefined,
    [Screen.TopRight]: undefined,
    [Screen.BottomLeft]: undefined,
    [Screen.BottomRight]: undefined,
  };

  /** Controller abstraction. */
  controller = new Controller();

  /** Current state. */
  controllerState: ControllerState = {
    shift: false,
    super: false,
    decksToggle: {
      left: false,
      right: false,
    },
  };

  /** Current content for each screen. */
  screenStatuses: Record<Screen, ScreenStatus> = {
    [Screen.TopLeft]: { kind: "home" },
    [Screen.Main]: { kind: "home" },
    [Screen.TopRight]: { kind: "home" },
    [Screen.BottomLeft]: { kind: "home" },
    [Screen.BottomRight]: { kind: "home" },
  };

  public init(id: string, isDebugging: boolean): void {
    this.id = id;
    this.isDebugging = isDebugging;
    if (this.isDebugging) {
      console.log(`TraktorX1Mk3 initialized with id: ${id}`);
    }

    for (const key in this.config) {
      (this.config as Record<string, unknown>)[key] =
        engine.getSetting(key) ?? (this.config as Record<string, unknown>)[key];
    }

    this.syncLights();
    this.lightsTimer = engine.beginTimer(25, () => {
      this.syncLights();

      const isAnyScreenAnimated = Object.values(this.screenStatuses).some(
        (status) => status.kind === "softTakeover",
      );

      if (isAnyScreenAnimated) {
        this.time++;
        this.syncScreens();
      } else if (this.time > 0) {
        this.time = 0;
      }
    });

    this.syncScreens();
  }

  public incomingData(data: Uint8Array, _length: number): void {
    this.controller.processInput(data);
    this.handleInput();
    this.syncLights();
    this.syncScreens();
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
    for (const screen of Object.values(this.screens)) {
      screen.clear();
      screen.send(this.isDebugging);
    }
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

  /** Converts engine gain value back into a number between 0 and 1. */
  private unscaleGain(value: number): number {
    if (value < 1) {
      return value / 2;
    } else {
      return (value - 1) / 6 + 0.5;
    }
  }

  private unscaleValue(
    value: number,
    scale: "flat" | "gain" | "crossfader",
  ): number {
    switch (scale) {
      case "flat":
        return value;
      case "gain":
        return this.unscaleGain(value);
      case "crossfader":
        return (value + 1) / 2;
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
        return value > 0.5 || scaled === 0 ? `${scaled}` : `-${scaled}`;
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
    showValueScreen = false,
    softTakeover = false,
    unmapped = false,
  }: {
    controllerGroup: ControllerGroup;
    controllerKnobName: ControllerKnobName;
    engineGroup: string;
    engineName: string;
    label: string;
    format: "signed" | "unsigned";
    scale: "flat" | "gain" | "crossfader";
    showValueScreen?: boolean;
    softTakeover?: boolean;
    unmapped?: boolean;
  }) {
    const value = this.controller.getKnobIfChanged(
      controllerGroup,
      controllerKnobName,
    );

    if (value === undefined) return;

    const displayScreen = SCREEN_MAPPING[controllerGroup];

    // Check for soft takeover if enabled
    if (softTakeover) {
      const existingValue = this.unscaleValue(
        engine.getValue(engineGroup, engineName),
        scale,
      );

      if (Math.abs(existingValue - value) > SOFT_TAKEOVER_MARGIN) {
        // Value is out of range, diplay a message on the screen instead of changing it
        this.screenStatuses[displayScreen] = {
          kind: "softTakeover",
          value: value,
          target: existingValue,
          format,
          label,
        };
        this.scheduleScreenReset(displayScreen, SCREEN_RESET_MS);
        this.syncScreens();
        return;
      } else {
        if (this.screenStatuses[displayScreen]?.kind === "softTakeover") {
          this.screenStatuses[displayScreen] = { kind: "home" };
          this.syncScreens();
        }
      }
    }

    const scaledValue = this.scaleValue(value, scale);

    if (!unmapped) {
      engine.setValue(engineGroup, engineName, scaledValue);
    }

    if (this.isDebugging) {
      console.debug(
        `Synced knob ${controllerGroup}.${controllerKnobName} with value ${value} to engine ${engineGroup}.${engineName} value ${scaledValue}`,
      );
    }

    if (showValueScreen) {
      this.screenStatuses[displayScreen] = {
        kind: "value",
        label,
        value: this.formatValueForScreen(value, format),
      };
      this.scheduleScreenReset(displayScreen, SCREEN_RESET_MS);
      this.syncScreens();
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

  /** Gets the equalizer rack group which currently corresponds to a controller group. */
  getEqRackGroup(group: ControllerGroup): string {
    return `[EqualizerRack1_${this.getEngineGroup(group)}_Effect1]`;
  }

  /**
   * Gets the current engine group for the quick effects rack which currently
   * corresponds to a controller group.
   */
  getFxRackGroup(group: ControllerGroup) {
    return `[QuickEffectRack1_${this.getEngineGroup(group)}]`;
  }

  private startAction({
    group,
    action,
  }: {
    group: ControllerGroup;
    action: ButtonAction;
  }) {
    switch (group) {
      case "main":
        switch (action) {
          case ButtonAction.Shift:
            this.controllerState.shift = true;
            break;
          case ButtonAction.Super:
            this.controllerState.super = true;
            break;
          case ButtonAction.ToggleDecks: {
            const newValue =
              !this.controllerState.decksToggle.left &&
              !this.controllerState.decksToggle.right;
            this.controllerState.decksToggle.left = newValue;
            this.controllerState.decksToggle.right = newValue;
            break;
          }
          case ButtonAction.Disabled:
            break;
          default:
            if (this.isDebugging) {
              console.warn(
                `No button down action for ${group} group: ${action}`,
              );
            }
        }
        break;
      case "left":
      case "right":
        switch (action) {
          case ButtonAction.AssignDeckAC:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}`,
              this.controllerState.decksToggle.left
                ? "group_3_enable"
                : "group_1_enable",
            );
            break;
          case ButtonAction.AssignDeckBD:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}`,
              this.controllerState.decksToggle.right
                ? "group_4_enable"
                : "group_2_enable",
            );
            break;
          case ButtonAction.AssignDeckA:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}`,
              "group_1_enable",
            );
            break;
          case ButtonAction.AssignDeckB:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}`,
              "group_2_enable",
            );
            break;
          case ButtonAction.AssignDeckC:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}`,
              "group_3_enable",
            );
            break;
          case ButtonAction.AssignDeckD:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}`,
              "group_4_enable",
            );
            break;
          case ButtonAction.ToggleFx1:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}_Effect1]`,
              "enabled",
            );
            break;
          case ButtonAction.ToggleFx2:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}_Effect2]`,
              "enabled",
            );
            break;
          case ButtonAction.ToggleFx3:
            this.toggleEngineBoolean(
              `[EffectRack1_EffectUnit${group === "left" ? "1" : "2"}_Effect3]`,
              "enabled",
            );
            break;
          case ButtonAction.LoadTrack:
            engine.setValue(this.getEngineGroup(group), "LoadSelectedTrack", 1);
            break;
          case ButtonAction.ToggleLoop: {
            const loop = engine.getValue(
              this.getEngineGroup(group),
              "beatloop_size",
            );
            this.toggleEngineBoolean(
              this.getEngineGroup(group),
              `beatloop_${loop}_enabled`,
            );
            break;
          }
          case ButtonAction.ToggleLoop4: {
            this.toggleEngineBoolean(
              this.getEngineGroup(group),
              "beatloop_4_enabled",
            );
            break;
          }
          case ButtonAction.LoopDown: {
            const loop = engine.getValue(
              this.getEngineGroup(group),
              "beatloop_size",
            );
            if (loop > MIN_BEATLOOP) {
              engine.setValue(
                this.getEngineGroup(group),
                "beatloop_size",
                loop / 2,
              );
            }
            break;
          }
          case ButtonAction.LoopUp: {
            const loop = engine.getValue(
              this.getEngineGroup(group),
              "beatloop_size",
            );
            if (loop < MAX_BEATLOOP) {
              engine.setValue(
                this.getEngineGroup(group),
                "beatloop_size",
                loop * 2,
              );
            }
            break;
          }
          case ButtonAction.Hotcue1:
            engine.setValue(this.getEngineGroup(group), "hotcue_1_activate", 1);
            break;
          case ButtonAction.Hotcue2:
            engine.setValue(this.getEngineGroup(group), "hotcue_2_activate", 1);
            break;
          case ButtonAction.Hotcue3:
            engine.setValue(this.getEngineGroup(group), "hotcue_3_activate", 1);
            break;
          case ButtonAction.Hotcue4:
            engine.setValue(this.getEngineGroup(group), "hotcue_4_activate", 1);
            break;
          case ButtonAction.Hotcue5:
            engine.setValue(this.getEngineGroup(group), "hotcue_5_activate", 1);
            break;
          case ButtonAction.Hotcue6:
            engine.setValue(this.getEngineGroup(group), "hotcue_6_activate", 1);
            break;
          case ButtonAction.Hotcue7:
            engine.setValue(this.getEngineGroup(group), "hotcue_7_activate", 1);
            break;
          case ButtonAction.Hotcue8:
            engine.setValue(this.getEngineGroup(group), "hotcue_8_activate", 1);
            break;
          case ButtonAction.ClearHotcue1:
            engine.setValue(this.getEngineGroup(group), "hotcue_1_clear", 1);
            break;
          case ButtonAction.ClearHotcue2:
            engine.setValue(this.getEngineGroup(group), "hotcue_2_clear", 1);
            break;
          case ButtonAction.ClearHotcue3:
            engine.setValue(this.getEngineGroup(group), "hotcue_3_clear", 1);
            break;
          case ButtonAction.ClearHotcue4:
            engine.setValue(this.getEngineGroup(group), "hotcue_4_clear", 1);
            break;
          case ButtonAction.ClearHotcue5:
            engine.setValue(this.getEngineGroup(group), "hotcue_5_clear", 1);
            break;
          case ButtonAction.ClearHotcue6:
            engine.setValue(this.getEngineGroup(group), "hotcue_6_clear", 1);
            break;
          case ButtonAction.ClearHotcue7:
            engine.setValue(this.getEngineGroup(group), "hotcue_7_clear", 1);
            break;
          case ButtonAction.ClearHotcue8:
            engine.setValue(this.getEngineGroup(group), "hotcue_8_clear", 1);
            break;
          case ButtonAction.BeatjumpLeft1:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_1_backward",
              1,
            );
            break;
          case ButtonAction.BeatjumpLeft2:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_2_backward",
              2,
            );
            break;
          case ButtonAction.BeatjumpLeft4:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_4_backward",
              4,
            );
            break;
          case ButtonAction.BeatjumpLeft8:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_8_backward",
              8,
            );
            break;
          case ButtonAction.BeatjumpLeft16:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_16_backward",
              16,
            );
            break;
          case ButtonAction.BeatjumpLeft32:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_32_backward",
              32,
            );
            break;
          case ButtonAction.BeatjumpLeft64:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_64_backward",
              64,
            );
            break;
          case ButtonAction.BeatjumpRight1:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_1_forward",
              1,
            );
            break;
          case ButtonAction.BeatjumpRight2:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_2_forward",
              2,
            );
            break;
          case ButtonAction.BeatjumpRight4:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_4_forward",
              4,
            );
            break;
          case ButtonAction.BeatjumpRight8:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_8_forward",
              8,
            );
            break;
          case ButtonAction.BeatjumpRight16:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_16_forward",
              16,
            );
            break;
          case ButtonAction.BeatjumpRight32:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_32_forward",
              32,
            );
            break;
          case ButtonAction.BeatjumpRight64:
            engine.setValue(
              this.getEngineGroup(group),
              "beatjump_64_forward",
              64,
            );
            break;
          case ButtonAction.BeatjumpLeftByLoop: {
            const loop = engine.getValue(
              this.getEngineGroup(group),
              "beatloop_size",
            );
            engine.setValue(
              this.getEngineGroup(group),
              `beatjump_${loop}_backward`,
              1,
            );
            break;
          }
          case ButtonAction.BeatjumpRightByLoop: {
            const loop = engine.getValue(
              this.getEngineGroup(group),
              "beatloop_size",
            );
            engine.setValue(
              this.getEngineGroup(group),
              `beatjump_${loop}_forward`,
              1,
            );
            break;
          }
          case ButtonAction.Cue:
            engine.setValue(this.getEngineGroup(group), "cue_default", 1);
            break;
          case ButtonAction.Rev:
            engine.setValue(this.getEngineGroup(group), "reverse", 1);
            break;
          case ButtonAction.Play:
            this.toggleEngineBoolean(this.getEngineGroup(group), "play");
            break;
          case ButtonAction.Sync:
            this.toggleEngineBoolean(
              this.getEngineGroup(group),
              "sync_enabled",
            );
            break;
          case ButtonAction.SkipToStart:
            engine.setValue(this.getEngineGroup(group), "start", 1);
            break;
          case ButtonAction.Disabled:
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

  private stopAction({
    group,
    action,
  }: {
    group: ControllerGroup;
    action: ButtonAction;
  }) {
    switch (group) {
      case "main":
        switch (action) {
          case ButtonAction.Shift:
            this.controllerState.shift = false;
            break;
          case ButtonAction.Super:
            this.controllerState.super = false;
            break;
          case ButtonAction.Disabled:
            break;
          default:
            if (this.isDebugging) {
              console.debug(
                `No button up action for ${group} group: ${action}`,
              );
            }
        }
        break;
      case "left":
      case "right":
        switch (action) {
          case ButtonAction.Hotcue1:
            engine.setValue(this.getEngineGroup(group), "hotcue_1_activate", 0);
            break;
          case ButtonAction.Hotcue2:
            engine.setValue(this.getEngineGroup(group), "hotcue_2_activate", 0);
            break;
          case ButtonAction.Hotcue3:
            engine.setValue(this.getEngineGroup(group), "hotcue_3_activate", 0);
            break;
          case ButtonAction.Hotcue4:
            engine.setValue(this.getEngineGroup(group), "hotcue_4_activate", 0);
            break;
          case ButtonAction.Hotcue5:
            engine.setValue(this.getEngineGroup(group), "hotcue_5_activate", 0);
            break;
          case ButtonAction.Hotcue6:
            engine.setValue(this.getEngineGroup(group), "hotcue_6_activate", 0);
            break;
          case ButtonAction.Hotcue7:
            engine.setValue(this.getEngineGroup(group), "hotcue_7_activate", 0);
            break;
          case ButtonAction.Hotcue8:
            engine.setValue(this.getEngineGroup(group), "hotcue_8_activate", 0);
            break;
          case ButtonAction.Cue:
            engine.setValue(this.getEngineGroup(group), "cue_default", 0);
            break;
          case ButtonAction.Rev:
            engine.setValue(this.getEngineGroup(group), "reverse", 0);
            break;
          case ButtonAction.SkipToStart:
            engine.setValue(this.getEngineGroup(group), "start", 0);
            break;
          case ButtonAction.Disabled:
            break;
          default:
            if (this.isDebugging) {
              console.debug(
                `No button up action for ${group} group: ${action}`,
              );
            }
        }
        break;
      default:
        throw new Error(`Invalid group name ${group}`);
    }
  }

  /** Gets the current action for a button assignment. */
  private getButtonAction(assignment: ButtonAssignment): ButtonAction {
    let action: ButtonAction;
    if (this.controllerState.super) {
      action = assignment.superPush;
    } else if (this.controllerState.shift) {
      action = assignment.shiftPush;
    } else {
      action = assignment.push;
    }
    if (action === ButtonAction.Inherit) {
      action = assignment.push;
    }
    return action;
  }

  private handleButton({
    group,
    name,
    assignment,
  }: {
    group: ControllerGroup;
    name: ControllerButtonName;
    assignment: ButtonAssignment;
  }) {
    if (this.controller.wasButtonPressed(group, name)) {
      this.startAction({ group, action: this.getButtonAction(assignment) });
    }
    if (this.controller.wasButtonReleased(group, name)) {
      this.stopAction({ group, action: this.getButtonAction(assignment) });
    }
  }

  /** Handles changes to input. */
  private handleInput() {
    // Handle changes for each side
    for (const controllerGroup of ["left" as const, "right" as const]) {
      // Sync FX Knobs
      this.syncKnobToEngine({
        controllerGroup,
        controllerKnobName: "fx2",
        label: "FX1",
        engineGroup: `${controllerGroup === "left" ? "EffectRack1_EffectUnit1" : "EffectRack1_EffectUnit2"}_Effect1`,
        engineName: "meta",
        scale: "gain",
        format: "unsigned",
        softTakeover: true,
      });

      this.syncKnobToEngine({
        controllerGroup,
        controllerKnobName: "fx3",
        label: "FX2",
        engineGroup: `${controllerGroup === "left" ? "EffectRack1_EffectUnit1" : "EffectRack1_EffectUnit2"}_Effect2`,
        engineName: "meta",
        scale: "gain",
        format: "unsigned",
        softTakeover: true,
      });

      this.syncKnobToEngine({
        controllerGroup,
        controllerKnobName: "fx4",
        label: "FX3",
        engineGroup: `${controllerGroup === "left" ? "EffectRack1_EffectUnit1" : "EffectRack1_EffectUnit2"}_Effect3`,
        engineName: "meta",
        scale: "gain",
        format: "unsigned",
        softTakeover: true,
      });
    }

    // Handle main group buttons
    this.handleButton({
      group: "main",
      name: "top",
      assignment: this.config.top,
    });
    this.handleButton({
      group: "main",
      name: "shift",
      assignment: this.config.shift,
    });

    // Handle side group buttons
    for (const group of ["left" as const, "right" as const]) {
      this.handleButton({
        group,
        name: "assignLeft",
        assignment: this.config.assignLeft,
      });
      this.handleButton({
        group,
        name: "assignRight",
        assignment: this.config.assignRight,
      });
      this.handleButton({
        group,
        name: "fxToggle1",
        assignment: this.config.fxToggle1,
      });
      this.handleButton({
        group,
        name: "fxToggle2",
        assignment: this.config.fxToggle2,
      });
      this.handleButton({
        group,
        name: "fxToggle3",
        assignment: this.config.fxToggle3,
      });
      this.handleButton({
        group,
        name: "fxToggle4",
        assignment: this.config.fxToggle4,
      });
      this.handleButton({
        group,
        name: "browse",
        assignment: this.config.browse,
      });
      this.handleButton({
        group,
        name: "loop",
        assignment: this.config.loop,
      });
      this.handleButton({
        group,
        name: "hotcue1",
        assignment: this.config.hotcue1,
      });
      this.handleButton({
        group,
        name: "hotcue2",
        assignment: this.config.hotcue2,
      });
      this.handleButton({
        group,
        name: "hotcue3",
        assignment: this.config.hotcue3,
      });
      this.handleButton({
        group,
        name: "hotcue4",
        assignment: this.config.hotcue4,
      });
      this.handleButton({
        group,
        name: "nudgeLeft",
        assignment: this.config.nudgeLeft,
      });
      this.handleButton({
        group,
        name: "nudgeRight",
        assignment: this.config.nudgeRight,
      });
      this.handleButton({
        group,
        name: "cue",
        assignment: this.config.cue,
      });
      this.handleButton({
        group,
        name: "rev",
        assignment: this.config.rev,
      });
      this.handleButton({
        group,
        name: "play",
        assignment: this.config.play,
      });
      this.handleButton({
        group,
        name: "sync",
        assignment: this.config.sync,
      });
    }
  }

  /**
   * For actions with an associated color, gets the light color for
   * that action. Otherwise, uses the provided theme color, dimming it
   * if appropriate.
   */
  private getActionLightColor({
    group,
    action,
    defaultColor,
  }: {
    group: ControllerGroup;
    action: ButtonAction;
    defaultColor: string;
  }): string {
    switch (action) {
      case ButtonAction.Shift:
        return dimColorWhen(defaultColor, !this.controllerState.shift);
      case ButtonAction.Play:
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "play") === 0,
        );
      case ButtonAction.Sync:
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "sync_enabled") === 0,
        );
      case ButtonAction.Cue:
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "cue_default") === 0,
        );
      case ButtonAction.SkipToStart:
        return dimColorWhen(
          defaultColor,
          engine.getValue(this.getEngineGroup(group), "start") === 0,
        );
      case ButtonAction.Disabled:
        return "black";
      default:
        return defaultColor;
    }
  }

  private updateButtonLight({
    group,
    buttonName,
    lightName,
  }: {
    group: ControllerGroup;
    buttonName: ControllerButtonName;
    lightName: ControllerColoredLightName;
  }) {
    const assignment = this.config[buttonName];
    const action = this.getButtonAction(assignment);
    const defaultColor = defaultedColor(
      defaultedColor(this.config.actionColors[action], this.config.colorTheme),
      DEFAULT_X1_MK3_CONFIG.colorTheme,
    );
    const color = this.getActionLightColor({ group, action, defaultColor });
    this.controller.lights.setColoredLight(group, lightName, color);
  }

  /** Syncs data from the engine to the lights. */
  private syncLights() {
    const { shift } = this.controllerState;

    this.updateButtonLight({
      group: "main",
      buttonName: "shift",
      lightName: "shift",
    });

    for (const group of ["left" as const, "right" as const]) {
      const engineGroup = this.getEngineGroup(group);

      // Update buttons
      this.updateButtonLight({
        group,
        buttonName: "fxToggle1",
        lightName: "fxToggle1",
      });
      this.updateButtonLight({
        group,
        buttonName: "fxToggle2",
        lightName: "fxToggle2",
      });
      this.updateButtonLight({
        group,
        buttonName: "fxToggle3",
        lightName: "fxToggle3",
      });
      this.updateButtonLight({
        group,
        buttonName: "fxToggle4",
        lightName: "fxToggle4",
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue1",
        lightName: "hotcue1",
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue2",
        lightName: "hotcue2",
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue3",
        lightName: "hotcue3",
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue4",
        lightName: "hotcue4",
      });
      this.updateButtonLight({
        group,
        buttonName: "nudgeLeft",
        lightName: "nudgeLeft",
      });
      this.updateButtonLight({
        group,
        buttonName: "nudgeRight",
        lightName: "nudgeRight",
      });
      this.updateButtonLight({
        group,
        buttonName: "cue",
        lightName: "cue",
      });
      this.updateButtonLight({
        group,
        buttonName: "rev",
        lightName: "rev",
      });
      this.updateButtonLight({
        group,
        buttonName: "play",
        lightName: "play",
      });
      this.updateButtonLight({
        group,
        buttonName: "sync",
        lightName: "sync",
      });

      // Update bottom LEDs
      const isBeatActive = engine.getValue(engineGroup, "beat_active") !== 0;
      for (let n = 1; n <= 6; n++) {
        const colorKey = `colorBottomLeds${n}`;
        if (!(colorKey in this.config)) {
          throw new Error("Invalid color index");
        }
        let color = defaultedColor(
          defaultedColor(
            defaultedColor(
              this.config[colorKey as keyof TraktorX1MK3Config] as string,
              this.config.colorBottomLedsDefault,
            ),
            this.config.colorTheme,
          ),
          DEFAULT_X1_MK3_CONFIG.colorTheme,
        );
        if (
          this.config.endWarning &&
          engine.getValue(engineGroup, "end_of_track") === 1
        ) {
          color = dimColorWhen(this.config.colorEndWarning, !isBeatActive);
        }
        if (
          this.config.activeLoop &&
          engine.getValue(engineGroup, "loop_enabled")
        ) {
          color = this.config.colorActiveLoop;
        }
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

  private scheduleScreenReset(screen: Screen, millis: number) {
    const found = this.screenResetTimerIds[screen];
    if (found) {
      engine.stopTimer(found);
    }
    this.screenResetTimerIds[screen] = engine.beginTimer(
      millis,
      () => {
        this.screenResetTimerIds[screen] = undefined;
        this.screenStatuses[screen] = {
          kind: "home",
        };
        this.syncScreens();
      },
      true,
    );
  }

  private drawHomeScreen(screen: TraktorScreen) {
    const decksToggleLeft = this.controllerState.decksToggle.left;
    const decksToggleRight = this.controllerState.decksToggle.right;

    screen.clear();
    if (decksToggleLeft) {
      screen.drawBox({
        x: 0,
        y: 32,
        height: 32,
        width: 32,
        filled: true,
      });
    }
    screen.writeText({
      text: decksToggleLeft ? "C" : "A",
      x: 6,
      y: 32,
      width: 1,
      height: 1,
      scale: 2,
      invert: decksToggleLeft,
    });
    if (decksToggleRight) {
      screen.drawBox({
        x: 96,
        y: 32,
        height: 32,
        width: 32,
        filled: true,
      });
    }
    screen.writeText({
      text: decksToggleRight ? "D" : "B",
      x: 101,
      y: 32,
      width: 1,
      height: 1,
      scale: 2,
      invert: decksToggleRight,
    });
    const fx = engine.getValue(
      "[QuickEffectRack1_[Channel1]]",
      "loaded_chain_preset",
    );
    if (fx) {
      screen.writeText({
        text: `#${fx}`,
        scale: 2,
        x: 44,
        y: 32,
        width: 2,
        height: 1,
      });
    }
    const recStatus = engine.getValue("[Recording]", "status");
    if (recStatus > 0) {
      screen.writeText({
        text: recStatus > 1 ? "Recording" : "Init Rec..",
        scale: 1,
        x: 0,
        y: 0,
        width: 12,
        height: 1,
      });
    }
  }

  private drawEqScreen(screen: TraktorScreen, group: "left" | "right") {
    const engineGroup = this.getEngineGroup(group);
    const eqRackGroup = this.getEqRackGroup(group);
    const volume = engine.getValue(this.getEngineGroup(group), "volume");
    const gain = this.unscaleGain(engine.getValue(engineGroup, "pregain"));
    const hi = this.unscaleGain(engine.getValue(eqRackGroup, "parameter3"));
    const mid = this.unscaleGain(engine.getValue(eqRackGroup, "parameter2"));
    const low = this.unscaleGain(engine.getValue(eqRackGroup, "parameter1"));

    screen.clear();
    screen.writeText({
      x: 0,
      y: 0,
      scale: 1,
      width: 1,
      height: 4,
      text: "VOL",
    });
    screen.drawVertVolGauge({
      x: 14,
      y: 2,
      width: 10,
      height: 61,
      value: volume,
    });

    screen.writeText({
      x: 32,
      y: 0,
      scale: 1,
      width: 1,
      height: 4,
      text: "EQ",
    });
    screen.drawEqGauge({
      x: 44,
      y: 2,
      width: 14,
      height: 61,
      value: low,
    });
    screen.drawEqGauge({
      x: 60,
      y: 2,
      width: 14,
      height: 61,
      value: mid,
    });
    screen.drawEqGauge({
      x: 76,
      y: 2,
      width: 14,
      height: 61,
      value: hi,
    });

    screen.writeText({
      x: 96,
      y: 0,
      scale: 1,
      width: 1,
      height: 4,
      text: "GAIN",
    });
    screen.drawEqGauge({
      x: 108,
      y: 2,
      width: 20,
      height: 61,
      value: gain,
    });
  }

  private drawStemScreen(screen: TraktorScreen, group: "left" | "right") {
    const engineGroup = this.getEngineGroup(group);
    const volume = engine.getValue(this.getEngineGroup(group), "volume");
    const drums = engine.getValue(`[Channel${engineGroup[8]}_Stem1]`, "volume");
    const bass = engine.getValue(`[Channel${engineGroup[8]}_Stem2]`, "volume");
    const other = engine.getValue(`[Channel${engineGroup[8]}_Stem3]`, "volume");
    const vocal = engine.getValue(`[Channel${engineGroup[8]}_Stem4]`, "volume");
    screen.clear();
    screen.writeText({
      x: 0,
      y: 0,
      scale: 1,
      width: 1,
      height: 4,
      text: "VOL",
    });
    screen.drawVertVolGauge({
      x: 14,
      y: 2,
      width: 10,
      height: 61,
      value: volume,
    });

    screen.writeText({
      text: "Drums",
      scale: 1,
      x: 28,
      y: 0,
      width: 5,
      height: 1,
    });
    screen.drawHorzVolGauge({
      x: 82,
      y: 2,
      width: 46,
      height: 12,
      value: drums,
    });
    screen.writeText({
      text: "Bass",
      scale: 1,
      x: 28,
      y: 16,
      width: 5,
      height: 1,
    });
    screen.drawHorzVolGauge({
      x: 82,
      y: 18,
      width: 46,
      height: 12,
      value: bass,
    });
    screen.writeText({
      text: "Other",
      scale: 1,
      x: 28,
      y: 32,
      width: 5,
      height: 1,
    });
    screen.drawHorzVolGauge({
      x: 82,
      y: 34,
      width: 46,
      height: 12,
      value: other,
    });
    screen.writeText({
      text: "Vocal",
      scale: 1,
      x: 28,
      y: 48,
      width: 5,
      height: 1,
    });
    screen.drawHorzVolGauge({
      x: 82,
      y: 50,
      width: 46,
      height: 12,
      value: vocal,
    });
  }

  private drawValueScreen(
    screen: TraktorScreen,
    data: Extract<ScreenStatus, { kind: "value" }>,
  ) {
    screen.clear();
    screen.writeText({
      x: 0,
      y: 0,
      scale: 2,
      text: data.label,
      width: 6,
      height: 1,
    });
    screen.writeText({
      x: 0,
      y: 32,
      scale: 2,
      text: data.value,
      width: 6,
      height: 1,
    });
  }

  private drawSoftTakeoverScreen(
    screen: TraktorScreen,
    data: Extract<ScreenStatus, { kind: "softTakeover" }>,
  ) {
    screen.clear();
    screen.writeText({
      x: 0,
      y: 0,
      scale: 2,
      text: data.label,
      width: 6,
      height: 1,
    });
    screen.drawSoftTakeoverChart({
      x: 0,
      y: 32,
      width: 128,
      height: 32,
      target: data.target,
      value: data.value,
      time: this.time,
    });
  }

  /** Sync data to controller screens */
  private syncScreens() {
    for (const screenName of Object.values(Screen)) {
      const screen = this.screens[screenName];
      const status = this.screenStatuses[screenName];
      switch (status.kind) {
        case "value":
          this.drawValueScreen(screen, status);
          break;
        case "softTakeover":
          this.drawSoftTakeoverScreen(screen, status);
          break;
        case "home":
          switch (screenName) {
            case Screen.Main:
              this.drawHomeScreen(screen);
              break;
            case Screen.TopLeft:
              this.drawEqScreen(this.screens[screenName], "left");
              break;
            case Screen.TopRight:
              this.drawEqScreen(this.screens[screenName], "right");
              break;
            default:
              screen.clear();
          }
          break;
      }
      screen.send(this.isDebugging);
    }
  }
}

var TraktorX1MK3 = new TraktorX1MK3Class();

// workaround to avoid global var being automatically removed by the bundler
var keep = TraktorX1MK3;
