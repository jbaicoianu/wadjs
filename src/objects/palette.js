import * as WadJS from '../wad.js';

export class Palette {
  constructor() {
    this.colors = [];
  }
  read(data, pos) {
    if (!pos) pos = 0;
    var rgbdata = WadJS.readUint8Array(data, pos, 768);
    for (var i = 0; i < 256; i++) {
      var idx = i * 3;
      this.colors[i] = rgbdata.slice(idx, idx + 3);
    }
  }
  getColor(idx) {
    return this.colors[idx];
  }
}

