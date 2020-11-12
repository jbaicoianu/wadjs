import * as WadJS from '../wad.js';

/**
 * Class representing a Vertex
 * https://zdoom.org/wiki/Vertex
 */
export class Vertex {
  constructor(x, y) {
    this.x = (x === undefined ? 0 : x);
    this.y = (y === undefined ? this.x : y);
  }

  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.x = WadJS.readInt16(data, pos);
    this.y = WadJS.readInt16(data, pos + 2);
  }

  /**
   * Get the byte size of this object
   * @returns {integer} number of bytes
   */
  getByteSize() {
    return 4;
  }

  /**
   * Add a vertex to this one
   * @param {WadJS.Vertex} v - other vertex
   * @returns {WadJS.Vertex} this vertex
   */
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Set this Vertex's value by adding two vertices together
   * @param {WadJS.Vertex} v1 - vertex 1
   * @param {WadJS.Vertex} v2 - vertex 2
   * @returns {WadJS.Vertex} this vertex
   */
  addVertex(v1, v2) {
    this.x = v1.x + v2.x;
    this.y = v1.y + v2.y;
    return this;
  }

  /**
   * Subtract a vertex from this one
   * @param {WadJS.Vertex} v - other vertex
   * @returns {WadJS.Vertex} this vertex
   */
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Set this Vertex's value by subtracting two vertices
   * @param {WadJS.Vertex} v1 - vertex 1
   * @param {WadJS.Vertex} v2 - vertex 2
   * @returns {WadJS.Vertex} this vertex
   */
  subVertex(v1, v2) {
    this.x = v1.x - v2.x;
    this.y = v1.y - v2.y;
    return this;
  }

  /**
   * Perform a cross product of this vertex with the specified vertex
   * @param {WadJS.Vertex} v - other vertex
   * @returns {integer} cross product
   */
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Multiply this vertex by a scalar value
   * @param {float} s - scalar value
   * @returns {WadJS.Vertex} this vertex
   */
  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  /**
   * Return the dot product between this vertex and another
   * @param {WadJS.Vertex} v - other vertex
   * @returns {float} dot product result
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Return the length of a vertex (vector, really)
   * @returns {float} length
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Return the distance between to vertexes
   * @returns {float} distance
   */
  distanceTo(v) {
    return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
  }

  /**
   * Set the position of this vertex to the position of the specified vertex
   * @param {WadJS.Vertex} v - other vertex
   * @returns {WadJS.Vertex} this vertex
   */
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  /**
   * Allocate a new copy of this vertex
   * @returns {WadJS.Vertex} a new vertex
   */
  clone() {
    return new Vertex(this.x, this.y);
  }
}

