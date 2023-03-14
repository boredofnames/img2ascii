Object.prototype.removeEmpties = function () {
  return Object.keys(this).reduce((acc, key) => {
    const _acc = acc;
    if (this[key] !== undefined) _acc[key] = this[key];
    return _acc;
  }, {});
};
