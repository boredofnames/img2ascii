import { For, Show } from "solid-js";
import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import { orderDensity } from "@/js/lib/surface-area";
import { charSets } from "@/js/lib/img2ascii";
import { refs } from "../refs";
import { STATUS_CODES } from "@/jsx/StatusBanner";
import storage from "@/js/lib/storage";
import styles from "./Options.module.css";
import Icon from "@/jsx/Common/Icon";

export default function CharSet() {
  const [state, { setState, updateCharSets, enableHeavyUse, disableHeavyUse }] =
    useAscii();

  function sortCharSet() {
    setState("customCharSet", orderDensity(state.customCharSet));
  }

  function saveCharSet() {
    let customCharSets = storage.get("customCharSets") || [],
      updated = [...new Set([...customCharSets, refs.customCharSet.value])];
    if (customCharSets.length === updated.length)
      return setState("status", {
        code: STATUS_CODES.ERROR,
        msg: "Didn't save. Maybe it already exists? Wah wah..",
        time: 2000,
      });
    storage.set("customCharSets", updated);
    updateCharSets();
    setState("status", {
      code: STATUS_CODES.SUCCESS,
      msg: "Saved Custom CharSet!",
      time: 2000,
    });
  }

  function deleteCharSet() {
    let customCharSets = storage.get("customCharSets") || [],
      updated = customCharSets.filter((set) => set !== state.density);
    if (customCharSets.length === updated.length)
      return setState("status", {
        code: STATUS_CODES.ERROR,
        msg: "Couldn't delete...? Wah wah..",
        time: 2000,
      });
    storage.set("customCharSets", updated);
    updateCharSets();
    setState("status", {
      code: STATUS_CODES.SUCCESS,
      msg: "Deleted Custom CharSet!",
      time: 2000,
    });
  }
  function onDensityChange(e) {
    let value = e.currentTarget.value;
    if (value === "custom")
      setState({ showCustomCharSet: true, density: state.customCharSet });
    else if (value === "custom-from")
      setState({ showCustomCharSet: true, customCharSet: state.density });
    else setState({ showCustomCharSet: false, density: value });
  }
  function onUsePadding(e) {
    setState({
      usePadding: e.currentTarget.checked,
    });
  }

  function onPaddingInput(e) {
    disableHeavyUse();
    setState("padding", +e.target.value);
  }
  function onPaddingChange() {
    enableHeavyUse();
  }

  return (
    <Section title="CharSet" icon="abc">
      <Option>
        <select onChange={onDensityChange} value={state.density}>
          <For each={state.charSets}>
            {(set) => <option value={set}>{set}</option>}
          </For>
          <option value="custom">custom</option>
          <option value="custom-from">custom-from</option>
        </select>
        <Show when={!charSets.includes(state.density)}>
          <button
            title="Delete"
            class={styles.plainButton}
            onClick={deleteCharSet}
          >
            <Icon name="delete" size={24} />
          </button>
        </Show>
      </Option>
      <Show when={state.showCustomCharSet}>
        <Section title="Custom Chars" icon="tune">
          <Option>
            <input
              ref={refs.customCharSet}
              value={state.customCharSet}
              onChange={(e) => setState("customCharSet", e.currentTarget.value)}
            />
            <button
              title="Sort Chars"
              class={styles.plainButton}
              onClick={sortCharSet}
            >
              <Icon name="sort" size={24} />
            </button>
            <button
              title="Save"
              class={styles.plainButton}
              onClick={saveCharSet}
            >
              <Icon name="save" size={24} />
            </button>
          </Option>
        </Section>
      </Show>
      <Option title="Space for black">
        <input
          checked={state.usePadding}
          type="checkbox"
          onChange={onUsePadding}
        />
      </Option>
      <Show when={state.usePadding}>
        <Option title="Padding">
          <input
            type="range"
            min="1"
            max="100"
            value={state.padding}
            onInput={onPaddingInput}
            onChange={onPaddingChange}
            onMouseUp={onPaddingChange}
          />{" "}
          {state.padding}
        </Option>
      </Show>
      <hr />
    </Section>
  );
}
