import * as WadJS from '../wad.js';

/**
 * Class representing a Segment
 * https://zdoom.org/wiki/Segment
 */
export class Segment {
  constructor(map) {
    this.map = map;
    this.v1 = 0;
    this.v2 = 0;
    this.angle = 0;
    this.linedef = 0;
    this.side = 0;
    this.offset = 0;
  }

  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.v1 = WadJS.readUint16(data, pos);
    this.v2 = WadJS.readUint16(data, pos + 2);
    this.angle = WadJS.readInt16(data, pos + 4);
    this.linedef = WadJS.readUint16(data, pos + 6);
    this.side = WadJS.readInt16(data, pos + 8);
    this.offset = WadJS.readInt16(data, pos + 10);
  }

  /**
   * Get the byte size of this object
   * @returns {integer} number of bytes
   */
  getByteSize() { return 12; }
}

