import { createContext, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { palettes } from "../../js/lib/img2ascii/palettes";
import { charSets } from "@/js/lib/img2ascii";
import storage from "@/js/lib/storage";
import { STATUS_CODES } from "../StatusBanner";

let loadedCharSets = [...charSets, ...(storage.get("customCharSets") || [])],
  loadedPalettes = {
    ...palettes,
    ...(storage.get("customPalettes") || {}),
    ...{
      custom: [
        [0, 0, 0],
        [255, 255, 255],
      ],
    },
  };

export const AsciiContext = createContext([
  {
    debug: false,
    image: undefined,
    density: charSets[0],
    usePadding: true,
    padding: 1,
    scale: 15.6,
    showPreviews: false,
    charSets: loadedCharSets,
    showCustomCharSet: false,
    customCharSet: ".:oilk",
    useColors: false,
    colors: [],
    colorDepth: 8,
    bgColor: "rgb(0,0,0)",
    palettes: loadedPalettes,
    palette: undefined,
    showCustomPalette: false,
    useTermCodes: false,
    termCodes: "ansi",
    chromaRange: 10,
    useQuant: false,
    useDither: false,
  },
  {},
]);

export function AsciiProvider(props) {
  const [state, setState] = createStore({
    debug: props.debug || false,
    image: props.image || undefined,
    density: props.density || charSets[0],
    usePadding: props.usePadding || true,
    padding: props.padding || 1,
    scale: props.scale || 15.6,
    showPreviews: props.showPreviews || false,
    charSets: props.charSets || loadedCharSets,
    showCustomCharSet: props.showCustomCharSet || false,
    customCharSet: props.customCharSet || ".:oilk",
    useColors: props.useColors || false,
    colors: props.colors || [],
    colorDepth: props.colorDepth || 8,
    bgColor: props.bgColor || "rgb(0,0,0)",
    palette: props.palette || undefined,
    palettes: props.palettes || loadedPalettes,
    showCustomPalette: props.showCustomPalette || false,
    useTermCodes: props.useTermCodes || false,
    termCodes: props.termCodes || "ansi",
    chromaRange: props.chromaRange || 10,
    useQuant: props.useQuant || false,
    useDither: props.useDither || false,
  });
  const ascii = [
    state,
    {
      setState,
      setSize() {
        let width = Math.floor((state.imageWidth / state.scale) * 1.6),
          height = Math.floor(state.imageHeight / state.scale);
        setState({ width, height });
      },
      updateCharSets() {
        setState("charSets", [
          ...charSets,
          ...(storage.get("customCharSets") || []),
        ]);
      },
      updatePalettes() {
        let data = {
          ...palettes,
          ...(storage.get("customPalettes") || {}),
          custom: state.palettes.custom,
        };
        setState("palettes", reconcile(data));
        if (state.palette !== "custom" || !data[state.palette])
          setState("palette", undefined);
      },
      onError(readable, err) {
        console.error(err);
        setState("status", {
          code: STATUS_CODES.ERROR,
          msg: readable,
          time: 5000,
        });
      },
    },
  ];

  return (
    <AsciiContext.Provider value={ascii}>
      {props.children}
    </AsciiContext.Provider>
  );
}

export function useAscii() {
  return useContext(AsciiContext);
}
