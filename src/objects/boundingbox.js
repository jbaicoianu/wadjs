import * as WadJS from '../wad.js';

export class BoundingBox {
  constructor() {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
  }
  read(data, pos) {
    this.x1 = WadJS.readInt16(data, pos);
    this.y1 = WadJS.readInt16(data, pos + 2);
    this.x2 = WadJS.readInt16(data, pos + 4);
    this.y2 = WadJS.readInt16(data, pos + 6);
  }
  getByteSize() {
    return 8;
  }
  containsPoint(x, y) {
    return (x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2);
  }
}

