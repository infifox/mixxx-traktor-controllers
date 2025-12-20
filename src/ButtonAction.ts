export type ButtonAction =
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Does nothing */
      kind: "disabled";
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Enabled a modifier while held. */
      kind: "modifier";

      /** Modifier name. */
      modifier: "shift" | "super";
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Toggles the active decks on push. */
      kind: "toggleDecks";
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Sets a value to 1 on press and 0 on release. */
      kind: "hold";

      /** Template for group name. */
      group: string;

      /** Template for name of the value to set */
      value: string;

      /** Template of value name to use for light color (for hotcues) */
      color?: string;
    }
  | {
      /** Name of the action, for configuration */
      name: string;

      /** Toggles a boolean value when pressed. */
      kind: "toggle";

      /** Template for group name. */
      group: string;

      /** Template for name of the value to toggle */
      value: string;
    };

export type TemplateArgs = {
  side: number;
  group: number;
  left: number;
  right: number;
  beatloop: number;
};

/**
 * Adds dynamic values into a template.
 *
 * %s - number of the active side (1 or 2)
 * %g - number of the group (deck) currently assigned to the active side
 * %l - number of the group (deck) currently assigned to the left side
 * %r - number of the group (deck) currently assigned to the right side
 * %b - current beatloop size
 */
export function applyTemplate(template: string, args: TemplateArgs): string {
  const output = template
    .slice()
    .replace("%s", String(args.side))
    .replace("%g", String(args.group))
    .replace("%l", String(args.left))
    .replace("%r", String(args.right))
    .replace("%b", String(args.beatloop));
  return output;
}

export function ButtonAction(action: ButtonAction): ButtonAction {
  return action;
}

