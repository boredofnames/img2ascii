import { For, Show } from "solid-js";
import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import Icon from "@/jsx/Common/Icon";
import { refs } from "../refs";
import { STATUS_CODES } from "@/jsx/StatusBanner";
import storage from "@/js/lib/storage";
import styles from "./Options.module.css";
import Color from "colorjs.io/dist/color";

function PaletteColor(props) {
  return (
    <div
      onClick={() => props.removePaletteColor(props.color)}
      style={{
        "background-color": props.color,
        width: "20px",
        height: "10px",
        border: "1px solid white",
      }}
    />
  );
}

export default function CustomPalette() {
  const [state, { setState, updatePalettes }] = useAscii();

  function addPaletteColor() {
    let color = new Color(refs.customPaletteColor.value).to("srgb");

    setState("palettes", (current) => ({
      ...current,
      custom: [
        ...current.custom,
        [255 * color.r, 255 * color.g, 255 * color.b],
      ],
    }));
  }

  function removePaletteColor(color) {
    console.log(color);
    setState("palettes", (current) => ({
      ...current,
      custom: current.custom.filter(
        (rgb) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` !== color
      ),
    }));
  }

  function savePalette() {
    let customPalettes = storage.get("customPalettes") || {},
      name = refs.customPaletteName.value,
      updated = {
        ...customPalettes,
        ...{ [name]: state.palettes.custom },
      };

    if (customPalettes[name]) {
      let accept = confirm(name + " already exists. Overwrite?");
      if (!accept)
        return setState("status", {
          code: STATUS_CODES.ERROR,
          msg: "Canceled save.",
          time: 2000,
        });
    }

    storage.set("customPalettes", updated);
    updatePalettes();
    setState("status", {
      code: STATUS_CODES.SUCCESS,
      msg: "Saved Custom Palette!",
      time: 2000,
    });
  }
  return (
    <Show when={state.showCustomPalette}>
      <Section title="Custom Palette" icon="palette">
        <Option>
          <input ref={refs.customPaletteName} value="palette-name" />
          <button title="Save" class={styles.plainButton} onClick={savePalette}>
            <Icon name="save" size={24} />
          </button>
        </Option>

        <Option>
          <input
            ref={refs.customPaletteColor}
            type="color"
            onChange={addPaletteColor}
          />
        </Option>
        <Option>
          <For each={state.palettes.custom}>
            {(color) => (
              <PaletteColor
                color={`rgb(${color[0]},${color[1]},${color[2]})`}
                removePaletteColor={removePaletteColor}
              />
            )}
          </For>
        </Option>
      </Section>
    </Show>
  );
}
