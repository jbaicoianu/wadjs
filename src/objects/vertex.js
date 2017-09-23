import * as WadJS from '../wad.js';

export class Vertex {
  constructor(x, y) {
    this.x = (x === undefined ? 0 : x);
    this.y = (y === undefined ? this.x : y);
  }
  read(data, pos) {
    this.x = WadJS.readInt16(data, pos);
    this.y = WadJS.readInt16(data, pos + 2);
  }
  getByteSize() {
    return 4;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  addVertex(v1, v2) {
    this.x = v1.x + v2.x;
    this.y = v1.y + v2.y;
    return this;
  }
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  subVertex(v1, v2) {
    this.x = v1.x - v2.x;
    this.y = v1.y - v2.y;
    return this;
  }
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }
  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
}

