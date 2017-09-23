import * as WadJS from '../wad.js';

export class Map {
  constructor(wad, name) {
    this.things = [];
    this.linedefs = [];
    this.sidedefs = [];
    this.vertexes = [];
    this.segs = [];
    this.ssectors = [];
    this.nodes = [];
    this.sectors = [];

    this.wad = wad;

    this.classmap = {
      'THINGS': WadJS.Thing,
      'LINEDEFS': WadJS.Linedef,
      'SIDEDEFS': WadJS.Sidedef,
      'VERTEXES': WadJS.Vertex,
      'SEGS': WadJS.Segment,
      'SSECTORS': WadJS.Subsector,
      'NODES': WadJS.Node,
      'SECTORS': WadJS.Sector,
    };

    if (wad && name) {
      this.load(wad, name);
    }
  }

  load(wad, name) {
    var index = wad.lumpmap[name];
    var lumps = wad.lumps;
    console.log('load that map', name);

    this.readLump(this.things, lumps[index + 1], 'THINGS');
    this.readLump(this.linedefs, lumps[index + 2], 'LINEDEFS');
    this.readLump(this.sidedefs, lumps[index + 3], 'SIDEDEFS');
    this.readLump(this.vertexes, lumps[index + 4], 'VERTEXES');
    this.readLump(this.segs, lumps[index + 5], 'SEGS');
    this.readLump(this.ssectors, lumps[index + 6], 'SSECTORS');
    this.readLump(this.nodes, lumps[index + 7], 'NODES');
    this.readLump(this.sectors, lumps[index + 8], 'SECTORS');

    // TODO - read optional REJECT and BLOCKMAP lumps
  }

  readLump(list, lump, name) {
    if (this.classmap[name]) {
      var index = 0;
      var data = lump.bytes;
      var i = 0;
      while (index < data.length) {
        var obj = new this.classmap[name](this, i++);
        obj.read(data, index);
        list.push(obj);
        index += obj.getByteSize();
      }
    }
  }

  getGeometry() {
    var vertices = [],
        faces = [];

    var sectormap = [],
        materials = [];

    var texturegroups = this.texturegroups = {};

    for (var i = 0; i < this.linedefs.length; i++) {
      var linedef = this.linedefs[i];

      var v1 = this.getVertex(linedef.v1),
          v2 = this.getVertex(linedef.v2);

      var side1 = this.getSidedef(linedef.side1),
          side2 = this.getSidedef(linedef.side2);

      var vertexOffset = vertices.length / 3,
          faceOffset = faces.length / 3;

      if (side1 && side2) {
        // Both sides are visible, we need to compare adjacent sectors to determine which faces to draw
        var sector1 = this.getSector(side1.sector),
            sector2 = this.getSector(side2.sector);

        side1.setLinedef(linedef);
        side1.setFlipside(side2);

        side2.setLinedef(linedef);
        side2.setFlipside(side1);

        if (!sectormap[side1.sector]) sectormap[side1.sector] = [];
        if (!sectormap[side2.sector]) sectormap[side2.sector] = [];
        sectormap[side1.sector].push(linedef);
        sectormap[side2.sector].push(linedef);

        var maxfloor = Math.max(sector1.floorheight, sector2.floorheight),
            minceil = Math.min(sector1.ceilingheight, sector2.ceilingheight);
        if (side1.midtexture != '-') {
          this.getTextureGroup(side1.midtexture).addQuad(v1, v2, maxfloor, minceil, linedef, side1, sector1, sector2, false, false);
        }
        if (side2.midtexture != '-') {
          this.getTextureGroup(side2.midtexture).addQuad(v2, v1, maxfloor, minceil, linedef, side2, sector2, sector1, false, false);
        }

        //if (sector1.floorheight != sector2.floorheight) {
          if (side1.bottomtexture != '-') {
            this.getTextureGroup(side1.bottomtexture).addQuad(v1, v2, sector1.floorheight, sector2.floorheight, linedef, side1, sector1, sector2, true, false);
          }
          if (side2.bottomtexture != '-') {
            this.getTextureGroup(side2.bottomtexture).addQuad(v2, v1, sector2.floorheight, sector1.floorheight, linedef, side2, sector2, sector1, true, false);
          }
        //}
        //if (sector1.ceilingheight != sector2.ceilingheight && !(sector1.ceilingpic == 'F_SKY1' && sector2.ceilingpic == 'F_SKY1')) {
        if (!(sector1.ceilingpic == 'F_SKY1' && sector2.ceilingpic == 'F_SKY1')) {
          if (side1.toptexture != '-') {
            this.getTextureGroup(side1.toptexture).addQuad(v1, v2, sector2.ceilingheight, sector1.ceilingheight, linedef, side1, sector1, sector2, false, true);
          }
          if (side2.toptexture != '-') {
            this.getTextureGroup(side2.toptexture).addQuad(v2, v1, sector1.ceilingheight, sector2.ceilingheight, linedef, side2, sector2, sector1, false, true);
          }
        }
      } else if (side1) {
        // Only one side is visible, so we only need to generate the middle section
        var sector = this.getSector(side1.sector);
        side1.setLinedef(linedef);
        var texturename = side1.midtexture;
        if (texturename != '-') {
          if (!sectormap[side1.sector]) sectormap[side1.sector] = [];
          sectormap[side1.sector].push(linedef);

          var texturegroup = this.getTextureGroup(texturename);
          texturegroup.addQuad(v1, v2, sector.floorheight, sector.ceilingheight, linedef, side1, sector, false, false);
        }
      }
    }

    // Store sector map so we can serve it up when asked
    this.sectormap = sectormap;

    var geometries = {};
    for (var k in this.texturegroups) {
      geometries[k] = texturegroups[k].getBuffers();
    }
    return geometries;
  }

