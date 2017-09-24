import * as WadJS from '../wad.js';

/**
 * Class representing a BSP Node
 * https://zdoom.org/wiki/Node
 */
export class Node {
  constructor(map) {
    this.map = map;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.boundingBoxLeft = new WadJS.BoundingBox();
    this.boundingBoxRight = new WadJS.BoundingBox();
    this.leftChild = 0;
    this.rightChild = 0;
  }
  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.x = WadJS.readInt16(data, pos);
    this.y = WadJS.readInt16(data, pos + 2);
    this.dx = WadJS.readInt16(data, pos + 4);
    this.dy = WadJS.readInt16(data, pos + 6);
    this.boundingBoxLeft.read(data, pos + 8);
    this.boundingBoxRight.read(data, pos + 16);
    this.leftChild = WadJS.readUint16(data, pos + 24);
    this.rightChild = WadJS.readUint16(data, pos + 26);
  }
  getByteSize() {
    return 28;
  }
}

