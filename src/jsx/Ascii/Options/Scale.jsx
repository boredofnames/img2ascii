import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import { refs } from "../refs";
import styles from "./Options.module.css";

export default function Scale() {
  const [state, { setState, disableHeavyUse, enableHeavyUse }] = useAscii();
  function onInput(e) {
    let scale = +e.currentTarget.value;
    disableHeavyUse();
    setState("scale", (v) => (scale > 2 ? scale : v));
  }

  function onChange(e) {
    let scale = +e.currentTarget.value;
    setState({ scale });
    enableHeavyUse();
  }

  return (
    <Section title="Scale" icon="resize">
      <Option>
        <input
          ref={refs.scale}
          id={styles.scaleRange}
          type="range"
          min={1}
          max={100}
          step={0.2}
          value={state.scale}
          onInput={onInput}
          onChange={onChange}
        />{" "}
        {state?.buffer?.[0]?.length || 0}x{state?.buffer?.length || 0}
      </Option>
      <hr />
    </Section>
  );
}
