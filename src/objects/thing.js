import * as WadJS from '../wad.js';

/**
 * Class representing a Thing
 * https://zdoom.org/wiki/Thing
 */
export class Thing {
  constructor(map) {
    this.map = map;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.type = 0;
    this.options = 0;
  }
  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.x = WadJS.readInt16(data, pos);
    this.y = WadJS.readInt16(data, pos + 2);
    this.angle = WadJS.readInt16(data, pos + 4);
    this.type = WadJS.readInt16(data, pos + 6);
    this.options = WadJS.readInt16(data, pos + 8);
  }

  /**
   * Get the byte size of this object
   * @returns {integer} number of bytes
   */
  getByteSize() { return 10; }
}

