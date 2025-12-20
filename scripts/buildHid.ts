import type { ButtonActionName } from "../src/ButtonAction";

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
  push: ButtonActionName;
  shiftPush?: ButtonActionName;
  superPush?: ButtonActionName;
  superShiftPush?: ButtonActionName;
};

const BUTTON_ACTIONS_BY_SECTION: {
  main: ButtonActionName[];
  side: ButtonActionName[];
} = {
  main: ["disabled", "shift", "super", "toggleDecks"],
  side: [
    "disabled",
    "shift",
    "super",
    "assignDeckAC",
    "assignDeckBD",
    "assignDeckA",
    "assignDeckB",
    "assignDeckC",
    "assignDeckD",
    "toggleFx1",
    "toggleFx2",
    "toggleFx3",
    "loadTrack",
    "toggleLoop",
    "toggleLoop4",
    "hotcue1",
    "hotcue2",
    "hotcue3",
    "hotcue4",
    "hotcue5",
    "hotcue6",
    "hotcue7",
    "hotcue8",
    "clearHotcue1",
    "clearHotcue2",
    "clearHotcue3",
    "clearHotcue4",
    "clearHotcue5",
    "clearHotcue6",
    "clearHotcue7",
    "clearHotcue8",
    "beatjumpForward1",
    "beatjumpForward2",
    "beatjumpForward4",
    "beatjumpForward8",
    "beatjumpForward16",
    "beatjumpForward32",
    "beatjumpForward64",
    "beatjumpForwardLoop",
    "beatjumpBackward1",
    "beatjumpBackward2",
    "beatjumpBackward4",
    "beatjumpBackward8",
    "beatjumpBackward16",
    "beatjumpBackward32",
    "beatjumpBackward64",
    "beatjumpBackwardLoop",
    "cue",
    "rev",
    "play",
    "sync",
    "skipToStart",
  ],
};

const BUTTON_ACTION_LABELS: Record<ButtonActionName, string> = {
  disabled: "Disabled",
  shift: "Shift",
  super: "Super",
  toggleDecks: "Toggle Decks AC/BD",
  assignDeckAC: "Assign Deck A/C",
  assignDeckBD: "Assign Deck B/D",
  assignDeckA: "Assign Deck A",
  assignDeckB: "Assign Deck B",
  assignDeckC: "Assign Deck C",
  assignDeckD: "Assign Deck D",
  toggleFx1: "Toggle Fx 1",
  toggleFx2: "Toggle Fx 2",
  toggleFx3: "Toggle Fx 3",
  loadTrack: "Load Track",
  toggleLoop: "Toggle Loop",
  toggleLoop4: "Toggle Loop (4 beats)",
  hotcue1: "Hotcue 1",
  hotcue2: "Hotcue 2",
  hotcue3: "Hotcue 3",
  hotcue4: "Hotcue 4",
  hotcue5: "Hotcue 5",
  hotcue6: "Hotcue 6",
  hotcue7: "Hotcue 7",
  hotcue8: "Hotcue 8",
  clearHotcue1: "Clear Hotcue 1",
  clearHotcue2: "Clear Hotcue 2",
  clearHotcue3: "Clear Hotcue 3",
  clearHotcue4: "Clear Hotcue 4",
  clearHotcue5: "Clear Hotcue 5",
  clearHotcue6: "Clear Hotcue 6",
  clearHotcue7: "Clear Hotcue 7",
  clearHotcue8: "Clear Hotcue 8",
  beatjumpForward1: "Beatjump Forward 1",
  beatjumpForward2: "Beatjump Forward 2",
  beatjumpForward4: "Beatjump Forward 4",
  beatjumpForward8: "Beatjump Forward 8",
  beatjumpForward16: "Beatjump Forward 16",
  beatjumpForward32: "Beatjump Forward 32",
  beatjumpForward64: "Beatjump Forward 64",
  beatjumpForwardLoop: "Beatjump Forward by Loop Size",
  beatjumpBackward1: "Beatjump Backward 1",
  beatjumpBackward2: "Beatjump Backward 2",
  beatjumpBackward4: "Beatjump Backward 4",
  beatjumpBackward8: "Beatjump Backward 8",
  beatjumpBackward16: "Beatjump Backward 16",
  beatjumpBackward32: "Beatjump Backward 32",
  beatjumpBackward64: "Beatjump Backward 64",
  beatjumpBackwardLoop: "Beatjump Backward by Loop Size",
  cue: "Cue",
  rev: "Rev",
  play: "Play",
  sync: "Sync",
  skipToStart: "Skip to Start",
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
      const shiftAction = setting.shiftPush;
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
      const superAction = setting.superPush;
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
      const superShiftAction = setting.superShiftPush;
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

function makeButtonActionValueItem(
  action: ButtonActionName | undefined,
): string {
  const label = action ? BUTTON_ACTION_LABELS[action] : "Inherit";
  return `                <value label="${label}">${action ?? "inherit"}</value>`;
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
            push: "toggleDecks",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "assignLeft",
            label: "Assign Left",
            push: "assignDeckAC",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "assignRight",
            label: "Assign Right",
            push: "assignDeckBD",
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
            push: "disabled",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "fxToggle2",
            label: "FX Toggle 2",
            push: "toggleFx1",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "fxToggle3",
            label: "FX Toggle 3",
            push: "toggleFx2",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "fxToggle4",
            label: "FX Toggle 4",
            push: "toggleFx3",
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
            push: "shift",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "browse",
            label: "Browse Encoder Push",
            push: "loadTrack",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "loop",
            label: "Loop Encoder Push",
            push: "toggleLoop",
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
            push: "hotcue1",
            shiftPush: "clearHotcue1",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "hotcue2",
            label: "Hotcue 2",
            push: "hotcue2",
            shiftPush: "clearHotcue2",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "hotcue3",
            label: "Hotcue 3",
            push: "hotcue3",
            shiftPush: "clearHotcue3",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "hotcue4",
            label: "Hotcue 4",
            push: "hotcue4",
            shiftPush: "clearHotcue4",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "nudgeLeft",
            label: "Nudge Left",
            push: "beatjumpBackward1",
            shiftPush: "beatjumpBackwardLoop",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "nudgeRight",
            label: "Nudge Right",
            push: "beatjumpForward1",
            shiftPush: "beatjumpForwardLoop",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "cue",
            label: "Cue",
            push: "cue",
            shiftPush: "cue",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "rev",
            label: "Rev",
            push: "rev",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "play",
            label: "Play",
            push: "play",
          },
          {
            kind: "ButtonSetting",
            section: "side",
            name: "sync",
            label: "Sync",
            push: "sync",
          },
        ],
      },
    ],
  }),
);

console.log(output.trim());
