import * as WadJS from '../wad.js';

/**
 * Class representing a Sector
 * https://zdoom.org/wiki/Sector
 */
export class Sector {
  constructor(map, id) {
    this.map = map;
    this.id = id;
    this.floorheight = 0;
    this.ceilingheight = 0;
    this.floorpic = '-';
    this.ceilingpic = '-';
    this.lightlevel = 0;
    this.special = 0;
    this.tag = 0;

    this.floorvertices = null;
    this.ceilingvertices = null;
  }

  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    this.floorheight = WadJS.readInt16(data, pos);
    this.ceilingheight = WadJS.readInt16(data, pos + 2);
    this.floorpic = WadJS.readString(data, pos + 4, 8);
    this.ceilingpic = WadJS.readString(data, pos + 12, 8);
    this.lightlevel = WadJS.readInt16(data, pos + 20);
    this.special = WadJS.readInt16(data, pos + 22);
    this.tag = WadJS.readInt16(data, pos + 24);
  }

  /**
   * Get the byte size of this object
   * @returns {integer} number of bytes
   */
  getByteSize() { return 26; }

  /**
   * Set the floor's height to the specified value
   * @param {integer} new height
   */
  setFloorHeight(floorheight) {
    this.floorheight = floorheight;
  }

  /**
   * Set the ceiling's height to the specified value
   * @param {integer} new height
   */
  setCeilingHeight(ceilingheight) {
    this.ceilingheight = ceilingheight;
  }

  /**
   * Set the floor vertices associated with this sector
   * @param {array} list of WadJS.Vertex objects
   */
  addFloorVertices(verts) {
    this.floorvertices = verts.filter((value, index, self) => self.indexOf(value) == index);
  }

  /**
   * Set the ceiling vertices associated with this sector
   * @param {array} list of WadJS.Vertex objects
   */
  addCeilingVertices(verts) {
    this.ceilingvertices = verts.filter((value, index, self) => self.indexOf(value) == index);
  }

  /**
   * Get a lost of all sectors that touch this one
   * @returns {array} list of WadJS.Sector objects
   */
  getAdjacentSectors() {
    return this.map.getAdjacentSectors(this);
  }
}