  getSectorMap() {
    return this.sectormap;
  }

  getTextureGroup(texturename) {
    if (!this.texturegroups[texturename]) {
      this.texturegroups[texturename] = new WadJS.MapTextureGroup(this.wad.getTexture(texturename));
    }
    return this.texturegroups[texturename];
  }

  getThings() {
    return this.things;
  }
  getThingsByType(type) {
    var things = [];
    if (this.things) {
      for (var i = 0; i < this.things.length; i++) {
        if (this.things[i].type == type) {
          things.push(this.things[i]);
        }
      }
    }
    return things;
  }

  getHeight(x, y) {
    var sector = this.getSectorAt(x, y);
    return sector ? sector.floorheight : Infinity;
  }
  getSubsectorAt(x, y) {
    var node = this.nodes[this.nodes.length - 1];
    var ssectorid, nextnodeid;
    while (node) {
      var side = WadJS.pointDistanceFromLine(x, y, node.x, node.y, node.dx, node.dy)
      if (side < 0) {
        nextnodeid = node.rightChild;
      } else if (side >= 0) {
        nextnodeid = node.leftChild;
      } else {
        console.log('UNCLEAN!', [x, y], node, side);
        return;
      }
      if (nextnodeid & 32768) {
        // found a leaf node, break
        ssectorid = nextnodeid & ~32768;
        break;
      } else {
        node = this.getNode(nextnodeid);
      }
    }
//console.log(ssectorid, nextnodeid);
    return this.ssectors[ssectorid];
  }
  getSectorAt(x, y) {
    var ssector = this.getSubsectorAt(x, y);
    if (!ssector) {
      console.log('couldnt find sector', x, y, ssectorid);
      return null;
    }
    var seg = this.segs[ssector.firstseg];
    var linedef = this.getLinedef(seg.linedef);
    var side = this.getSidedef(seg.side ? linedef.side2 : linedef.side1);
    return this.getSector(side.sector);
  }
  getIntersections(pos, dir, len) {
    if (len === undefined) len = 5000;
//console.log('getIntersections', pos, dir, len);

    var intersections = [];
    var ssector = this.getSubsectorAt(pos.x, pos.y);
    var dist = 0;
    //while (ssector && dist < len) {
      var hit = false;
      for (var i = 0; i < ssector.numsegs; i++) {
        var seg = this.segs[ssector.firstseg + i];
        var intersectionpoint = this.getIntersectionPoint(seg, pos, dir.clone().multiplyScalar(len));
        if (intersectionpoint) {
          // FIXME - should take into account height!
          dist = Math.sqrt(Math.pow(pos.x - intersectionpoint.x, 2) + Math.pow(pos.y - intersectionpoint.y, 2));
//console.log(dist, len);
          if (dist <= len) {
            intersections.push([seg, intersectionpoint, dist]);
            hit = true;
            var linedef = this.getLinedef(seg.linedef);
            //ssector = this.getSubsector(linedef.direction == 0 ? );
            if (linedef.side1 == 65535) {
              // one-sided linedefs stop raycasting, to prevent raycasts from hitting buttons in other sectos
              dist = Infinity;
            } else {
              // get ssector on the other side of this segment
/*
              var blurf = this.getIntersections(translate(intersectionpoint, scalarMultiply(dir, .1)), dir, len - dist - .1);
              if (blurf) {
                intersections.push.apply(intersections, blurf);
              }
*/
console.log('traverse', dist, len);
/*
              for (var j = 0; j < this.segs.length; j++) {
                var flipseg = this.segs[j];
                if (seg.linedef == flipseg.linedef && seg.side != flipseg.side) {
                  ssector = this.getSubsectorBySegmentID(j);
                  break;
                }
              }
*/
            }
          }
          //break;
        }
      }
      if (!hit) dist = Infinity;
    //}
    return intersections;
  }
  getIntersectionPoint(seg, pos, dir) {
    var p = new WadJS.Vertex(pos.x, pos.y),
        q = this.getVertex(seg.v1),
        r = new WadJS.Vertex(dir.x, dir.y),
        s = new WadJS.Vertex().copy(this.getVertex(seg.v2)).sub(q),
        tmp = new WadJS.Vertex();

    var RcrossS = r.cross(s);
    if (RcrossS != 0) {
      var QminusP = tmp.subVertex(q, p);
      var QminusPcrossS = QminusP.cross(s);
      var QminusPcrossR = QminusP.cross(r);
      var t = QminusPcrossS / RcrossS;
      var u = QminusPcrossR / RcrossS;

      if (0 <= t && t <= 1 && 
          0 <= u && u <= 1) {
//console.log(p, q, r, s, t, u);
        return tmp.copy(dir).multiplyScalar(t).add(pos);
      }
    }
    // TODO - do we need to handle the colinear case?
    return null;
  }

