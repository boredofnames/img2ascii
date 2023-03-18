export function nearest(x, a) {
  return Math.floor(x / (255 / a)) * (255 / a);
}

export function getDistance(a, b) {
  return Math.abs(+a - +b);
}

/*
  code below from https://github.com/processing/p5.js/blob/eef4ce6747bef887ecfb2f1112acec07fc944687/src/math/calculation.js

  GNU LESSER GENERAL PUBLIC LICENSE
  Version 2.1, February 1999
*/

export function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

export function map(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
}

export function filterObject(obj, callback) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => callback(key, val))
  );
}