export const BUTTON_ACTIONS = {
  disabled: ButtonAction({ name: "disabled", kind: "disabled" }),
  shift: ButtonAction({ name: "shift", kind: "modifier", modifier: "shift" }),
  super: ButtonAction({ name: "super", kind: "modifier", modifier: "super" }),
  toggleDecks: ButtonAction({ name: "toggleDecks", kind: "toggleDecks" }),
  assignDeckAC: ButtonAction({
    name: "assignDeckAC",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s]",
    value: "group_%l_enable",
  }),
  assignDeckBD: ButtonAction({
    name: "assignDeckBD",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s]",
    value: "group_%r_enable",
  }),
  assignDeckA: ButtonAction({
    name: "assignDeckA",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s]",
    value: "group_1_enable",
  }),
  assignDeckB: ButtonAction({
    name: "assignDeckB",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s]",
    value: "group_2_enable",
  }),
  assignDeckC: ButtonAction({
    name: "assignDeckC",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s]",
    value: "group_3_enable",
  }),
  assignDeckD: ButtonAction({
    name: "assignDeckD",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s]",
    value: "group_4_enable",
  }),
  toggleFx1: ButtonAction({
    name: "toggleFx1",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s_Effect1]",
    value: "enabled",
  }),
  toggleFx2: ButtonAction({
    name: "toggleFx2",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s_Effect2]",
    value: "enabled",
  }),
  toggleFx3: ButtonAction({
    name: "toggleFx3",
    kind: "toggle",
    group: "[EffectRack1_EffectUnit%s_Effect3]",
    value: "enabled",
  }),
  loadTrack: ButtonAction({
    name: "loadTrack",
    kind: "hold",
    group: "[Channel%g]",
    value: "LoadSelectedTrack",
  }),
  toggleLoop: ButtonAction({
    name: "toggleLoop",
    kind: "toggle",
    group: "[Channel%g]",
    value: "beatloop_%b_enabled",
  }),
  toggleLoop4: ButtonAction({
    name: "toggleLoop4",
    kind: "toggle",
    group: "[Channel%g]",
    value: "beatloop_4_enabled",
  }),
  hotcue1: ButtonAction({
    name: "hotcue1",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_1_activate",
    color: "hotcue_1_color",
  }),
  hotcue2: ButtonAction({
    name: "hotcue2",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_2_activate",
    color: "hotcue_2_color",
  }),
  hotcue3: ButtonAction({
    name: "hotcue3",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_3_activate",
    color: "hotcue_3_color",
  }),
  hotcue4: ButtonAction({
    name: "hotcue4",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_4_activate",
    color: "hotcue_4_color",
  }),
  hotcue5: ButtonAction({
    name: "hotcue5",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_5_activate",
    color: "hotcue_5_color",
  }),
  hotcue6: ButtonAction({
    name: "hotcue6",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_6_activate",
    color: "hotcue_6_color",
  }),
  hotcue7: ButtonAction({
    name: "hotcue7",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_7_activate",
    color: "hotcue_7_color",
  }),
  hotcue8: ButtonAction({
    name: "hotcue8",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_8_activate",
    color: "hotcue_8_color",
  }),
  clearHotcue1: ButtonAction({
    name: "clearHotcue1",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_1_clear",
    color: "hotcue_1_color",
  }),
  clearHotcue2: ButtonAction({
    name: "clearHotcue2",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_2_clear",
    color: "hotcue_2_color",
  }),
  clearHotcue3: ButtonAction({
    name: "clearHotcue3",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_3_clear",
    color: "hotcue_3_color",
  }),
  clearHotcue4: ButtonAction({
    name: "clearHotcue4",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_4_clear",
    color: "hotcue_4_color",
  }),
  clearHotcue5: ButtonAction({
    name: "clearHotcue5",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_5_clear",
    color: "hotcue_5_color",
  }),
  clearHotcue6: ButtonAction({
    name: "clearHotcue6",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_6_clear",
    color: "hotcue_6_color",
  }),
  clearHotcue7: ButtonAction({
    name: "clearHotcue7",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_7_clear",
    color: "hotcue_7_color",
  }),
  clearHotcue8: ButtonAction({
    name: "clearHotcue8",
    kind: "hold",
    group: "[Channel%g]",
    value: "hotcue_8_clear",
    color: "hotcue_8_color",
  }),
  beatjumpBackward1: ButtonAction({
    name: "beatjumpBackward1",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_1_backward",
  }),
  beatjumpBackward2: ButtonAction({
    name: "beatjumpBackward2",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_2_backward",
  }),
  beatjumpBackward4: ButtonAction({
    name: "beatjumpBackward4",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_4_backward",
  }),
  beatjumpBackward8: ButtonAction({
    name: "beatjumpBackward8",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_8_backward",
  }),
  beatjumpBackward16: ButtonAction({
    name: "beatjumpBackward16",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_16_backward",
  }),
  beatjumpBackward32: ButtonAction({
    name: "beatjumpBackward32",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_32_backward",
  }),
  beatjumpBackward64: ButtonAction({
    name: "beatjumpBackward64",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_64_backward",
  }),
  beatjumpBackwardLoop: ButtonAction({
    name: "beatjumpBackwardLoop",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_%b_backward",
  }),
  beatjumpForward1: ButtonAction({
    name: "beatjumpForward1",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_1_forward",
  }),
  beatjumpForward2: ButtonAction({
    name: "beatjumpForward2",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_2_forward",
  }),
  beatjumpForward4: ButtonAction({
    name: "beatjumpForward4",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_4_forward",
  }),
  beatjumpForward8: ButtonAction({
    name: "beatjumpForward8",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_8_forward",
  }),
  beatjumpForward16: ButtonAction({
    name: "beatjumpForward16",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_16_forward",
  }),
  beatjumpForward32: ButtonAction({
    name: "beatjumpForward32",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_32_forward",
  }),
  beatjumpForward64: ButtonAction({
    name: "beatjumpForward64",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_64_forward",
  }),
  beatjumpForwardLoop: ButtonAction({
    name: "beatjumpForwardLoop",
    kind: "hold",
    group: "[Channel%g]",
    value: "beatjump_%b_forward",
  }),
  cue: ButtonAction({
    name: "cue",
    kind: "hold",
    group: "[Channel%g]",
    value: "cue_default",
  }),
  rev: ButtonAction({
    name: "rev",
    kind: "hold",
    group: "[Channel%g]",
    value: "reverse",
  }),
  play: ButtonAction({
    name: "play",
    kind: "toggle",
    group: "[Channel%g]",
    value: "play",
  }),
  sync: ButtonAction({
    name: "sync",
    kind: "toggle",
    group: "[Channel%g]",
    value: "sync_enabled",
  }),
  skipToStart: ButtonAction({
    name: "skipToStart",
    kind: "hold",
    group: "[Channel%g]",
    value: "start",
  }),
};

export type ButtonActionName = keyof typeof BUTTON_ACTIONS;

export function loadButtonActionFromSetting(
  setting: engine.SettingValue | undefined,
  dft: ButtonAction | undefined,
): ButtonAction | undefined {
  if (setting === "inherit") {
    return undefined;
  } else if (
    typeof setting === "string" &&
    BUTTON_ACTIONS[setting as ButtonActionName]
  ) {
    return BUTTON_ACTIONS[setting as ButtonActionName];
  } else {
    return dft;
  }
}
