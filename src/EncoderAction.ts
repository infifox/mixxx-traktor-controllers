export type EncoderAction =
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Does nothing */
      kind: "disabled";
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Directly manipulates an engine value. */
      kind: "direct";

      /** Name of the engine value to change. */
      engineName: string;

      /** Overrides the engine group. */
      engineGroup?: string;

      /** Number to multiply the value by before passing to the engine. */
      multiplier?: number;
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Manipulates the beatloop_size value logarithmically. */
      kind: "beatloopSize";
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Manipulates an engine value by the amount of the current beatloop size. */
      kind: "byBeatloop";

      /** Name of the engine value to change. */
      engineName: string;
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Moves library focus to a specific widget and moves through it. */
      kind: "browseLibrary";

      /** Widget to move to. */
      widget: "tree" | "tracks";
    };

export function EncoderAction(action: EncoderAction): EncoderAction {
  return action;
}

export const ENCODER_ACTIONS = {
  beatjump: EncoderAction({
    name: "beatjump",
    kind: "direct",
    engineName: "beatjump",
  }),
  beatjump2: EncoderAction({
    name: "beatjump2",
    kind: "direct",
    engineName: "beatjump",
    multiplier: 2,
  }),
  beatjump4: EncoderAction({
    name: "beatjump4",
    kind: "direct",
    engineName: "beatjump",
    multiplier: 4,
  }),
  beatjump8: EncoderAction({
    name: "beatjump8",
    kind: "direct",
    engineName: "beatjump",
    multiplier: 8,
  }),
  beatjump16: EncoderAction({
    name: "beatjump16",
    kind: "direct",
    engineName: "beatjump",
    multiplier: 16,
  }),
  beatjump32: EncoderAction({
    name: "beatjump32",
    kind: "direct",
    engineName: "beatjump",
    multiplier: 32,
  }),
  beatjump64: EncoderAction({
    name: "beatjump64",
    kind: "direct",
    engineName: "beatjump",
    multiplier: 64,
  }),
  beatjumpByBeatloop: EncoderAction({
    name: "beatjumpByBeatloop",
    kind: "byBeatloop",
    engineName: "beatjump",
  }),
  beatloopSize: EncoderAction({
    name: "beatloopSize",
    kind: "beatloopSize",
  }),
  browseLibrary: EncoderAction({
    name: "browseLibrary",
    kind: "direct",
    engineGroup: "[Playlist]",
    engineName: "SelectTrackKnob",
  }),
  browseLibraryFolders: EncoderAction({
    name: "browseLibraryFolders",
    kind: "direct",
    engineGroup: "[Playlist]",
    engineName: "SelectPlaylist",
  }),
  disabled: EncoderAction({
    name: "disabled",
    kind: "disabled",
  }),
} as const;

export type EncoderActionName = keyof typeof ENCODER_ACTIONS;

export function loadEncoderActionFromSetting(
  setting: engine.SettingValue | undefined,
  dft: EncoderAction | undefined,
): EncoderAction | undefined {
  if (setting === "inherit") {
    return undefined;
  } else if (
    typeof setting === "string" &&
    ENCODER_ACTIONS[setting as EncoderActionName]
  ) {
    return ENCODER_ACTIONS[setting as EncoderActionName];
  } else {
    return dft;
  }
}
