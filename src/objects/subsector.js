import * as WadJS from '../wad.js';

/**
 * Class representing a Subsector
 * https://zdoom.org/wiki/Subsector
 */
export class Subsector {
  constructor(map) {
    this.map = map;
    this.numsegs = 0;
    this.firstseg = 0;
  }

  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.numsegs = WadJS.readUint16(data, pos);
    this.firstseg = WadJS.readInt16(data, pos + 2);
  }

  /**
   * Get the byte size of this object
   * @returns {integer} number of bytes
   */
  getByteSize() {
    return 4;
  }
}

