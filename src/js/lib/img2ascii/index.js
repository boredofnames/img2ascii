import RgbQuant from "rgbquant";
import {
  filterObject,
  getDistance,
  map,
  nearest,
  removeEmpties,
} from "../utils";
import { palettes } from "./palettes";
import Color from "colorjs.io/dist/color";

export let charSets = [
  "░▒▓█",
  ".:░▒▓█",
  ".-:*=+#%@",
  ".:гтукзвоадыёб",
  ".:ƒ₮¢£₰€₹¥₤₳$₴₭₱₦",
];

export const termCodes = ["ansi", "fastfetch"];

const defaultProps = {
  image: undefined,
  width: 10,
  height: 10,
  density: charSets[0],
  padding: 1,
  colors: [],
  colorDepth: 8,
  palettes: palettes,
  palette: undefined,
  termCodes: "ansi",
  chromaRange: 10,
  chromaKeyHue: 0,
  quant: undefined,

  useColors: false,
  usePadding: true,
  useTermCodes: false,
  useQuant: false,
  useDither: false,
  useChroma: false,

  lastColor: undefined,
  lastColorCode: undefined,
};

function knownProp(prop) {
  return prop in defaultProps;
}

export default function img2ascii(props) {
  if (props.useStore) {
    this.useStore = true;
    this.state = props.useStore.state;
    this.setState = props.useStore.setState;
  } else Object.assign(this, defaultProps, filterObject(props, knownProp));
}

img2ascii.prototype.updateData = function (data) {
  if (this.useStore) this.setState(data);
  else Object.assign(this, filterObject(data, knownProp));
};

img2ascii.prototype.getData = function (key) {
  return this.useStore ? this.state[key] : this[key];
};

img2ascii.prototype.quantize = function (canvas) {
  let ctx = canvas.getContext("2d"),
    colorDepth = this.getData("colorDepth"),
    palette = this.getData("palette"),
    opts = {
      colors: Math.pow(2, colorDepth || 3),
      palette: this.getData("palettes")[palette],
      reIndex: true,
      useCache: false,
    },
    dither = {
      dithKern: "FloydSteinberg",
      dithDelta: 0.05,
    },
    noPalette = {
      method: 1,
      initColors: colorDepth === 18 ? 262144 : 4096,
      minHueCols: 0,
      reIndex: false,
      useCache: true,
    };
  if (this.getData("useDither")) Object.assign(opts, dither);
  if (!palette) Object.assign(opts, noPalette);
  opts = removeEmpties(opts);
  console.log(opts);

  let q = new RgbQuant(opts);
  console.time("quant");
  q.sample(canvas);
  let pal = q.palette();
  let reduced = q.reduce(canvas);
  console.timeEnd("quant");
  let imgData = ctx.createImageData(
    this.getData("width"),
    this.getData("height")
  );
  imgData.data.set(reduced);
  ctx.putImageData(imgData, 0, 0);
  this.updateData({ quant: canvas.toDataURL() });
  return [imgData.data, imgData.data.length];
};

img2ascii.prototype.getPixelData = function (image) {
  let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    data,
    length,
    width = this.getData("width"),
    height = this.getData("height");
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, 0, 0, width, height);

  if (this.getData("useQuant") === true) {
    [data, length] = this.quantize(canvas);
  } else {
    const frame = ctx.getImageData(0, 0, width, height);
    data = frame.data;
    length = data.length;
  }

  return [data, length];
};

img2ascii.prototype.getColor = function (r, g, b, a) {
  return a === 0 ? [0, 0, 0] : [r, g, b];
};

img2ascii.prototype.getColorString = function (color) {
  let [r, g, b] = color;
  return `rgb(${r},${g},${b})`;
};

img2ascii.prototype.getColorCode = function (color) {
  let termCodes = this.getData("termCodes"),
    lastColorCode = this.getData("lastColorCode");
  if (termCodes === "fastfetch") {
    let index = this.getData("colors").indexOf(this.getColorString(color)) + 1;
    if (index === lastColorCode) return "";
    this.updateData({ lastColorCode: index });
    return "$" + index;
  } else if (termCodes === "ansi") {
    let [r, g, b] = color;
    let code = `\\033[38;2;${r};${g};${b}m`;
    if (code === lastColorCode) return "";
    this.updateData({ lastColorCode: code });
    return code;
  }
};

img2ascii.prototype.getColoredOutput = function (color, char) {
  let prefix = "",
    colorString = this.getColorString(color),
    lastColor = this.getData("lastColor");
  if (lastColor !== colorString) {
    prefix = `${
      lastColor === undefined ? "" : "</span>"
    }<span style="color: ${colorString}">`;
    this.updateData({ lastColor: colorString });
  }
  let output =
    this.getData("useTermCodes") === true
      ? this.getData("termCodes") === "fastfetch"
        ? char === "$"
          ? this.getColorCode(color) + "$$"
          : this.getColorCode(color) + char
        : this.getColorCode(color) + char
      : char;
  return prefix + output;
};

img2ascii.prototype.getAsciiText = function (buffer) {
  let text = "";
  this.updateData({ lastColor: undefined, lastColorCode: undefined });
  for (let y = 0, len = buffer.length; y < len; y++) {
    for (let x = 0, len = buffer[y].length; x < len; x++) {
      let char = buffer[y][x][0],
        color = buffer[y][x][1];

      text +=
        this.getData("useColors") === true
          ? this.getColoredOutput(color, char)
          : char;
    }
    text += "\n";
  }
  return text;
};

img2ascii.prototype.getAlpha = function (color) {
  let colorDepth = this.getData("colorDepth"),
    chromaKeyHue = this.getData("chromaKeyHue");
  return this.getData("useChroma") &&
    chromaKeyHue &&
    getDistance(
      colorDepth
        ? new Color("srgb", [
            nearest(color.r, colorDepth),
            nearest(color.g, colorDepth),
            nearest(color.b, colorDepth),
          ]).hsl.h
        : new Color("srgb", [color.r, color.g, color.b]).hsl.h,
      chromaKeyHue
    ) <= this.getData("chromaRange")
    ? 0
    : 255;
};

img2ascii.prototype.process = function (data, length) {
  let buffer = [],
    colorSet = new Set(),
    usePadding = this.getData("usePadding"),
    density = this.getData("density"),
    width = this.getData("width");
  for (let i = 0; i < length; i += 4) {
    const r = data[i + 0];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = this.getAlpha({ r, g, b });

    const paddedDensity = usePadding
      ? density.padStart(density.length + this.getData("padding"), " ")
      : density;

    const avg = Math.floor((r + g + b) / 3);
    const len = paddedDensity.length;
    const charIndex = Math.floor(map(avg, 0, 256, 0, len));
    const c = a === 0 && usePadding ? " " : paddedDensity.charAt(charIndex);
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    const color = this.getColor(r, g, b, a);
    colorSet.add(this.getColorString(color));

    buffer[y] = buffer[y] || [];
    buffer[y][x] = [c, color];
  }

  this.updateData({ colors: Array.from(colorSet) });
  return buffer;
};
