import * as WadJS from '../wad.js';

export class Subsector {
  constructor(map) {
    this.map = map;
    this.numsegs = 0;
    this.firstseg = 0;
  }
  read(data, pos) {
    this.numsegs = WadJS.readUint16(data, pos);
    this.firstseg = WadJS.readInt16(data, pos + 2);
  }
  getByteSize() {
    return 4;
  }
}

