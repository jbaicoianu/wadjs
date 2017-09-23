import * as WadJS from '../wad.js';

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
  read(data, pos) {
    this.v1 = WadJS.readUint16(data, pos);
    this.v2 = WadJS.readUint16(data, pos + 2);
    this.angle = WadJS.readInt16(data, pos + 4);
    this.linedef = WadJS.readUint16(data, pos + 6);
    this.side = WadJS.readInt16(data, pos + 8);
    this.offset = WadJS.readInt16(data, pos + 10);
  }
  getByteSize() { return 12; }
}

