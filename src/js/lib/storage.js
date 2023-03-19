class Storage {
  set(k, v) {
    localStorage.setItem(k, typeof v === "object" ? JSON.stringify(v) : v);
  }
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (error) {
      return localStorage.getItem(k);
    }
  }
  getFromObj(k, tk) {
    return this.get(k)?.[tk];
  }
  replace(k, tk, v) {
    let item = this.get(k);
    item[tk] = v;
    this.set(k, item);
  }
  exists(k) {
    return localStorage[k] !== undefined;
  }
}

const storage = new Storage();

export default storage;
