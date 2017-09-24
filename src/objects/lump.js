/**
 * Class representing a Lump of binary data
 * https://zdoom.org/wiki/Lump
 */
export class Lump {
  constructor() {
    this.name = '';
    this.pos = 0;
    this.len = 0;
    this.bytes = false;
  }
  /**
   * Reads data from the WAD file at the given offset
   * @param {ArrayBuffer} data - binary data to read from
   * @param {integer} pos - position to start reading from
   * @param {integer} len - number of bytes to read
   * @param {integer} offset - data offset
   */
  read(data, pos, len, name, offset) {
    if (!offset) offset = 0;

    this.name = name;
    this.pos = pos;
    this.len = len;
    this.bytes = new Uint8Array(data, offset + pos, len);
  }
}

