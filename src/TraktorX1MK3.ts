import {
  applyTemplate,
  BUTTON_ACTIONS,
  ButtonAction,
  ButtonActionName,
  loadButtonActionFromSetting,
  TemplateArgs,
} from "./ButtonAction";
import {
  ENCODER_ACTIONS,
  EncoderAction,
  loadEncoderActionFromSetting,
} from "./EncoderAction";
import {
  COLOR_MAPPER,
  COLOR_NAMES,
  defaultedColor,
  dimColor,
  dimColorWhen,
} from "./TraktorColors";
import { TraktorScreen } from "./TraktorScreen";
import {
  Controller,
  ControllerButtonName,
  ControllerColoredLightName,
  ControllerEncoderName,
  ControllerGroup,
  ControllerKnobName,
} from "./X1MK3Controller";

const SCREEN_RESET_MS = 800;
const SOFT_TAKEOVER_MARGIN = 0.05;

type ButtonAssignment = {
  push: ButtonAction;
  shiftPush?: ButtonAction;
  superPush?: ButtonAction;
  superShiftPush?: ButtonAction;
};

type EncoderAssignment = {
  turn: EncoderAction;
  shiftTurn?: EncoderAction;
  superTurn?: EncoderAction;
  superShiftTurn?: EncoderAction;
};

type TraktorX1MK3Config = {
  buttonAssignments: {
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
  };

  encoderAssignments: {
    browse: EncoderAssignment;
    loop: EncoderAssignment;
  };

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
  actionColors: Record<string, string>;

  blinkBottomLeds: boolean;
  endWarning: boolean;
  activeLoop: boolean;
};

