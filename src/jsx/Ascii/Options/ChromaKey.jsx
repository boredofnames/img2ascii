import { Show } from "solid-js";
import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import Color from "colorjs.io/dist/color";

export default function ChromaKey() {
  const [state, { setState }] = useAscii();
  function onUseChroma(e) {
    setState({
      useChroma: e.currentTarget.checked,
    });
  }

  function onChroma(e) {
    let hue = new Color(e.currentTarget.value).hsl.h;
    if (isNaN(hue)) hue = false;
    setState({
      chromaKey: e.currentTarget.value,
      chromaKeyHue: hue === 0 ? 360 : hue,
    });
  }
  return (
    <Section
      title="Chroma Key"
      option={
        <input
          checked={state.useChroma}
          type="checkbox"
          onChange={onUseChroma}
        />
      }
      icon="format_color_reset"
    >
      <Show when={state.useChroma}>
        <Option title="Color">
          <input type="color" value={state.chromaKey} onInput={onChroma} />
        </Option>
        <Option title="Range">
          <input
            type="range"
            min="1"
            max="40"
            value={state.chromaRange}
            onInput={(e) => setState("chromaRange", +e.target.value)}
          />{" "}
          {state.chromaRange}
        </Option>
      </Show>
      <hr />
    </Section>
  );
}
