import { createEffect, createSignal, on, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { useAscii, refs } from "./context";
import Options from "./Options";
import styles from "./Ascii.module.css";

import StatusBanner from "../StatusBanner";

export default function Ascii() {
  const [state, { setState, setSize }] = useAscii();

  const [portaled, setPortaled] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);

  let buffer;

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
        const [data, length] = state.i2a.getPixelData(refs.preview);
        let colors;
        [buffer, colors] = state.i2a.process(data, length);
        setState("colors", colors);
        refs.output.innerHTML = state.i2a.getAsciiText(buffer);
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
        refs.output.innerHTML = state.i2a.getAsciiText(buffer);
      },
      { defer: true }
    )
  );

  onMount(() => {
    if (portaled()) return;
    setMounted(true);
  });

  return (
    <div class={styles.Ascii}>
      <Show when={mounted()}>
        {setPortaled(true)}
        <Portal mount={document.querySelector("#sidebar")}>
          <Options />
        </Portal>
      </Show>

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
                src={state.i2a.quant}
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
