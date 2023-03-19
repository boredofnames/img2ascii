import { createEffect, on, Show } from "solid-js";
import { useAscii } from "./context";
import { refs } from "./refs";
import styles from "./Ascii.module.css";
import StatusBanner from "../StatusBanner";
import img2ascii from "@/js/lib/img2ascii";

export default function Ascii() {
  const [state, { setState, setSize }] = useAscii();

  let buffer;

  const i2a = new img2ascii({ useStore: { state, setState } });

  createEffect(
    on(
      () => {
        state.scale;
      },
      () => setSize(),
      { defer: true }
    )
  );

  createEffect(
    on(
      () => {
        state.custom;
      },
      () => setState("density", state.custom),
      { defer: true }
    )
  );

  //needs reprocess
  createEffect(
    on(
      () => {
        state.width;
        state.density;
        state.colorDepth;
        state.chromaKeyHue;
        state.chromaRange;
        state.quant;
        state.useQuant;
        state.useDither;
        state.useChroma;
        state.palette;
        state.usePadding;
        state.padding;
      },
      () => {
        if (!state.image) return;
        const [data, length] = i2a.getPixelData(refs.preview);
        [buffer] = i2a.process(data, length);
        refs.output.innerHTML = i2a.getAsciiText(buffer);
      },
      { defer: true }
    )
  );

  //no need to reprocess, just draw
  createEffect(
    on(
      () => {
        state.useColors;
        state.useTermCodes;
        state.termCodes;
      },
      () => {
        if (!buffer) return;
        refs.output.innerHTML = i2a.getAsciiText(buffer);
      },
      { defer: true }
    )
  );

  return (
    <div class={styles.Ascii}>
      <div class={styles.container}>
        <StatusBanner />
        <Show when={state.image !== undefined}>
          <div
            class={styles.preview}
            style={{ display: state.showPreviews ? "block" : "none" }}
          >
            <img
              id="preview"
              ref={refs.preview}
              src={state.image}
              alt="image"
            />
            <Show when={state.quant}>
              <img
                ref={refs.quant}
                src={state.quant}
                alt="quant"
                style={{ display: state.useQuant ? "block" : "none" }}
              />
            </Show>
          </div>
        </Show>
        <div
          ref={refs.output}
          class={styles.output}
          style={`background-color: ${
            state.useBG ? state.bgColor : "transparent"
          }`}
        />
      </div>
    </div>
  );
}
