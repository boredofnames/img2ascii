import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

export const refs = {
  output: undefined,
  uploader: undefined,
  url: undefined,
  preview: undefined,
  quant: undefined,
  scale: undefined,
  useColors: undefined,
};

export const charSets = [
  "░▒▓█",
  ".:░▒▓█",
  ".-:*=+#%@",
  ".:гтукзвоадыёб",
  ".:ƒ₮¢£₰€₹¥₤₳$₴₭₱₦",
  "custom",
  "custom-from",
];

export const termCodes = ["ansi", "fastfetch"];

export let palettes = {
  "3-bit-term": [
    [0, 0, 0],
    [194, 54, 33],
    [37, 188, 36],
    [173, 173, 39],
    [73, 46, 225],
    [211, 56, 211],
    [51, 187, 200],
    [203, 204, 205],
  ],
  rgb3level: [
    [0, 0, 0],
    [128, 128, 128],
    [255, 255, 255],
    [128, 0, 0],
    [255, 0, 0],
    [255, 128, 128],
    [255, 128, 0],
    [128, 128, 0],
    [128, 255, 0],
    [255, 255, 0],
    [255, 255, 128],
    [0, 128, 0],
    [0, 255, 0],
    [128, 255, 128],
    [0, 255, 128],
    [0, 128, 128],
    [0, 255, 255],
    [128, 255, 255],
    [0, 128, 255],
    [0, 0, 128],
    [0, 0, 255],
    [128, 128, 255],
    [128, 0, 128],
    [128, 0, 255],
    [255, 0, 255],
    [255, 128, 255],
    [255, 0, 128],
  ],
  rgb6bit: [
    [0, 0, 0],
    [104, 104, 104],
    [183, 183, 183],
    [255, 255, 255],
    [104, 0, 0],
    [183, 0, 0],
    [255, 0, 0],
    [183, 104, 104],
    [255, 104, 104],
    [255, 183, 183],
    [183, 104, 0],
    [255, 104, 0],
    [255, 183, 0],
    [255, 183, 104],
    [104, 104, 0],
    [104, 183, 0],
    [183, 183, 0],
    [183, 183, 104],
    [183, 255, 104],
    [183, 255, 0],
    [255, 255, 0],
    [255, 255, 104],
    [255, 255, 183],
    [0, 104, 0],
    [0, 183, 0],
    [104, 183, 104],
    [0, 255, 0],
    [104, 255, 104],
    [104, 255, 0],
    [183, 255, 183],
    [0, 183, 104],
    [0, 255, 104],
    [104, 255, 183],
    [0, 104, 104],
    [0, 183, 183],
    [104, 183, 183],
    [0, 183, 255],
    [0, 255, 183],
    [0, 255, 255],
    [104, 255, 255],
    [183, 255, 255],
    [0, 104, 183],
    [0, 104, 255],
    [104, 183, 255],
    [0, 0, 104],
    [0, 0, 183],
    [0, 0, 255],
    [104, 0, 255],
    [104, 104, 183],
    [104, 104, 255],
    [183, 183, 255],
    [104, 0, 104],
    [104, 0, 183],
    [183, 0, 183],
    [183, 0, 255],
    [183, 104, 183],
    [255, 0, 255],
    [183, 104, 255],
    [255, 104, 255],
    [255, 183, 255],
    [183, 0, 104],
    [255, 0, 104],
    [255, 0, 183],
    [255, 104, 183],
  ],
  gray4bit: [
    [0, 0, 0],
    [17, 17, 17],
    [34, 34, 34],
    [51, 51, 51],
    [68, 68, 68],
    [85, 85, 85],
    [102, 102, 102],
    [119, 119, 119],
    [136, 136, 136],
    [153, 153, 153],
    [170, 170, 170],
    [187, 187, 187],
    [204, 204, 204],
    [221, 221, 221],
    [238, 238, 238],
    [255, 255, 255],
  ],
  // rgb6bit32: [],
};

// palettes.rgb6bit.forEach(function (rgb) {
//   palettes.rgb6bit32.push([...rgb, 255]);
// });

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
