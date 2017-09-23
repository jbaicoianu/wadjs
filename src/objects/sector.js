import * as WadJS from '../wad.js';

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
  read(data, pos) {
    this.floorheight = WadJS.readInt16(data, pos);
    this.ceilingheight = WadJS.readInt16(data, pos + 2);
    this.floorpic = WadJS.readString(data, pos + 4, 8);
    this.ceilingpic = WadJS.readString(data, pos + 12, 8);
    this.lightlevel = WadJS.readInt16(data, pos + 20);
    this.special = WadJS.readInt16(data, pos + 22);
    this.tag = WadJS.readInt16(data, pos + 24);
  }
  getByteSize() { return 26; }

  setFloorHeight(floorheight) {
    this.floorheight = floorheight;
  }
  setCeilingHeight(ceilingheight) {
    this.ceilingheight = ceilingheight;
  }
  addFloorVertices(verts) {
    this.floorvertices = verts.filter((value, index, self) => self.indexOf(value) == index);
  }
  addCeilingVertices(verts) {
    this.ceilingvertices = verts.filter((value, index, self) => self.indexOf(value) == index);
  }
  getAdjacentSectors() {
    return this.map.getAdjacentSectors(this);
  }
}

