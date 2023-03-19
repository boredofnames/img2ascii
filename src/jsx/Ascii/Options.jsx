import { useAscii } from "./context";
import { termCodes } from "@/js/lib/img2ascii";
import { refs } from "./refs";
import { orderDensity } from "@/js/lib/surface-area";
import chroma from "chroma-js";
import { createMemo, For, Show } from "solid-js";
import styles from "./Ascii.module.css";
import { toPng, toJpeg } from "html-to-image";
import { STATUS_CODES } from "../StatusBanner";
import { readImagePromise } from "@/js/lib/readImage";
import storage from "@/js/lib/storage";
import { charSets } from "@/js/lib/img2ascii";

function Section(props) {
  return (
    <div class={styles.Section}>
      <h3>
        {props.title} {props.option && props.option}
      </h3>
      {props.children}
    </div>
  );
}

function Option(props) {
  return (
    <div class={styles.Option}>
      {props.title && props.title + ": "}
      {props.children}
    </div>
  );
}

export default function Options() {
  const [state, { setState, setSize, updateCharSets }] = useAscii();

  let colorDepths = [2, 3, 4, 5, 6, 8, 9, 12, 18];

  const paletteNames = createMemo(() => Object.keys(state.palettes));

  function onDensityChange(e) {
    let value = e.currentTarget.value;
    if (value === "custom")
      setState({ showCustom: true, density: state.custom });
    else if (value === "custom-from")
      setState({ showCustom: true, custom: state.density });
    else setState({ showCustom: false, density: value });
  }

  function onUseColors(e) {
    setState({
      useColors: e.currentTarget.checked,
      useTermCodes: e.currentTarget.checked === false && false,
    });
  }

  function onUseQuant(e) {
    setState({
      useQuant: e.currentTarget.checked,
    });
  }
  function onUseDither(e) {
    setState({
      useDither: e.currentTarget.checked,
    });
  }

  function onUsePadding(e) {
    setState({
      usePadding: e.currentTarget.checked,
    });
  }

  function onUseBG(e) {
    setState({
      useBG: e.currentTarget.checked,
    });
  }

  function onUseChroma(e) {
    setState({
      useChroma: e.currentTarget.checked,
    });
  }

  function onColorDepth(e) {
    let value = e.currentTarget.value;
    setState("colorDepth", +value);
  }

  function onPalette(e) {
    let value = e.currentTarget.value;
    setState("palette", value === "undefined" ? undefined : value);
  }

  function onUseTermCodes(e) {
    setState("useTermCodes", e.currentTarget.checked);
  }

  function onTermCodes(e) {
    setState("termCodes", e.currentTarget.value);
  }

  function onShowPreviews(e) {
    setState("showPreviews", e.currentTarget.checked);
  }

  function onShowColors(e) {
    setState("showColors", e.currentTarget.checked);
  }

  function onChroma(e) {
    let hue = chroma(e.currentTarget.value).get("hsl.h");
    if (isNaN(hue)) hue = false;
    setState({
      chromaKey: e.currentTarget.value,
      chromaKeyHue: hue === 0 ? 360 : hue,
    });
  }

  function sortCharSet() {
    setState("custom", orderDensity(state.custom));
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

  function onBG(e) {
    setState("bgColor", e.currentTarget.value);
  }

  function getTitle() {
    let date = new Date();
    return `ascii-art-${date
      .toLocaleDateString()
      .replace(
        /\//g,
        ""
      )}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
  }

  function download(data, type) {
    let name = window.prompt("Name?", getTitle()),
      isBlob = ["txt", "html"].includes(type),
      url;

    if (!name) return;
    if (isBlob) {
      let blob = new Blob([data], {
        type: type === "html" ? "octet/stream" : "text/plain;charset=utf-8",
      });
      url = window.URL.createObjectURL(blob);
    }

    let link = document.createElement("a");
    link.download = name + "." + type;
    link.href = isBlob ? url : data;
    link.click();
    isBlob && window.URL.revokeObjectURL(url);
  }

  function wrapHTML(html) {
    return `<div style="white-space: pre; font-family: monospace; line-height: 1; height: fit-content;">${html}</div>`;
  }

  function onError(readable, err) {
    console.error(err);
    setState("status", {
      code: STATUS_CODES.ERROR,
      msg: readable,
      time: 5000,
    });
  }

  function onSave(type) {
    if (["jpeg", "png"].includes(type))
      setState("status", {
        code: STATUS_CODES.MESSAGE,
        msg: "Generating image from dom!",
        time: 2000,
      });
    setTimeout(() => {
      switch (type) {
        case "txt":
          download(refs.output.innerText, type);
          break;
        case "html":
          download(wrapHTML(refs.output.innerHTML), type);
          break;
        case "jpeg":
          toJpeg(refs.output)
            .then((data) => download(data, type))
            .catch((err) =>
              onError(
                "Failed to get image from dom! Try Chromium for large images.",
                err
              )
            );
          break;
        default:
          toPng(refs.output)
            .then((data) => download(data, type))
            .catch((err) =>
              onError(
                "Failed to get image from dom! Try Chromium for large images.",
                err
              )
            );
          break;
      }
    }, 10);
  }

  function onCopy() {
    navigator.clipboard.writeText(refs.output.innerText);
    setState("status", {
      code: STATUS_CODES.SUCCESS,
      msg: "Copied to clipboard!",
      time: 2000,
    });
  }

  function loadImage() {
    setState("status", {
      code: STATUS_CODES.MESSAGE,
      msg: "Loading...",
      time: 5000,
    });
    readImagePromise(refs.uploader.files[0])
      .then((result) => {
        let success = {
          code: STATUS_CODES.SUCCESS,
          msg: "Loaded Image",
          time: 1000,
        };
        setState({
          status: success,
          image: result.data,
          imageWidth: result.width,
          imageHeight: result.height,
          scale: 15.6,
        });
        setSize();
      })
      .catch((err) => {
        onError("Failed to load image! ", err);
      });

    refs.uploader.files = new DataTransfer().files;
    refs.uploader.value = "";
  }
  return (
    <div class={styles.Options}>
      <h2>Options</h2>
      <Section title="Upload">
        <Option>
          <input ref={refs.uploader} type="file" onChange={loadImage} />
          {/* or
        <input ref={url} placeholder="Image URL" /> */}
        </Option>
        <Option title="Previews">
          <input
            checked={state.showPreviews}
            type="checkbox"
            onChange={onShowPreviews}
          />
        </Option>
      </Section>
      <Section title="Scale">
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
      <Section title="CharSet">
        <Option>
          <select onChange={onDensityChange} value={state.density}>
            <For each={state.charSets}>
              {(set) => <option value={set}>{set}</option>}
            </For>
            <option value="custom">custom</option>
            <option value="custom-from">custom-from</option>
          </select>
          <Show when={!charSets.includes(state.density)}>
            <button onClick={deleteCharSet}>Delete</button>
          </Show>
        </Option>
        <Show when={state.showCustom}>
          <Section title="Custom Chars">
            <Option>
              <input
                ref={refs.customCharSet}
                value={state.custom}
                onChange={(e) => setState("custom", e.currentTarget.value)}
              />
            </Option>
            <Option>
              <button onClick={sortCharSet}>Order</button>
              <button onClick={saveCharSet}>Save</button>
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
              onInput={(e) => setState("padding", +e.target.value)}
            />{" "}
            {state.padding}
          </Option>
        </Show>
      </Section>
      <Section
        title="Colors"
        option={
          <input
            checked={state.useColors}
            type="checkbox"
            onChange={onUseColors}
          />
        }
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
      </Section>
      <Section
        title="BG Color"
        option={
          <input checked={state.useBG} type="checkbox" onChange={onUseBG} />
        }
      >
        <Show when={state.useBG}>
          <Option title="BG">
            <input type="color" value={state.bgColor} onInput={onBG} />
          </Option>
        </Show>
      </Section>

      <Section
        title="Quantization"
        option={
          <input
            checked={state.useQuant}
            type="checkbox"
            onChange={onUseQuant}
          />
        }
      >
        <Show when={state.useQuant}>
          <Option title="Use Dither">
            <input
              checked={state.useDither}
              type="checkbox"
              onChange={onUseDither}
            />
          </Option>
          <Option title="Depth">
            <select value={state.colorDepth} onChange={onColorDepth}>
              {/* <option value={undefined}>off</option> */}
              <For each={colorDepths}>
                {(depth) => <option value={depth}>{depth}</option>}
              </For>
            </select>
          </Option>
          <Option title="Palette">
            <select value={state.palette} onChange={onPalette}>
              <option value={undefined}>none</option>
              <For each={paletteNames()}>
                {(palette) => <option value={palette}>{palette}</option>}
              </For>
            </select>
          </Option>
        </Show>
      </Section>
      <Section
        title="Chroma Key"
        option={
          <input
            checked={state.useChroma}
            type="checkbox"
            onChange={onUseChroma}
          />
        }
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
      </Section>
      <Section title="Save">
        <Option>
          <button onClick={() => onSave("txt")}>Text</button>
          <button onClick={() => onSave("html")}>HTML</button>
        </Option>
        <Option>
          <button onClick={() => onSave("jpeg")}>JPEG</button>
          <button onClick={() => onSave("png")}>PNG</button>
        </Option>
        <Option>
          <button onClick={onCopy}>Copy to clipboard</button>
        </Option>
      </Section>
      {/* <p style={"white-space: pre-wrap; text-align: left"}>
        {JSON.stringify(state, null, 2)}
      </p> */}
    </div>
  );
}
