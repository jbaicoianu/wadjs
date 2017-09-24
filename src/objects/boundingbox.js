import * as WadJS from '../wad.js';

/**
 * Class representing a BoundingBox
 */
export class BoundingBox {
  constructor() {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
  }

  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.x1 = WadJS.readInt16(data, pos);
    this.y1 = WadJS.readInt16(data, pos + 2);
    this.x2 = WadJS.readInt16(data, pos + 4);
    this.y2 = WadJS.readInt16(data, pos + 6);
  }

  /**
   * Get the byte size of this object
   * @returns {integer} number of bytes
   */
  getByteSize() {
    return 8;
  }

  /**
   * Determine whether the specified point falls within this bounding box
   * @returns {integer} x - x position
   * @returns {integer} y - y position
   * @returns {boolean} point is contained within
   */
  containsPoint(x, y) {
    return (x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2);
  }
}

