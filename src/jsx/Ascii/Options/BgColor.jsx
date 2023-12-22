import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";

export default function BgColor() {
  const [state, { setState }] = useAscii();
  function onBG(e) {
    setState("bgColor", e.currentTarget.value);
  }
  function onUseBG(e) {
    setState({
      useBG: e.currentTarget.checked,
    });
  }
  return (
    <Section
      title="BG Color"
      option={
        <input checked={state.useBG} type="checkbox" onChange={onUseBG} />
      }
      icon="format_color_fill"
    >
      <Show when={state.useBG}>
        <Option title="BG">
          <input type="color" value={state.bgColor} onInput={onBG} />
        </Option>
      </Show>
      <hr />
    </Section>
  );
}