const assignment = ({
  push,
  shiftPush,
  superPush,
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
  buttonAssignments: {
    top: assignment({ push: BUTTON_ACTIONS.toggleDecks }),
    assignLeft: assignment({ push: BUTTON_ACTIONS.assignDeckAC }),
    assignRight: assignment({ push: BUTTON_ACTIONS.assignDeckBD }),
    fxToggle1: assignment({ push: BUTTON_ACTIONS.disabled }),
    fxToggle2: assignment({ push: BUTTON_ACTIONS.toggleFx1 }),
    fxToggle3: assignment({ push: BUTTON_ACTIONS.toggleFx2 }),
    fxToggle4: assignment({ push: BUTTON_ACTIONS.toggleFx3 }),
    browse: assignment({
      push: BUTTON_ACTIONS.loadTrack,
      shiftPush: BUTTON_ACTIONS.toggleLibraryFolder,
    }),
    loop: assignment({ push: BUTTON_ACTIONS.toggleLoop }),
    shift: assignment({ push: BUTTON_ACTIONS.shift }),
    hotcue1: assignment({
      push: BUTTON_ACTIONS.hotcue1,
      shiftPush: BUTTON_ACTIONS.clearHotcue1,
    }),
    hotcue2: assignment({
      push: BUTTON_ACTIONS.hotcue2,
      shiftPush: BUTTON_ACTIONS.clearHotcue2,
    }),
    hotcue3: assignment({
      push: BUTTON_ACTIONS.hotcue3,
      shiftPush: BUTTON_ACTIONS.clearHotcue3,
    }),
    hotcue4: assignment({
      push: BUTTON_ACTIONS.hotcue4,
      shiftPush: BUTTON_ACTIONS.clearHotcue4,
    }),
    nudgeLeft: assignment({
      push: BUTTON_ACTIONS.beatjumpForward1,
    }),
    nudgeRight: assignment({
      push: BUTTON_ACTIONS.beatjumpBackward1,
    }),
    cue: assignment({
      push: BUTTON_ACTIONS.cue,
    }),
    rev: assignment({
      push: BUTTON_ACTIONS.rev,
    }),
    play: assignment({
      push: BUTTON_ACTIONS.play,
    }),
    sync: assignment({
      push: BUTTON_ACTIONS.sync,
    }),
  },

  encoderAssignments: {
    browse: {
      turn: ENCODER_ACTIONS.browseLibrary,
      shiftTurn: ENCODER_ACTIONS.browseLibraryFolders,
    },
    loop: {
      turn: ENCODER_ACTIONS.beatloopSize,
      shiftTurn: ENCODER_ACTIONS.beatjumpByBeatloop,
    },
  },

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
      if (key !== "buttonAssignments" && key !== "encoderAssignments") {
        (this.config as Record<string, unknown>)[key] =
          engine.getSetting(key) ??
          (this.config as Record<string, unknown>)[key];
      }
    }

    for (const key in this.config.buttonAssignments) {
      const assignment =
        this.config.buttonAssignments[
          key as keyof TraktorX1MK3Config["buttonAssignments"]
        ];
      this.config.buttonAssignments[
        key as keyof TraktorX1MK3Config["buttonAssignments"]
      ] = {
        push:
          loadButtonActionFromSetting(
            engine.getSetting(`${key}Push`),
            assignment.push,
          ) ?? BUTTON_ACTIONS.disabled,
        shiftPush: loadButtonActionFromSetting(
          engine.getSetting(`${key}ShiftPush`),
          assignment.shiftPush,
        ),
        superPush: loadButtonActionFromSetting(
          engine.getSetting(`${key}SuperPush`),
          assignment.superPush,
        ),
        superShiftPush: loadButtonActionFromSetting(
          engine.getSetting(`${key}SuperShiftPush`),
          assignment.superShiftPush,
        ),
      };
    }

    for (const key in this.config.encoderAssignments) {
      const assignment =
        this.config.encoderAssignments[
          key as keyof TraktorX1MK3Config["encoderAssignments"]
        ];
      this.config.encoderAssignments[
        key as keyof TraktorX1MK3Config["encoderAssignments"]
      ] = {
        turn:
          loadEncoderActionFromSetting(
            engine.getSetting(`${key}Turn`),
            assignment.turn,
          ) ?? ENCODER_ACTIONS.disabled,
        shiftTurn: loadEncoderActionFromSetting(
          engine.getSetting(`${key}ShiftTurn`),
          assignment.shiftTurn,
        ),
        superTurn: loadEncoderActionFromSetting(
          engine.getSetting(`${key}SuperTurn`),
          assignment.superTurn,
        ),
        superShiftTurn: loadEncoderActionFromSetting(
          engine.getSetting(`${key}SuperShiftTurn`),
          assignment.superShiftTurn,
        ),
      };
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
    action,
    args,
  }: {
    action: ButtonAction;
    args: TemplateArgs;
  }) {
    switch (action.kind) {
      case "disabled":
        break;
      case "modifier":
        switch (action.modifier) {
          case "shift":
            this.controllerState.shift = true;
            break;
          case "super":
            this.controllerState.super = true;
            break;
        }
        break;
      case "toggleDecks":
        const newValue =
          !this.controllerState.decksToggle.left &&
          !this.controllerState.decksToggle.right;
        this.controllerState.decksToggle.left = newValue;
        this.controllerState.decksToggle.right = newValue;
        break;
      case "hold":
        engine.setValue(
          applyTemplate(action.group, args),
          applyTemplate(action.value, args),
          1,
        );
        break;
      case "toggle":
        this.toggleEngineBoolean(
          applyTemplate(action.group, args),
          applyTemplate(action.value, args),
        );
        break;
    }
  }

  private stopAction({
    action,
    args,
  }: {
    action: ButtonAction;
    args: TemplateArgs;
  }) {
    switch (action.kind) {
      case "disabled":
        break;
      case "modifier":
        switch (action.modifier) {
          case "shift":
            this.controllerState.shift = false;
            break;
          case "super":
            this.controllerState.super = false;
            break;
        }
        break;
      case "toggleDecks":
        break;
      case "hold":
        engine.setValue(
          applyTemplate(action.group, args),
          applyTemplate(action.value, args),
          0,
        );
        break;
      case "toggle":
        break;
    }
  }

  private performEncoderAction({
    action,
    group,
    value,
  }: {
    action: EncoderAction;
    group: ControllerGroup;
    value: number;
  }) {
    switch (action.kind) {
      case "disabled":
        break;
      case "direct": {
        const multipliedValue =
          action.multiplier === undefined ? value : value * action.multiplier;
        engine.setValue(
          action.engineGroup ?? this.getEngineGroup(group),
          action.engineName,
          multipliedValue,
        );
        break;
      }
      case "byBeatloop": {
        const engineGroup = this.getEngineGroup(group);
        const beatloopSize = engine.getValue(engineGroup, "beatloop_size");
        const multipliedValue = value * beatloopSize;
        engine.setValue(
          this.getEngineGroup(group),
          action.engineName,
          multipliedValue,
        );
        break;
      }
      case "beatloopSize": {
        const engineGroup = this.getEngineGroup(group);
        let beatloopSize = engine.getValue(engineGroup, "beatloop_size");
        let current = value;
        while (current >= 1 && beatloopSize < 512) {
          current--;
          beatloopSize *= 2;
        }
        while (current <= -1 && beatloopSize > 0.03125) {
          current++;
          beatloopSize /= 2;
        }

        engine.setValue(engineGroup, "beatloop_size", beatloopSize);
        break;
      }
      case "browseLibrary":
        engine.setValue(
          "[Library]",
          "focused_widget",
          action.widget === "tree" ? 2 : 3,
        );
        engine.setValue("[Library]", "MoveVertical", value);
        break;
    }
  }

  /** Gets the current action for a button assignment. */
  private getButtonAction(assignment: ButtonAssignment): ButtonAction {
    let action: ButtonAction;
    if (this.controllerState.super && this.controllerState.shift) {
      action =
        assignment.superShiftPush ??
        assignment.superPush ??
        assignment.shiftPush ??
        assignment.push;
    }
    if (this.controllerState.super) {
      action = assignment.superPush ?? assignment.push;
    } else if (this.controllerState.shift) {
      action = assignment.shiftPush ?? assignment.push;
    } else {
      action = assignment.push ?? assignment.push;
    }
    return action;
  }

  /** Gets the current action for an encoder assignment. */
  private getEncoderAction(assignment: EncoderAssignment): EncoderAction {
    let action: EncoderAction;
    if (this.controllerState.super && this.controllerState.shift) {
      action =
        assignment.superShiftTurn ??
        assignment.superTurn ??
        assignment.shiftTurn ??
        assignment.turn;
    }
    if (this.controllerState.super) {
      action = assignment.superTurn ?? assignment.turn;
    } else if (this.controllerState.shift) {
      action = assignment.shiftTurn ?? assignment.turn;
    } else {
      action = assignment.turn ?? assignment.turn;
    }
    return action;
  }

  private handleButton({
    group,
    name,
    args,
    assignment,
  }: {
    group: ControllerGroup;
    name: ControllerButtonName;
    args: TemplateArgs;
    assignment: ButtonAssignment;
  }) {
    if (this.controller.wasButtonPressed(group, name)) {
      this.startAction({ args, action: this.getButtonAction(assignment) });
    }
    if (this.controller.wasButtonReleased(group, name)) {
      this.stopAction({ args, action: this.getButtonAction(assignment) });
    }
  }

  private handleEncoder({
    group,
    name,
    assignment,
  }: {
    group: ControllerGroup;
    name: ControllerEncoderName;
    assignment: EncoderAssignment;
  }) {
    const value = this.controller.getEncoderChange(group, name);
    if (value !== 0) {
      this.performEncoderAction({
        action: this.getEncoderAction(assignment),
        group,
        value,
      });
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

    const mainArgs: TemplateArgs = {
      side: 0,
      group: 0,
      left: this.controllerState.decksToggle.left ? 3 : 1,
      right: this.controllerState.decksToggle.right ? 4 : 2,
      beatloop: 0,
    };

    // Handle main group buttons
    this.handleButton({
      group: "main",
      name: "top",
      args: mainArgs,
      assignment: this.config.buttonAssignments.top,
    });
    this.handleButton({
      group: "main",
      name: "shift",
      args: mainArgs,
      assignment: this.config.buttonAssignments.shift,
    });

    // Handle side group buttons and encoders
    for (const group of ["left" as const, "right" as const]) {
      const args: TemplateArgs = Object.assign({}, mainArgs, {
        side: group === "left" ? 1 : 2,
        group: group === "left" ? mainArgs.left : mainArgs.right,
        beatloop: engine.getValue(this.getEngineGroup(group), "beatloop_size"),
      });

      this.handleButton({
        group,
        name: "assignLeft",
        args,
        assignment: this.config.buttonAssignments.assignLeft,
      });
      this.handleButton({
        group,
        name: "assignRight",
        args,
        assignment: this.config.buttonAssignments.assignRight,
      });
      this.handleButton({
        group,
        name: "fxToggle1",
        args,
        assignment: this.config.buttonAssignments.fxToggle1,
      });
      this.handleButton({
        group,
        name: "fxToggle2",
        args,
        assignment: this.config.buttonAssignments.fxToggle2,
      });
      this.handleButton({
        group,
        name: "fxToggle3",
        args,
        assignment: this.config.buttonAssignments.fxToggle3,
      });
      this.handleButton({
        group,
        name: "fxToggle4",
        args,
        assignment: this.config.buttonAssignments.fxToggle4,
      });
      this.handleButton({
        group,
        name: "browse",
        args,
        assignment: this.config.buttonAssignments.browse,
      });
      this.handleButton({
        group,
        name: "loop",
        args,
        assignment: this.config.buttonAssignments.loop,
      });
      this.handleButton({
        group,
        name: "hotcue1",
        args,
        assignment: this.config.buttonAssignments.hotcue1,
      });
      this.handleButton({
        group,
        name: "hotcue2",
        args,
        assignment: this.config.buttonAssignments.hotcue2,
      });
      this.handleButton({
        group,
        name: "hotcue3",
        args,
        assignment: this.config.buttonAssignments.hotcue3,
      });
      this.handleButton({
        group,
        name: "hotcue4",
        args,
        assignment: this.config.buttonAssignments.hotcue4,
      });
      this.handleButton({
        group,
        name: "nudgeLeft",
        args,
        assignment: this.config.buttonAssignments.nudgeLeft,
      });
      this.handleButton({
        group,
        name: "nudgeRight",
        args,
        assignment: this.config.buttonAssignments.nudgeRight,
      });
      this.handleButton({
        group,
        name: "cue",
        args,
        assignment: this.config.buttonAssignments.cue,
      });
      this.handleButton({
        group,
        name: "rev",
        args,
        assignment: this.config.buttonAssignments.rev,
      });
      this.handleButton({
        group,
        name: "play",
        args,
        assignment: this.config.buttonAssignments.play,
      });
      this.handleButton({
        group,
        name: "sync",
        args,
        assignment: this.config.buttonAssignments.sync,
      });

      this.handleEncoder({
        group,
        name: "browse",
        assignment: this.config.encoderAssignments.browse,
      });

      this.handleEncoder({
        group,
        name: "loop",
        assignment: this.config.encoderAssignments.loop,
      });
    }
  }

  /**
   * For actions with an associated color, gets the light color for
   * that action. Otherwise, uses the provided theme color, dimming it
   * if appropriate.
   */
  private getActionLightColor({
    action,
    defaultColor,
    args,
  }: {
    action: ButtonAction;
    defaultColor: string;
    args: TemplateArgs;
  }): string {
    switch (action.kind) {
      case "disabled":
        return "black";
      case "modifier":
        switch (action.modifier) {
          case "shift":
            return dimColorWhen(defaultColor, !this.controllerState.shift);
          case "super":
            return dimColorWhen(defaultColor, !this.controllerState.super);
        }
      case "hold": {
        const active =
          engine.getValue(
            applyTemplate(action.group, args),
            applyTemplate(action.value, args),
          ) > 0;
        const color = action.color
          ? COLOR_NAMES[
              COLOR_MAPPER.getValueForNearestColor(
                engine.getValue(
                  applyTemplate(action.group, args),
                  applyTemplate(action.color, args),
                ),
              )
            ]
          : defaultColor;

        return dimColorWhen(color, !active);
      }
      case "toggle":
        return dimColorWhen(
          defaultColor,
          !engine.getValue(
            applyTemplate(action.group, args),
            applyTemplate(action.value, args),
          ),
        );
      default:
        return dimColor(defaultColor);
    }
  }

  private updateButtonLight({
    group,
    buttonName,
    lightName,
    args,
  }: {
    group: ControllerGroup;
    buttonName: ControllerButtonName;
    lightName: ControllerColoredLightName;
    args: TemplateArgs;
  }) {
    const assignment = this.config.buttonAssignments[buttonName];
    const action = this.getButtonAction(assignment);
    const defaultColor = defaultedColor(
      defaultedColor(
        this.config.actionColors[action.name],
        this.config.colorTheme,
      ),
      DEFAULT_X1_MK3_CONFIG.colorTheme,
    );
    const color = this.getActionLightColor({
      action,
      defaultColor,
      args,
    });
    this.controller.lights.setColoredLight(group, lightName, color);
  }

  /** Syncs data from the engine to the lights. */
  private syncLights() {
    const mainArgs: TemplateArgs = {
      side: 0,
      group: 0,
      left: this.controllerState.decksToggle.left ? 3 : 1,
      right: this.controllerState.decksToggle.right ? 4 : 2,
      beatloop: 0,
    };

    this.updateButtonLight({
      group: "main",
      buttonName: "shift",
      lightName: "shift",
      args: mainArgs,
    });

    for (const group of ["left" as const, "right" as const]) {
      const engineGroup = this.getEngineGroup(group);
      const args: TemplateArgs = Object.assign({}, mainArgs, {
        side: group === "left" ? 1 : 2,
        group: group === "left" ? mainArgs.left : mainArgs.right,
        beatloop: engine.getValue(this.getEngineGroup(group), "beatloop_size"),
      });

      // Update buttons
      this.updateButtonLight({
        group,
        buttonName: "fxToggle1",
        lightName: "fxToggle1",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "fxToggle2",
        lightName: "fxToggle2",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "fxToggle3",
        lightName: "fxToggle3",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "fxToggle4",
        lightName: "fxToggle4",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue1",
        lightName: "hotcue1",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue2",
        lightName: "hotcue2",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue3",
        lightName: "hotcue3",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "hotcue4",
        lightName: "hotcue4",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "nudgeLeft",
        lightName: "nudgeLeft",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "nudgeRight",
        lightName: "nudgeRight",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "cue",
        lightName: "cue",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "rev",
        lightName: "rev",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "play",
        lightName: "play",
        args,
      });
      this.updateButtonLight({
        group,
        buttonName: "sync",
        lightName: "sync",
        args,
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
