import { For, Show } from "solid-js";
import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import { termCodes } from "@/js/lib/img2ascii";

export default function Colors() {
  const [state, { setState }] = useAscii();

  function onUseTermCodes(e) {
    setState("useTermCodes", e.currentTarget.checked);
  }

  function onTermCodes(e) {
    setState("termCodes", e.currentTarget.value);
  }

  function onShowColors(e) {
    setState("showColors", e.currentTarget.checked);
  }
  function onUseColors(e) {
    setState({
      useColors: e.currentTarget.checked,
      useTermCodes: e.currentTarget.checked === false && false,
    });
  }

  return (
    <Section
      title="Colors"
      option={
        <input
          checked={state.useColors}
          type="checkbox"
          onChange={onUseColors}
        />
      }
      icon="format_paint"
    >
      <Show when={state.useColors}>
        <Option title="Color Count">{state.colors.length}</Option>
        <Option title="Show Colors">
          <input
            checked={state.showColors}
            type="checkbox"
            onChange={onShowColors}
          />
        </Option>
        <Show when={state.showColors}>
          <Option>
            <pre>{JSON.stringify(state.colors, null, 2)}</pre>
          </Option>
        </Show>
        <Option title="Embed Term Codes">
          <input
            checked={state.useTermCodes}
            type="checkbox"
            onChange={onUseTermCodes}
          />
        </Option>
        <Show when={state.useTermCodes}>
          <Option>
            <select onChange={onTermCodes} value={state.termCodes}>
              <For each={termCodes}>
                {(set) => <option value={set}>{set}</option>}
              </For>
            </select>
          </Option>
        </Show>
      </Show>
      <hr />
    </Section>
  );
}
