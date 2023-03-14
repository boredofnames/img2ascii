import { useAscii, refs, charSets, palettes } from "./context";
import { orderDensity } from "../../js/lib/surface-area";
import chroma from "chroma-js";
import { For, Show } from "solid-js";
import styles from "./Ascii.module.css";
import domtoimage from "dom-to-image";
import { style } from "solid-js/web";

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
  const [state, { setState, setSize }] = useAscii();

  let colorDepths = [2, 3, 4, 5, 6, 8, 9, 12, 18];

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
      termCodes: e.currentTarget.checked === false && false,
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

  function onColorDepth(e) {
    let value = e.currentTarget.value;
    setState("colorDepth", +value);
  }

  function onPalette(e) {
    let value = e.currentTarget.value;
    setState("palette", value === "undefined" ? undefined : value);
  }

  function onTermCodes(e) {
    setState("termCodes", e.currentTarget.checked);
  }

  function onShowPreviews(e) {
    setState("showPreviews", e.currentTarget.checked);
  }

  function onShowColors(e) {
    setState("showColors", e.currentTarget.checked);
  }

  function sortCustom() {
    setState("custom", orderDensity(state.custom));
  }

  function onChroma(e) {
    let hue = chroma(e.currentTarget.value).get("hsl.h");
    if (isNaN(hue)) hue = false;
    setState({
      chromaKey: e.currentTarget.value,
      chromaKeyHue: hue === 0 ? 360 : hue,
    });
  }

  function download(data, type) {
    let name = window.prompt("Name?", "ascii"),
      isBlob = ["txt", "html"].includes(type),
      url;
    if (isBlob) {
      //let json = JSON.stringify(data, null, 2),
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

  function onSave(type) {
    switch (type) {
      case "txt":
        download(refs.output.innerText, type);
        break;
      case "html":
        download(refs.output.innerHTML, type);
        break;
      case "jpeg":
        domtoimage.toJpeg(refs.output).then((data) => download(data, type));
        break;
      default:
        domtoimage.toPng(refs.output).then((data) => download(data, type));
        break;
    }
  }

  async function readFile() {
    return new Promise((resolve, reject) => {
      let file = refs.uploader.files[0],
        reader = new FileReader();
      // it's onload event and you forgot (parameters)
      reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;
        image.onload = () => {
          setState({
            image: e.target.result,
            imageWidth: image.width,
            imageHeight: image.height,
          });
          resolve(1);
        };
        refs.uploader.files = new DataTransfer().files;
        refs.uploader.value = "";
      };
      reader.onerror = () => reject(new Error("Failed to load image!"));
      reader.readAsDataURL(file);
    });
  }

  async function generate() {
    let success = await readFile();
    console.log("success = " + success);
    setState("scale", 15.6);
    setSize();
  }
  return (
    <div class={styles.Options}>
      <h2>Options</h2>
      <Section title="Upload">
        <Option>
          <input ref={refs.uploader} type="file" onChange={generate} />
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
            <For each={charSets}>
              {(set) => <option value={set}>{set}</option>}
            </For>
          </select>
        </Option>
        <Show when={state.showCustom}>
          <Section title="Custom Chars">
            <Option>
              <input
                value={state.custom}
                onChange={(e) => setState("custom", e.currentTarget.value)}
              />
              <button onClick={sortCustom}>Order</button>
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
            <Show when={state.showColors}>
              <br />
              <pre>{JSON.stringify(state.colors, null, 2)}</pre>
            </Show>
          </Option>
          <Option title="Embed Term Codes">
            <input type="checkbox" onChange={onTermCodes} />
          </Option>
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
                  <For each={Object.keys(palettes)}>
                    {(palette) => <option value={palette}>{palette}</option>}
                  </For>
                </select>
              </Option>
            </Show>
          </Section>
          <Section title="Chroma Key">
            <Option title="Color">
              <input type="color" onInput={onChroma} />
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
          </Section>
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
      </Section>
      {/* <p style={"white-space: pre-wrap; text-align: left"}>
        {JSON.stringify(state, null, 2)}
      </p> */}
    </div>
  );
}
