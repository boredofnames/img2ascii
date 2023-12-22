import { useAscii } from "../context";
import Section from "./Section";
import Option from "./Option";
import { toPng, toJpeg } from "html-to-image";
import { STATUS_CODES } from "@/jsx/StatusBanner";
import { refs } from "../refs";

export default function Save() {
  const [, { setState, onError }] = useAscii();

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
  return (
    <Section title="Save" icon="save">
      <Option>
        <button onClick={() => onSave("txt")}>Text</button>
        <button onClick={() => onSave("html")}>HTML</button>

        <button onClick={() => onSave("jpeg")}>JPEG</button>
        <button onClick={() => onSave("png")}>PNG</button>
      </Option>
      <Option>
        <button onClick={onCopy}>Copy to clipboard</button>
      </Option>
    </Section>
  );
}
