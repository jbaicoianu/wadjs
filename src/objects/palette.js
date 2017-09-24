import * as WadJS from '../wad.js';

/**
 * Class representing an image palette
 * https://zdoom.org/wiki/Palette
 */
export class Palette {
  constructor() {
    this.colors = [];
  }
  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    if (!pos) pos = 0;
    var rgbdata = WadJS.readUint8Array(data, pos, 768);
    for (var i = 0; i < 256; i++) {
      var idx = i * 3;
      this.colors[i] = rgbdata.slice(idx, idx + 3);
    }
  }
  /**
   * Returns the RGB color of the specified index
   * @param {integer} idx - color index
   * @returns {array} RGB data
   */
  getColor(idx) {
    return this.colors[idx];
  }
}

