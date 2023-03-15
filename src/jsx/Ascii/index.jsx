import { rgb } from "chroma-js";
import { createEffect, createSignal, For, on, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { getDistance, map, nearest } from "../../js/lib/utils";
import { useAscii, refs, palettes } from "./context";
import Options from "./Options";
import styles from "./Ascii.module.css";
import RgbQuant from "rgbquant";

export default function Ascii() {
  const [state, { setState, setSize }] = useAscii();

  const [portaled, setPortaled] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);

  let buffer, lastColorCode;

  function quantize(canvas) {
    let ctx = canvas.getContext("2d");
    let opts = {
        colors: Math.pow(2, state.colorDepth || 3),
        palette: palettes[state.palette],
        reIndex: true,
        useCache: false,
      },
      dither = {
        dithKern: "FloydSteinberg",
        dithDelta: 0.05,
      },
      noPalette = {
        method: 1,
        initColors: state.colorDepth === 18 ? 262144 : 4096,
        minHueCols: 0,
        reIndex: false,
        useCache: true,
      };
    if (state.useDither) Object.assign(opts, dither);
    if (!state.palette) Object.assign(opts, noPalette);

    console.log("quant with", opts);
    let q = new RgbQuant(opts.removeEmpties());
    console.time("quant");
    q.sample(canvas);
    let pal = q.palette();
    let reduced = q.reduce(canvas);
    console.timeEnd("quant");
    let imgData = ctx.createImageData(state.width, state.height);
    imgData.data.set(reduced);
    ctx.putImageData(imgData, 0, 0);
    setState({ quant: canvas.toDataURL() });
    return [imgData.data, imgData.data.length];
  }

  function getPixelData() {
    let canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d"),
      data,
      length;
    canvas.width = state.width;
    canvas.height = state.height;

    ctx.drawImage(refs.preview, 0, 0, state.width, state.height);

    if (state.useQuant) {
      [data, length] = quantize(canvas);
    } else {
      const frame = ctx.getImageData(0, 0, state.width, state.height);
      data = frame.data;
      length = data.length;
    }

    return [data, length];
  }

  function getColor(r, g, b, a) {
    return a === 0 ? [0, 0, 0] : [r, g, b];
  }

  function getColorString(color) {
    let [r, g, b] = color;
    return `rgb(${r},${g},${b})`;
  }

  function getColorCode(color) {
    if (state.termCodes === "fastfetch") {
      let index = state.colors.indexOf(getColorString(color)) + 1;
      if (index === lastColorCode) return "";
      lastColorCode = index;
      return "$" + index;
    } else if (state.termCodes === "ansi") {
      let [r, g, b] = color;
      let code = `\\033[38;2;${r};${g};${b}m`;
      if (code === lastColorCode) return "";
      lastColorCode = code;
      return code;
    }
  }

  function drawAsciiText(buffer) {
    let text = "";
    lastColorCode = undefined;
    for (let y = 0, len = buffer.length; y < len; y++) {
      for (let x = 0, len = buffer[y].length; x < len; x++) {
        let char = buffer[y][x][0],
          color = buffer[y][x][1];

        text += state.useColors
          ? `<span style="color: ${getColorString(color)}">${
              state.useTermCodes === true
                ? state.termCodes === "fastfetch"
                  ? char === "$"
                    ? getColorCode(color) + "$$"
                    : getColorCode(color) + char
                  : getColorCode(color) + char
                : char
            }</span>`
          : char;
      }
      text += "\n";
    }
    refs.output.innerHTML = text;
  }

  function process(data, length) {
    let buffer = [];
    let colors = new Set();
    for (let i = 0; i < length; i += 4) {
      const r = data[i + 0];
      const g = data[i + 1];
      const b = data[i + 2];

      const a =
        state.chromaKeyHue &&
        getDistance(
          state.colorDepth
            ? rgb(
                nearest(r, state.colorDepth),
                nearest(g, state.colorDepth),
                nearest(b, state.colorDepth)
              ).get("hsl.h")
            : rgb(r, g, b).get("hsl.h"),
          state.chromaKeyHue
        ) <= state.chromaRange
          ? 0
          : 255;

      const density = state.usePadding
        ? state.density.padStart(state.density.length + state.padding, " ")
        : state.density;

      const avg = Math.floor((r + g + b) / 3);
      const len = density.length;
      const charIndex = Math.floor(map(avg, 0, 256, 0, len));
      const c = a === 0 && state.usePadding ? " " : density.charAt(charIndex);
      const x = (i / 4) % state.width;
      const y = Math.floor(i / 4 / state.width);

      const color = getColor(r, g, b, a);
      colors.add(getColorString(color));

      buffer[y] = buffer[y] || [];
      buffer[y][x] = [c, color];
    }

    setState("colors", Array.from(colors));
    return buffer;
  }

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
        state.palette;
        state.usePadding;
        state.padding;
      },
      () => {
        let [data, length] = getPixelData();
        buffer = process(data, length);
        drawAsciiText(buffer);
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
        if (buffer) drawAsciiText(buffer);
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
        <div ref={refs.output} class={styles.output} />
      </div>
    </div>
  );
}
