import { rgb } from "chroma-js";
import RgbQuant from "rgbquant";
import { filterObject, getDistance, map, nearest } from "./utils";

export var charSets = [
  "░▒▓█",
  ".:░▒▓█",
  ".-:*=+#%@",
  ".:гтукзвоадыёб",
  ".:ƒ₮¢£₰€₹¥₤₳$₴₭₱₦",
  "custom",
  "custom-from",
];

const defaultProps = {
  image: undefined,
  width: 10,
  height: 10,
  density: charSets[0],
  padding: 1,
  scale: 15.6,
  showPreviews: false,
  showCustom: false,
  custom: ".:oilk",
  bgColor: "rgb(0,0,0)",
  colors: [],
  colorDepth: 8,
  colorCount: 0,
  palettes: undefined,
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
  Object.assign(this, defaultProps, filterObject(props, knownProp));
}

img2ascii.prototype.updateData = function (data) {
  Object.assign(this, filterObject(data, knownProp));
};

img2ascii.prototype.quantize = function (canvas) {
  let ctx = canvas.getContext("2d");
  let opts = {
      colors: Math.pow(2, this.colorDepth || 3),
      palette: this.palettes[this.palette],
      reIndex: true,
      useCache: false,
    },
    dither = {
      dithKern: "FloydSteinberg",
      dithDelta: 0.05,
    },
    noPalette = {
      method: 1,
      initColors: this.colorDepth === 18 ? 262144 : 4096,
      minHueCols: 0,
      reIndex: false,
      useCache: true,
    };
  if (this.useDither) Object.assign(opts, dither);
  if (!this.palette) Object.assign(opts, noPalette);

  let q = new RgbQuant(opts.removeEmpties());
  console.time("quant");
  q.sample(canvas);
  let pal = q.palette();
  let reduced = q.reduce(canvas);
  console.timeEnd("quant");
  let imgData = ctx.createImageData(this.width, this.height);
  imgData.data.set(reduced);
  ctx.putImageData(imgData, 0, 0);
  this.updateData({ quant: canvas.toDataURL() });
  return [imgData.data, imgData.data.length];
};

img2ascii.prototype.getPixelData = function (image) {
  let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    data,
    length;
  canvas.width = this.width;
  canvas.height = this.height;

  ctx.drawImage(image, 0, 0, this.width, this.height);

  if (this.useQuant) {
    [data, length] = this.quantize(canvas);
  } else {
    const frame = ctx.getImageData(0, 0, this.width, this.height);
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
  if (this.termCodes === "fastfetch") {
    let index = this.colors.indexOf(this.getColorString(color)) + 1;
    if (index === this.lastColorCode) return "";
    this.lastColorCode = index;
    return "$" + index;
  } else if (this.termCodes === "ansi") {
    let [r, g, b] = color;
    let code = `\\033[38;2;${r};${g};${b}m`;
    if (code === this.lastColorCode) return "";
    this.lastColorCode = code;
    return code;
  }
};

img2ascii.prototype.getColoredOutput = function (color, char) {
  let prefix = "",
    colorString = this.getColorString(color);
  if (this.lastColor !== colorString) {
    prefix = `${
      this.lastColor === undefined ? "" : "</span>"
    }<span style="color: ${colorString}">`;
    this.lastColor = colorString;
  }
  let output =
    this.useTermCodes === true
      ? this.termCodes === "fastfetch"
        ? char === "$"
          ? this.getColorCode(color) + "$$"
          : this.getColorCode(color) + char
        : this.getColorCode(color) + char
      : char;
  return prefix + output;
};

img2ascii.prototype.getAsciiText = function (buffer) {
  let text = "";
  this.lastColor = this.lastColorCode = undefined;
  for (let y = 0, len = buffer.length; y < len; y++) {
    for (let x = 0, len = buffer[y].length; x < len; x++) {
      let char = buffer[y][x][0],
        color = buffer[y][x][1];

      text += this.useColors ? this.getColoredOutput(color, char) : char;
    }
    text += "\n";
  }
  return text;
};

img2ascii.prototype.process = function (data, length) {
  let buffer = [];
  let colorSet = new Set();
  for (let i = 0; i < length; i += 4) {
    const r = data[i + 0];
    const g = data[i + 1];
    const b = data[i + 2];

    const a =
      this.useChroma &&
      this.chromaKeyHue &&
      getDistance(
        this.colorDepth
          ? rgb(
              nearest(r, this.colorDepth),
              nearest(g, this.colorDepth),
              nearest(b, this.colorDepth)
            ).get("hsl.h")
          : rgb(r, g, b).get("hsl.h"),
        this.chromaKeyHue
      ) <= this.chromaRange
        ? 0
        : 255;

    const density = this.usePadding
      ? this.density.padStart(this.density.length + this.padding, " ")
      : this.density;

    const avg = Math.floor((r + g + b) / 3);
    const len = density.length;
    const charIndex = Math.floor(map(avg, 0, 256, 0, len));
    const c = a === 0 && this.usePadding ? " " : density.charAt(charIndex);
    const x = (i / 4) % this.width;
    const y = Math.floor(i / 4 / this.width);

    const color = this.getColor(r, g, b, a);
    colorSet.add(this.getColorString(color));

    buffer[y] = buffer[y] || [];
    buffer[y][x] = [c, color];
  }
  const colors = Array.from(colorSet);
  return [buffer, colors];
};
