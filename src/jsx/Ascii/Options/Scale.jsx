import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import { refs } from "../refs";

export default function Scale() {
  const [state, { setState }] = useAscii();

  return (
    <Section title="Scale" icon="resize">
      <Option>
        <input
          ref={refs.scale}
          type="range"
          min={1}
          max={100}
          step={0.2}
          value={state.scale}
          onChange={(e) => setState("scale", +e.currentTarget.value)}
        />{" "}
        {state.scale}
      </Option>
    </Section>
  );
}
