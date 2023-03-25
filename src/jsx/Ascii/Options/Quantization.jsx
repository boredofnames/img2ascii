import { createMemo, For, Show } from "solid-js";
import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import Icon from "@/jsx/Common/Icon";
import { palettes } from "@/js/lib/img2ascii/palettes";
import { filterObject } from "@/js/lib/utils";
import { STATUS_CODES } from "@/jsx/StatusBanner";
import storage from "@/js/lib/storage";
import styles from "./Options.module.css";

export default function Quantization() {
  const [state, { setState, updatePalettes }] = useAscii();

  let colorDepths = [2, 3, 4, 5, 6, 8, 9, 12, 18];

  const paletteNames = createMemo(() => Object.keys(state.palettes));

  function onUseQuant(e) {
    setState({
      useQuant: e.currentTarget.checked,
    });
  }
  function onUseDither(e) {
    setState({
      useDither: e.currentTarget.checked,
    });
  }

  function onColorDepth(e) {
    let value = e.currentTarget.value;
    setState("colorDepth", +value);
  }

  function onPalette(e) {
    let value = e.currentTarget.value;

    setState({
      showCustomPalette: value === "custom" ? true : false,
      palette: value === "undefined" ? undefined : value,
    });
  }
  function deletePalette() {
    let customPalettes = storage.get("customPalettes") || {},
      updated = filterObject(customPalettes, (name) => name !== state.palette);
    if (updated[state.palette])
      return setState("status", {
        code: STATUS_CODES.ERROR,
        msg: "Couldn't delete...? Wah wah..",
        time: 2000,
      });
    storage.set("customPalettes", updated);
    updatePalettes();
    setState("status", {
      code: STATUS_CODES.SUCCESS,
      msg: "Deleted Custom Palette!",
      time: 2000,
    });
  }
  return (
    <Section
      title="Quantization"
      option={
        <input checked={state.useQuant} type="checkbox" onChange={onUseQuant} />
      }
      icon="compress"
    >
      <Show when={state.useQuant}>
        <Option title="Use Dither">
          <input
            checked={state.useDither}
            type="checkbox"
            onChange={onUseDither}
          />
        </Option>
        <Option title="Depth">
          <select value={state.colorDepth} onChange={onColorDepth}>
            {/* <option value={undefined}>off</option> */}
            <For each={colorDepths}>
              {(depth) => <option value={depth}>{depth}</option>}
            </For>
          </select>
        </Option>
        <Option title="Palette">
          <select value={state.palette} onChange={onPalette}>
            <option value={undefined}>none</option>
            <For each={paletteNames()}>
              {(palette) => <option value={palette}>{palette}</option>}
            </For>
          </select>
          <Show when={!palettes[state.palette]}>
            <button
              title="Delete"
              class={styles.plainButton}
              onClick={deletePalette}
            >
              <Icon name="delete" size={24} />
            </button>
          </Show>
        </Option>
      </Show>
    </Section>
  );
}
