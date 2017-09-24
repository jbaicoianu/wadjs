import * as WadJS from '../wad.js';

/**
 * Class representing a line definition
 * https://zdoom.org/wiki/Linedef
 */
export class Linedef {
  constructor(map) {
    this.map = map;
    this.v1 = 0;
    this.v2 = 0;
    this.flags = 0;
    this.type = 0;
    this.tag = 0;
    this.side1 = 0;
    this.side2 = 0;
  }
  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.v1 = WadJS.readUint16(data, pos);
    this.v2 = WadJS.readUint16(data, pos + 2);
    this.flags = WadJS.readUint16(data, pos + 4);
    this.type = WadJS.readUint16(data, pos + 6);
    this.tag = WadJS.readUint16(data, pos + 8);
    this.side1 = WadJS.readUint16(data, pos + 10);
    this.side2 = WadJS.readUint16(data, pos + 12);
  }
  getByteSize() { return 14; }
}
Linedef.flags = {
  BLOCKPLAYER: 0x1,
  BLOCKMONSTERS: 0x2,
  TWOSIDED: 0x4,
}

