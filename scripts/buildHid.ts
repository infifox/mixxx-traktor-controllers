import { ButtonAction } from "../src/ButtonAction";

const template = `
<?xml version="1.0" encoding="utf-8" ?>
<MixxxControllerPreset schemaVersion="1" mixxxVersion="1.11+">
    <info>
        <name>Native Instruments Traktor X1 MK3</name>
        <author>Infinifox</author>
        <description>HID mapping for the Traktor X1 MK3</description>
        <devices>
            <product protocol="hid" vendor_id="0x17CC" product_id="0x2200" />
        </devices>
    </info>
    <controller id="TraktorX1MK3">
        <scriptfiles>
            <file
                filename="Traktor-X1-MK3.script.js"
                functionprefix="TraktorX1MK3"
            />
        </scriptfiles>
    </controller>
    <settings>
      :settings
    </settings>
</MixxxControllerPreset>`;

type SettingsGroup = {
  title: string;
  settings: Setting[];
};

type Setting = {
  kind: "ButtonSetting";
  section: "main" | "side";
  name: string;
  label: string;
  push: ButtonAction;
  shiftPush?: ButtonAction;
  superPush?: ButtonAction;
  superShiftPush?: ButtonAction;
};

const BUTTON_ACTIONS_BY_SECTION = {
  main: [
    ButtonAction.Disabled,
    ButtonAction.Shift,
    ButtonAction.Super,
    ButtonAction.ToggleDecks,
  ],
  side: [
    ButtonAction.Disabled,
    ButtonAction.Shift,
    ButtonAction.Super,
    ButtonAction.AssignDeckAC,
    ButtonAction.AssignDeckBD,
    ButtonAction.AssignDeckA,
    ButtonAction.AssignDeckB,
    ButtonAction.AssignDeckC,
    ButtonAction.AssignDeckD,
    ButtonAction.ToggleFx1,
    ButtonAction.ToggleFx2,
    ButtonAction.ToggleFx3,
    ButtonAction.LoadTrack,
    ButtonAction.ToggleLoop,
    ButtonAction.ToggleLoop4,
    ButtonAction.LoopDown,
    ButtonAction.LoopUp,
    ButtonAction.Hotcue1,
    ButtonAction.Hotcue2,
    ButtonAction.Hotcue3,
    ButtonAction.Hotcue4,
    ButtonAction.Hotcue5,
    ButtonAction.Hotcue6,
    ButtonAction.Hotcue7,
    ButtonAction.Hotcue8,
    ButtonAction.ClearHotcue1,
    ButtonAction.ClearHotcue2,
    ButtonAction.ClearHotcue3,
    ButtonAction.ClearHotcue4,
    ButtonAction.ClearHotcue5,
    ButtonAction.ClearHotcue6,
    ButtonAction.ClearHotcue7,
    ButtonAction.ClearHotcue8,
    ButtonAction.BeatjumpLeft1,
    ButtonAction.BeatjumpLeft2,
    ButtonAction.BeatjumpLeft4,
    ButtonAction.BeatjumpLeft8,
    ButtonAction.BeatjumpLeft16,
    ButtonAction.BeatjumpLeft32,
    ButtonAction.BeatjumpLeft64,
    ButtonAction.BeatjumpRight1,
    ButtonAction.BeatjumpRight2,
    ButtonAction.BeatjumpRight4,
    ButtonAction.BeatjumpRight8,
    ButtonAction.BeatjumpRight16,
    ButtonAction.BeatjumpRight32,
    ButtonAction.BeatjumpRight64,
    ButtonAction.BeatjumpLeftByLoop,
    ButtonAction.BeatjumpRightByLoop,
    ButtonAction.Cue,
    ButtonAction.Rev,
    ButtonAction.Play,
    ButtonAction.Sync,
    ButtonAction.SkipToStart,
  ],
};

