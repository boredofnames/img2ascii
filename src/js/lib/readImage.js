export function readImage(path, callback) {
  let file = path,
    reader = new FileReader();
  reader.onload = function (e) {
    const image = new Image();
    image.src = e.target.result;
    image.onload = () => {
      callback(null, {
        data: e.target.result,
        width: image.width,
        height: image.height,
      });
    };
    image.onerror = (err) => callback(err);
  };
  reader.onerror = (err) => callback(err);
  reader.readAsDataURL(file);
}

export const readImagePromise = (path) =>
  new Promise((resolve, reject) => {
    readImage(path, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