  getEntity(list, id) { return (id < 0 || id > list.length ? null : list[id]); }
  getLinedef(id) { return this.getEntity(this.linedefs, id); }
  getSidedef(id) { return this.getEntity(this.sidedefs, id); }
  getSector(id) { return this.getEntity(this.sectors, id); }
  getVertex(id) { return this.getEntity(this.vertexes, id); }
  getNode(id) { return this.getEntity(this.nodes, id); }

  getSidedefsBySector(sectorid) {
    var sidedefs = [];
    for (var i = 0; i < this.sidedefs.length; i++) {
      if (this.sidedefs[i].sector == sectorid) {
        sidedefs.push(this.sidedefs[i]);
      }
    }
    return sidedefs;
  }
  getAdjacentSectors(sectorid) {
    if (sectorid instanceof WadJS.Sector) {
      sectorid = this.sectors.indexOf(sectorid);
    }
    var sectors = [];
    for (var i = 0; i < this.sidedefs.length; i++) {
      var thisside = this.getSidedef(i);
      if (thisside.sector == sectorid) {
        if (thisside.flipside) {
          sectors.push(this.getSector(thisside.flipside.sector));
        }
      }
    }
    return sectors;
  }

  getSectorsByTag(tag) {
    var sectors = [];
    for (var i = 0; i < this.sectors.length; i++) {
      if (this.sectors[i].tag == tag) {
        sectors.push(this.sectors[i]);
      }
    }
    return sectors;
  }
  getSubsectorBySegmentID(segid) {
    for (var i = 0; i < this.ssectors.length; i++) {
      var ssector = this.ssectors[i];
      if (ssector.firstseg <= segid && segid < ssector.firstseg + ssector.numsegs) {
        return ssector;
      }
    }
    return null;
  }
}