const BUTTON_ACTION_LABELS: Record<ButtonAction, string> = {
  [ButtonAction.Disabled]: "Disabled",
  [ButtonAction.Inherit]: "Inherit",
  [ButtonAction.Shift]: "Shift",
  [ButtonAction.Super]: "Super",
  [ButtonAction.ToggleDecks]: "Toggle Decks AC/BD",
  [ButtonAction.AssignDeckAC]: "Assign Deck A/C",
  [ButtonAction.AssignDeckBD]: "Assign Deck B/D",
  [ButtonAction.AssignDeckA]: "Assign Deck A",
  [ButtonAction.AssignDeckB]: "Assign Deck B",
  [ButtonAction.AssignDeckC]: "Assign Deck C",
  [ButtonAction.AssignDeckD]: "Assign Deck D",
  [ButtonAction.ToggleFx1]: "Toggle Fx 1",
  [ButtonAction.ToggleFx2]: "Toggle Fx 2",
  [ButtonAction.ToggleFx3]: "Toggle Fx 3",
  [ButtonAction.LoadTrack]: "Load Track",
  [ButtonAction.ToggleLoop]: "Toggle Loop",
  [ButtonAction.ToggleLoop4]: "Toggle Loop (4 beats)",
  [ButtonAction.LoopDown]: "Decrease Loop Size",
  [ButtonAction.LoopUp]: "Increase Loop Size",
  [ButtonAction.Hotcue1]: "Hotcue 1",
  [ButtonAction.Hotcue2]: "Hotcue 2",
  [ButtonAction.Hotcue3]: "Hotcue 3",
  [ButtonAction.Hotcue4]: "Hotcue 4",
  [ButtonAction.Hotcue5]: "Hotcue 5",
  [ButtonAction.Hotcue6]: "Hotcue 6",
  [ButtonAction.Hotcue7]: "Hotcue 7",
  [ButtonAction.Hotcue8]: "Hotcue 8",
  [ButtonAction.ClearHotcue1]: "Clear Hotcue 1",
  [ButtonAction.ClearHotcue2]: "Clear Hotcue 2",
  [ButtonAction.ClearHotcue3]: "Clear Hotcue 3",
  [ButtonAction.ClearHotcue4]: "Clear Hotcue 4",
  [ButtonAction.ClearHotcue5]: "Clear Hotcue 5",
  [ButtonAction.ClearHotcue6]: "Clear Hotcue 6",
  [ButtonAction.ClearHotcue7]: "Clear Hotcue 7",
  [ButtonAction.ClearHotcue8]: "Clear Hotcue 8",
  [ButtonAction.BeatjumpLeft1]: "Beatjump Left 1",
  [ButtonAction.BeatjumpLeft2]: "Beatjump Left 2",
  [ButtonAction.BeatjumpLeft4]: "Beatjump Left 4",
  [ButtonAction.BeatjumpLeft8]: "Beatjump Left 8",
  [ButtonAction.BeatjumpLeft16]: "Beatjump Left 16",
  [ButtonAction.BeatjumpLeft32]: "Beatjump Left 32",
  [ButtonAction.BeatjumpLeft64]: "Beatjump Left 64",
  [ButtonAction.BeatjumpRight1]: "Beatjump Right 1",
  [ButtonAction.BeatjumpRight2]: "Beatjump Right 2",
  [ButtonAction.BeatjumpRight4]: "Beatjump Right 4",
  [ButtonAction.BeatjumpRight8]: "Beatjump Right 8",
  [ButtonAction.BeatjumpRight16]: "Beatjump Right 16",
  [ButtonAction.BeatjumpRight32]: "Beatjump Right 32",
  [ButtonAction.BeatjumpRight64]: "Beatjump Right 64",
  [ButtonAction.BeatjumpLeftByLoop]: "Beatjump Left by Loop Size",
  [ButtonAction.BeatjumpRightByLoop]: "Beatjump Right by Loop Size",
  [ButtonAction.Cue]: "Cue",
  [ButtonAction.Rev]: "Rev",
  [ButtonAction.Play]: "Play",
  [ButtonAction.Sync]: "Sync",
  [ButtonAction.SkipToStart]: "Skip to Start",
};

