import * as WadJS from '../wad.js';

export class Sidedef {
  constructor(map) {
    this.map = map;
    this.offsetx = 0;
    this.offsety = 0;
    this.toptexture = '-';
    this.bottomtexture = '-';
    this.midtexture = '-';
    this.sector = 0;

    this.flipside = null;
    this.linedef = null;

    this.quads = {
      top: null,
      middle: null,
      bottom: null
    };
  }
  read(data, pos) {
    this.offsetx = WadJS.readInt16(data, pos);
    this.offsety = WadJS.readInt16(data, pos + 2);
    this.toptexture = WadJS.readString(data, pos + 4, 8);
    this.bottomtexture = WadJS.readString(data, pos + 12, 8);
    this.midtexture = WadJS.readString(data, pos + 20, 8);
    this.sector = WadJS.readInt16(data, pos + 28);
  }
  getByteSize() { return 30; }

  addQuad(type, verts) {
    this.quads[type] = verts;
  }

  setFlipside(sidedef) {
    this.flipside = sidedef;
  }

  setLinedef(linedef) {
    this.linedef = linedef;
  }

  getUVs(type, floorheight, ceilingheight, texture) {
    var linedef = this.linedef;

    var v1 = this.map.getVertex(linedef.v1),
        v2 = this.map.getVertex(linedef.v2);

    var diff = [v2.x - v1.x, v2.y - v1.y];


    if (!(texture instanceof WadJS.Texture || texture instanceof JSWad.Flat)) {
      texture = this.map.wad.getTexture(texture);
    }
    var width = texture.width,
        height = texture.height;

    var offsetx = (this.offsetx / width),
        offsety = -(this.offsety) / height;
    

    var lenx = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]) / width,
        leny = Math.abs(ceilingheight - floorheight) / height;

    // Texture alignment rules based on http://doom.wikia.com/wiki/Unpegged

    var upperUnpegged = linedef.flags & 0x08,
        lowerUnpegged = linedef.flags & 0x10;

    if (linedef.side2 == 65535) {
      // One sided
      if (lowerUnpegged) { 
        return [offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety];
      } else {
        return [offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety];
      }
    } else {
      if (type == 'top') { // double-sided upper
        if (upperUnpegged) {
          return [offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety];
        } else {
          return [offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety];
        }
      } else if (type == 'bottom') { // double-sided lower
        if (lowerUnpegged) {
          return [offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety];
        } else {
          return [offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety];
        }
      } else { // double-sided middle
        if (lowerUnpegged) { 
          return [offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety];
        } else {
          return [offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety];
        }
      }
    }
    return [0, 0, 0, 1, 1, 1, 1, 0];
  }
}

