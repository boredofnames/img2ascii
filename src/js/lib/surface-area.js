export function getSurfaceArea(char, size = 10, font = "sans-serif") {
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = size;
  canvas.height = size;
  //test styles
  //canvas.style.position = 'absolute'
  ctx.font = size + "px " + font;
  //test canvas
  //$('body').appendChild(canvas)
  //clear
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //draw
  ctx.fillStyle = "black";

  let x = 0,
    y = canvas.height;

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
  return data;
}

export function orderDensity(str) {
  return (
    [
      ...new Set(
        str
          .replace(/^/, ".:")
          .replace(/(?<!^)\s/g, "")
          .split("")
      ),
    ]
      .map((char) => getSurfaceArea(char))
      .sort((a, b) => a.black - b.black)

      // chars = chars
      // 	.filter((char, i) => {
      // 		if (chars[i - 1] && char.black === chars[i - 1]?.black)
      // 			return false
      // 		return true
      // 	})
      .map((char) => char.char)
      .join("")
  );
  //console.log(chars)
  //return chars
}

//window.onload = () => {
//	console.log(
//		orderDensity(
// 				'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ',
// 				'.ノメソシヲヌチホヰネ',
// 				 '.:-=+*#%@',
// 				'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
//				'₳฿¢₫€£₤₣ƒ₲₭Ł₦₱$₮₩¥₴¤₰₠₧원৳₹₨৲',
//		 ),
//	 )
//}