function buildSettings({ groups }: { groups: SettingsGroup[] }): string {
  let output: string[] = [];
  output.push(`  <group label="Button Push">`);
  for (const group of groups) {
    output.push(`        <group label="${group.title}">`);
    for (const setting of group.settings) {
      // Regular setting item
      output.push(
        `            <option variable="${setting.name}Push" label="${setting.label}" type="enum">`,
      );
      output.push(makeButtonActionValueItem(setting.push));
      for (const action of BUTTON_ACTIONS_BY_SECTION[setting.section]) {
        if (action !== setting.push) {
          output.push(makeButtonActionValueItem(action));
        }
      }
      output.push(`            </option>`);
    }
    output.push(`        </group>`);
  }
  output.push(`  </group>`);

  output.push(`  <group label="Button SHIFT + Push">`);
  for (const group of groups) {
    output.push(`        <group label="${group.title}">`);
    for (const setting of group.settings) {
      const shiftAction = setting.shiftPush ?? ButtonAction.Inherit;
      output.push(
        `            <option variable="${setting.name}ShiftPush" label="${setting.label}" type="enum">`,
      );
      output.push(makeButtonActionValueItem(shiftAction));
      for (const action of BUTTON_ACTIONS_BY_SECTION[setting.section]) {
        if (action !== shiftAction) {
          output.push(makeButtonActionValueItem(action));
        }
      }
      output.push(`            </option>`);
    }
    output.push(`        </group>`);
  }
  output.push(`  </group>`);

  output.push(`  <group label="Button SUPER + Push">`);
  for (const group of groups) {
    output.push(`        <group label="${group.title}">`);
    for (const setting of group.settings) {
      const superAction = setting.superPush ?? ButtonAction.Inherit;
      output.push(
        `            <option variable="${setting.name}SuperPush" label="${setting.label}" type="enum">`,
      );
      output.push(makeButtonActionValueItem(superAction));
      for (const action of BUTTON_ACTIONS_BY_SECTION[setting.section]) {
        if (action !== superAction) {
          output.push(makeButtonActionValueItem(action));
        }
      }
      output.push(`            </option>`);
    }
    output.push(`        </group>`);
  }
  output.push(`  </group>`);

  output.push(`  <group label="Button SHIFT + SUPER + Push">`);
  for (const group of groups) {
    output.push(`        <group label="${group.title}">`);
    for (const setting of group.settings) {
      const superShiftAction = setting.superShiftPush ?? ButtonAction.Inherit;
      output.push(
        `            <option variable="${setting.name}SuperShiftPush" label="${setting.label}" type="enum">`,
      );
      output.push(makeButtonActionValueItem(superShiftAction));
      for (const action of BUTTON_ACTIONS_BY_SECTION[setting.section]) {
        if (action !== superShiftAction) {
          output.push(makeButtonActionValueItem(action));
        }
      }
      output.push(`            </option>`);
    }
    output.push(`        </group>`);
  }
  output.push(`  </group>`);

  return output.join("\n");
}

function makeButtonActionValueItem(action: ButtonAction): string {
  return `                <value label="${BUTTON_ACTION_LABELS[action]}">${action}</value>`;
}

const output = template.slice().replace(
  ":settings",
  buildSettings({
    groups: [
      {
        title: "Top Buttons",
        settings: [
          {
            kind: "ButtonSetting",
            section: "main",
            name: "top",
            label: "Top Menu Button",
            push: ButtonAction.ToggleDecks,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "assignLeft",
            label: "Assign Left",
            push: ButtonAction.AssignDeckAC,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "assignRight",
            label: "Assign Right",
            push: ButtonAction.AssignDeckBD,
          },
        ],
      },
      {
        title: "FX Controls",
        settings: [
          {
            kind: "ButtonSetting",
            section: "side",
            name: "fxToggle1",
            label: "FX Toggle 1",
            push: ButtonAction.Disabled,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "fxToggle2",
            label: "FX Toggle 2",
            push: ButtonAction.ToggleFx1,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "fxToggle3",
            label: "FX Toggle 3",
            push: ButtonAction.ToggleFx2,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "fxToggle4",
            label: "FX Toggle 4",
            push: ButtonAction.ToggleFx3,
          },
        ],
      },
      {
        title: "Encoders and Shift",
        settings: [
          {
            kind: "ButtonSetting",
            section: "main",
            name: "shift",
            label: "Shift",
            push: ButtonAction.Shift,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "browse",
            label: "Browse Encoder Push",
            push: ButtonAction.LoadTrack,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "loop",
            label: "Loop Encoder Push",
            push: ButtonAction.ToggleLoop,
          },
        ],
      },
      {
        title: "Hotcues and Play Buttons",
        settings: [
          {
            kind: "ButtonSetting",
            section: "side",
            name: "hotcue1",
            label: "Hotcue 1",
            push: ButtonAction.Hotcue1,
            shiftPush: ButtonAction.ClearHotcue1,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "hotcue2",
            label: "Hotcue 2",
            push: ButtonAction.Hotcue2,
            shiftPush: ButtonAction.ClearHotcue2,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "hotcue3",
            label: "Hotcue 3",
            push: ButtonAction.Hotcue3,
            shiftPush: ButtonAction.ClearHotcue3,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "hotcue4",
            label: "Hotcue 4",
            push: ButtonAction.Hotcue4,
            shiftPush: ButtonAction.ClearHotcue4,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "nudgeLeft",
            label: "Nudge Left",
            push: ButtonAction.BeatjumpLeft1,
            shiftPush: ButtonAction.BeatjumpLeftByLoop,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "nudgeRight",
            label: "Nudge Right",
            push: ButtonAction.BeatjumpRight1,
            shiftPush: ButtonAction.BeatjumpRightByLoop,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "cue",
            label: "Cue",
            push: ButtonAction.Cue,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "rev",
            label: "Rev",
            push: ButtonAction.Rev,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "play",
            label: "Play",
            push: ButtonAction.Play,
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "sync",
            label: "Sync",
            push: ButtonAction.Sync,
          },
        ],
      },
    ],
  }),
);

console.log(output.trim());
