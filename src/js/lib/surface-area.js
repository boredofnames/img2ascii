export function getSurfaceArea(char, size = 12, font = "Fira Code") {
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = size + 4;
  canvas.height = size + 4;
  //test styles
  //canvas.style.position = 'absolute'
  ctx.font = size + "px " + font;
  //test canvas
  //document.querySelector("body").appendChild(canvas);
  //clear
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //draw
  ctx.fillStyle = "black";

  let x = 0,
    y = canvas.height / 1.5;

  ctx.fillText(char, x, y);
  //analyze
  let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = { white: 0, black: 0, char };
  for (let i = 0, len = frame.data.length; i < len; i += 4) {
    let r = frame.data[i + 0],
      g = frame.data[i + 1],
      b = frame.data[i + 2];
    if (r === 255 && g === 255 && b === 255) data.white += 1;
    else data.black += 1;
  }
  //log
  //console.log(data);
  return data;
}

export function orderDensity(str, reversed = false) {
  return [...new Set(str.replace(/(?<!^)\s/g, "").split(""))]
    .map((char) => getSurfaceArea(char))
    .sort((a, b) => (reversed ? b.black - a.black : a.black - b.black))
    .map((char) => char.char)
    .join("");
}

// window.onload = () => {
//   console.log(
//     orderDensity(
//       //"ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ"
//       // ".ノメソシヲヌチホヰネ",
//       ".:-=+*#%@"
//       // "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
//       // "₳฿¢₫€£₤₣ƒ₲₭Ł₦₱$₮₩¥₴¤₰₠₧원৳₹₨৲"
//     )
//   );
// };
