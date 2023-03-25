import { useAscii } from "../context";
import Option from "./Option";
import Section from "./Section";
import { readImagePromise } from "@/js/lib/readImage";
import { STATUS_CODES } from "@/jsx/StatusBanner";
import { refs } from "../refs";

export default function Upload() {
  const [state, { setState, setSize, onError }] = useAscii();

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
  function onShowPreviews(e) {
    setState("showPreviews", e.currentTarget.checked);
  }
  return (
    <Section title="Upload" icon="upload_file">
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
  );
}
