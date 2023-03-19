import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { palettes } from "../../js/lib/img2ascii/palettes";
import { charSets } from "@/js/lib/img2ascii";
import storage from "@/js/lib/storage";

let loadedCharSets = [...charSets, ...(storage.get("customCharSets") || [])];

export const AsciiContext = createContext([
  {
    image: undefined,
    density: charSets[0],
    usePadding: true,
    padding: 1,
    scale: 15.6,
    showPreviews: false,
    showCustom: false,
    custom: ".:oilk",
    useColors: false,
    colors: [],
    colorDepth: 8,
    bgColor: "rgb(0,0,0)",
    palette: undefined,
    palettes: palettes,
    useTermCodes: false,
    termCodes: "ansi",
    chromaRange: 10,
    useQuant: false,
    useDither: false,
    charSets: loadedCharSets,
  },
  {},
]);

export function AsciiProvider(props) {
  const [state, setState] = createStore({
    image: props.image || undefined,
    density: props.density || charSets[0],
    usePadding: props.usePadding || true,
    padding: props.padding || 1,
    scale: props.scale || 15.6,
    showPreviews: props.showPreviews || false,
    showCustom: props.showCustom || false,
    custom: props.custom || ".:oilk",
    useColors: props.useColors || false,
    colors: props.colors || [],
    colorDepth: props.colorDepth || 8,
    bgColor: props.bgColor || "rgb(0,0,0)",
    palette: props.palette || undefined,
    palettes: props.palettes || palettes,
    useTermCodes: props.useTermCodes || false,
    termCodes: props.termCodes || "ansi",
    chromaRange: props.chromaRange || 10,
    useQuant: props.useQuant || false,
    useDither: props.useDither || false,
    charSets: props.charSets || loadedCharSets,
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
