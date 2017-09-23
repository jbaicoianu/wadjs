import * as WadJS from '../wad.js';

export class Thing {
  constructor(map) {
    this.map = map;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.type = 0;
    this.options = 0;
  }
  read(data, pos) {
    this.x = WadJS.readInt16(data, pos);
    this.y = WadJS.readInt16(data, pos + 2);
    this.angle = WadJS.readInt16(data, pos + 4);
    this.type = WadJS.readInt16(data, pos + 6);
    this.options = WadJS.readInt16(data, pos + 8);
  }
  getByteSize() { return 10; }
}

