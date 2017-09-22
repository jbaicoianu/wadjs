class JSWad {
  constructor(fname) {
    this.lumps = [];
    this.lumpmap = {};
    this.palettes = [];
    this.iwad = false;
    this.version = 'unknown';
    this.ids = {
      IWAD: 0x44415749,
      PWAD: 0x44415750
    };
    if (fname) {
      this.load(fname);
    }
  }

  load(fname) {
    return new Promise((resolve, reject) => {
      fetch(fname).then((response) => {
        console.log('Loading wad:', fname);
        response.arrayBuffer().then((data) => {
          this.parse(data).then(resolve, reject);
        });
      });
    });
  }

  getMap(mapname) {
    var map = new JSWad.Map(this, mapname);
    return map;
  }

  getPatches() {
    if (!this.patches) {
      this.patches = [];

      var pnameslump = this.getLump('PNAMES');
      var pnames = new JSWad.PatchList();
      pnames.read(pnameslump.bytes);

      var palette = this.getPalette(0);

      for (var j = 0; j < pnames.numpatches; j++) {
        var patchname = pnames.patchnames[j].toUpperCase();
        var patchlump = this.getLump(patchname);
        //console.log('get patch', j, tex.patches[j].patch, patchname, patchlump);
        if (patchlump) {
          var patchimage = new JSWad.PatchImage(j);
          patchimage.read(patchlump.bytes);
          var canvas = patchimage.getCanvas(palette);
          //document.body.appendChild(canvas);

          this.patches[j] = patchimage;
        } else {
          console.error('ERROR - failed to load patch', patchname);
        }
      }
    }
    return this.patches;
  }

  getTextures() {
    var pnames = this.lumps[this.lumpmap['PNAMES']],
        texture1 = this.getTextureList('TEXTURE1'),
        texture2 = this.getTextureList('TEXTURE2'),
        fstart = this.lumpmap['F_START'],
        fend = this.lumpmap['F_END'];


    console.log('textures!', texture1, texture2, pnames, fstart, fend); 

    texture1.loadTextures(this);
    texture2.loadTextures(this);

    var texturemap = {};
    for (var i = 0; i < texture1.textures.length; i++) {
      var tex = texture1.textures[i];
      texturemap[tex.name.toLowerCase()] = tex;
    }
    for (var i = 0; i < texture2.textures.length; i++) {
      var tex = texture2.textures[i];
      texturemap[tex.name.toLowerCase()] = tex;
    }

    var palette = this.getPalette(0);
    for (var i = fstart + 1; i < fend - 1; i++) {
      var lump = this.lumps[i];
      if (lump.pos && lump.len) {
        var tex = new JSWad.Flat(lump.name);
        tex.read(lump.bytes);
        tex.loadTexture(palette);
      }
      texturemap[tex.name.toLowerCase()] = tex;
    }
    
    this.textures = texturemap;
    return texturemap;
  }
  getTexture(texturename) {
    if (!this.textures) {
      this.textures = this.getTextures();
    }
    return this.textures[texturename.toLowerCase()];
  }

  getTextureList(lumpname) {
    var texlump = this.lumps[this.lumpmap[lumpname]];
    var texlist = new JSWad.TextureList();
    if (texlump) {
      texlist.read(texlump.bytes);
    } else {
      console.error('Unknown lump:', lumpname);
    }
    return texlist;
  }

  getSprites() {
    if (!this.sprites) {
      this.sprites = {};

      var palette = this.getPalette(0);

      var start = this.lumpmap['S_START'],
          end = this.lumpmap['S_END'],
          sprites = this.sprites;
      for (var i = start + 1; i < end - 1; i++) {
        var lump = this.lumps[i];
        var spriteid = lump.name.substr(0, 4),
            frameid = lump.name.substr(4, 1),
            angle = lump.name.substr(5, 1);
          
        var sprite = this.sprites[spriteid];
        if (!sprite) {
          sprite = new JSWad.Sprite(spriteid);
          sprite.setPalette(palette);
          this.sprites[spriteid] = sprite;
        }
        sprite.addFrame(frameid, angle, lump.bytes);

        var frame2id = lump.name.substr(6, 1),
            angle2 = lump.name.substr(7, 1);
        if (frame2id && angle2) {
          sprite.addFrame(frame2id, angle2, lump.bytes, true);
        }

        //console.log(spriteid, frameid, angle, sprite);
      }
    }
    return this.sprites;
  }
  getSprite(spritename) {
    if (!this.sprites) this.getSprites();
    return this.sprites[spritename]; // TODO - maybe return a default if sprite name isn't found?
  }

  getLump(lumpname) {
    return this.lumps[this.lumpmap[lumpname]];
  }

  getPalette(paletteid) {
    if (!this.palettes[paletteid]) {
      var palette = new JSWad.Palette();
      palette.read(this.getLump('PLAYPAL').bytes, 0);
      this.palettes[paletteid] = palette;
    }
    return this.palettes[paletteid];
  }

  getSounds() {
    var sounds = {};
    for (var k in this.lumpmap) {
      if (k[0] == 'D' && k[1] == 'S') {
        sounds[k] = this.parseSound(this.lumps[this.lumpmap[k]]);
      }
    }
    return sounds;
  }

  parse(data, offset) {
    return new Promise((resolve, reject) => {
      if (!offset) offset = 0;
      console.log('Parsing...', data);
      var wadtype = JSWad.readUint32(data, offset);
      if (wadtype == this.ids.IWAD) {
        this.iwad = true;
      }

      var numlumps = JSWad.readUint32(data, offset + 4);
      var lumpoffsets = JSWad.readUint32(data, offset + 8);

      if (offset + lumpoffsets + (numlumps * 16) > data.length) {
        console.error("WAD.LoadFromData Error: Invalid lump info chunk.");
        return;
      }
      for (var i = 0; i < numlumps; i++) {
        var lump = new JSWad.Lump();
        var idx = offset + lumpoffsets + (i * 16);
        
        lump.read(data, 
                  JSWad.readUint32(data, idx),
                  JSWad.readUint32(data, idx + 4),
                  JSWad.readString(data, idx + 8, 8),
                  offset);
        //this.lumps[lump.name] = lump;
        this.lumps.push(lump);
        this.lumpmap[lump.name] = this.lumps.length-1; // FIXME - many lumps use non-unique names, so we're clobbering indices here
      }

      // TODO - one day we might want to detect Heretic/Hexen/Strife support, too
      if (this.lumpmap['E1M1']) {
        this.version = 'doom1';
      } else if (this.lumpmap['MAP01']) {
        this.version = 'doom2';
      }
      console.log('Loaded ' + this.version + ' WAD data', this);
      resolve(this);
    });
  }

  parseSound(sndlump) {
    var samplerate = JSWad.readUint16(sndlump.bytes, 2);
    var numsamples = JSWad.readUint16(sndlump.bytes, 4);

    var pcm8bit = JSWad.readUint8Array(sndlump.bytes, 8, numsamples);

    var pcmdata = new Float32Array(numsamples);
    for (var i = 0; i < numsamples; i++) {
      pcmdata[i] = (pcm8bit[i] - 128) / 255;
    }

    return {
      rate: samplerate,
      samples: numsamples,
      pcm: pcmdata
    };
  }

  static readInt8(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int8Array(data, offset, 1);
    return arr[0];
  }
  static readUint8(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint8Array(data, offset, 1);
    return arr[0];
  }
  static readUint8Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint8Array(data, offset, count);
    return arr;
  }
  static readInt16(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int16Array(data, offset, 1);
    return arr[0];
  }
  static readUint16(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint16Array(data, offset, 1);
    return arr[0];
  }
  static readUint16Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint16Array(data, offset, count);
    return arr;
  }
  static readInt32(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int32Array(data, offset, 1);
    return arr[0];
  }
  static readUint32(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint32Array(data, offset, 1);
    return arr[0];
  }
  static readInt32Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int32Array(data, offset, count);
    return arr;
  }
  static readUint32Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint32Array(data, offset, count);
    return arr;
  }
  static readString(data, offset, length) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    if (!length) length = data.byteSize;
    var arr = new Uint8Array(data, offset),
        str = '';
    for (var i = 0; i < length; i++) {
      var chr = arr[i];
      if (chr === 0) break;
      str += String.fromCharCode(chr);
    }
    return str;
  }
  static readStringArray(data, offset, length, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    if (!count) return [];

    if (!length) length = data.byteSize / count;
    var arr = new Uint8Array(data, offset),
        strs = [];
    for (var i = 0; i < count; i++) {
      var str = '';
      var offset = i * length;
      for (var j = 0; j < length && offset + j < arr.length; j++) {
        var chr = arr[offset + j];
        if (chr === 0) break;
        str += String.fromCharCode(chr);
      }
      strs.push(str);
    }
    return strs;
  }
  static pointDistanceFromLine(px, py, lx, ly, dx, dy) {
    var d = (px - lx) * dy - (py - ly) * dx;
    return d;
  }
  static pointIsOnLine(px, py, lx, ly, dx, dy) {
    return false;
  }
}
JSWad.Lump = class {
  constructor() {
    this.name = '';
    this.pos = 0;
    this.len = 0;
    this.bytes = false;
  }
  read(data, pos, len, name, offset) {
    if (!offset) offset = 0;

    this.name = name;
    this.pos = pos;
    this.len = len;
    this.bytes = new Uint8Array(data, offset + pos, len);
  }
}

JSWad.Map = class {
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
      'THINGS': JSWad.Thing,
      'LINEDEFS': JSWad.Linedef,
      'SIDEDEFS': JSWad.Sidedef,
      'VERTEXES': JSWad.Vertex,
      'SEGS': JSWad.Segment,
      'SSECTORS': JSWad.Subsector,
      'NODES': JSWad.Node,
      'SECTORS': JSWad.Sector,
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
      this.texturegroups[texturename] = new JSWad.MapTextureGroup(this.wad.getTexture(texturename));
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
      var side = JSWad.pointDistanceFromLine(x, y, node.x, node.y, node.dx, node.dy)
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
    var p = new JSWad.Vertex(pos.x, pos.y),
        q = this.getVertex(seg.v1),
        r = new JSWad.Vertex(dir.x, dir.y),
        s = new JSWad.Vertex().copy(this.getVertex(seg.v2)).sub(q),
        tmp = new JSWad.Vertex();

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
    if (sectorid instanceof JSWad.Sector) {
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
JSWad.MapTextureGroup = class {
  constructor(texture) {
    this.vertices = [];
    this.faces = [];
    this.uvs = [];
    this.colors = [];
    this.texture = texture;
  }
  addQuad(v1, v2, floorheight, ceilingheight, linedef, side, sector1, sector2, isLower, isUpper) {
    var vertexOffset = this.vertices.length / 3;

    this.vertices.push(v1.x, v1.y, floorheight);   // bottom left
    this.vertices.push(v1.x, v1.y, ceilingheight); // top left
    this.vertices.push(v2.x, v2.y, ceilingheight); // top right
    this.vertices.push(v2.x, v2.y, floorheight);   // bottom right


/*
    var diff = [v2.x - v1.x, v2.y - v1.y];

    var width = this.texture.width,
        height = this.texture.height;

    var lenx = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]) / width,
        leny = Math.abs(ceilingheight - floorheight) / height;

    var offsetx = (side.offsetx / width),
        offsety = -(side.offsety) / height;
    
    // Texture alignment rules based on http://doom.wikia.com/wiki/Unpegged

    var upperUnpegged = linedef.flags & 0x08,
        lowerUnpegged = linedef.flags & 0x10;

    if (linedef.side2 == 65535) {
      // One sided
      if (lowerUnpegged) { 
        this.uvs.push(offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety);
      } else {
        this.uvs.push(offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety);
      }
    } else {
      if (isUpper) { // double-sided upper
        if (upperUnpegged) {
          this.uvs.push(offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety);
        } else {
          this.uvs.push(offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety);
        }
      } else if (isLower) { // double-sided lower
        if (lowerUnpegged) {
          this.uvs.push(offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety);
          //this.uvs.push(0,0,0,0,0,0,0,0);
        } else {
          this.uvs.push(offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety);
          //this.uvs.push(0,0,0,0,0,0,0,0);
        }
      } else { // double-sided middle
        if (lowerUnpegged) { 
          this.uvs.push(offsetx, offsety, offsetx, leny + offsety, lenx + offsetx, leny + offsety, lenx + offsetx, offsety);
        } else {
          this.uvs.push(offsetx, 1 - leny + offsety, offsetx, 1 + offsety, lenx + offsetx, 1 + offsety, lenx + offsetx, 1 - leny + offsety);
        }
        
      }
    }
*/
    var quadtype = (isUpper ? 'top' : (isLower ? 'bottom' : 'middle')) 
    var uvs = side.getUVs(quadtype, floorheight, ceilingheight, this.texture);
    this.uvs.push.apply(this.uvs, uvs);

    this.faces.push(vertexOffset, vertexOffset + 2, vertexOffset + 1);
    this.faces.push(vertexOffset, vertexOffset + 3, vertexOffset + 2);

    side.addQuad(quadtype, [vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset + 3]);

    // Use vertex colors to simulate sector lighting

    for (var i = 0; i < 4; i++) {
      this.colors.push(sector1.lightlevel / 255, sector1.lightlevel / 255, sector1.lightlevel / 255);
    }
/*
    this.colors.push(1, 0, 0);
    this.colors.push(1, 0, 0);
    this.colors.push(1, 0, 0);
    this.colors.push(1, 0, 0);
*/
  }
  add(vertices, faces, sector) {
    var lightlevel = sector.lightlevel / 255;
    var vertexoffset = this.vertices.length / 3;
    for (var i = 0; i < vertices.length; i++) {
      this.vertices.push(vertices[i]);
      this.colors.push(lightlevel);
    }
    for (var i = 0; i < vertices.length / 3; i++) {
      var x = vertices[i * 3] / 64,
          y = vertices[i * 3 + 1] / 64;
      this.uvs.push(x, y);
    }
    var newfaces = [];
    for (var i = 0; i < faces.length; i++) {
      this.faces.push(faces[i][0] + vertexoffset, faces[i][1] + vertexoffset, faces[i][2] + vertexoffset);
      newfaces.push(faces[i][0] + vertexoffset, faces[i][1] + vertexoffset, faces[i][2] + vertexoffset);
    }
    return newfaces;
  }
  getBuffers() {
    return {
      index: new Int32Array(this.faces),
      position: new Float32Array(this.vertices),
      uv: new Float32Array(this.uvs),
      color: new Float32Array(this.colors),
    }
  }
}
JSWad.Thing = class {
  constructor(map) {
    this.map = map;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.type = 0;
    this.options = 0;
  }
  read(data, pos) {
    this.x = JSWad.readInt16(data, pos);
    this.y = JSWad.readInt16(data, pos + 2);
    this.angle = JSWad.readInt16(data, pos + 4);
    this.type = JSWad.readInt16(data, pos + 6);
    this.options = JSWad.readInt16(data, pos + 8);
  }
  getByteSize() { return 10; }
}
JSWad.Linedef = class {
  constructor(map) {
    this.map = map;
    this.v1 = 0;
    this.v2 = 0;
    this.flags = 0;
    this.type = 0;
    this.tag = 0;
    this.side1 = 0;
    this.side2 = 0;
  }
  read(data, pos) {
    this.v1 = JSWad.readUint16(data, pos);
    this.v2 = JSWad.readUint16(data, pos + 2);
    this.flags = JSWad.readUint16(data, pos + 4);
    this.type = JSWad.readUint16(data, pos + 6);
    this.tag = JSWad.readUint16(data, pos + 8);
    this.side1 = JSWad.readUint16(data, pos + 10);
    this.side2 = JSWad.readUint16(data, pos + 12);
  }
  getByteSize() { return 14; }
}
JSWad.Linedef.flags = {
  BLOCKPLAYER: 0x1,
  BLOCKMONSTERS: 0x2,
  TWOSIDED: 0x4,
}

JSWad.Sidedef = class {
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
    this.offsetx = JSWad.readInt16(data, pos);
    this.offsety = JSWad.readInt16(data, pos + 2);
    this.toptexture = JSWad.readString(data, pos + 4, 8);
    this.bottomtexture = JSWad.readString(data, pos + 12, 8);
    this.midtexture = JSWad.readString(data, pos + 20, 8);
    this.sector = JSWad.readInt16(data, pos + 28);
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


    if (!(texture instanceof JSWad.Texture || texture instanceof JSWad.Flat)) {
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
JSWad.Segment = class {
  constructor(map) {
    this.map = map;
    this.v1 = 0;
    this.v2 = 0;
    this.angle = 0;
    this.linedef = 0;
    this.side = 0;
    this.offset = 0;
  }
  read(data, pos) {
    this.v1 = JSWad.readUint16(data, pos);
    this.v2 = JSWad.readUint16(data, pos + 2);
    this.angle = JSWad.readInt16(data, pos + 4);
    this.linedef = JSWad.readUint16(data, pos + 6);
    this.side = JSWad.readInt16(data, pos + 8);
    this.offset = JSWad.readInt16(data, pos + 10);
  }
  getByteSize() { return 12; }
}
JSWad.Subsector = class {
  constructor(map) {
    this.map = map;
    this.numsegs = 0;
    this.firstseg = 0;
  }
  read(data, pos) {
    this.numsegs = JSWad.readUint16(data, pos);
    this.firstseg = JSWad.readInt16(data, pos + 2);
  }
  getByteSize() {
    return 4;
  }
}

JSWad.Node = class {
  constructor(map) {
    this.map = map;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.boundingBoxLeft = new JSWad.BoundingBox();
    this.boundingBoxRight = new JSWad.BoundingBox();
    this.leftChild = 0;
    this.rightChild = 0;
  }
  read(data, pos) {
    this.x = JSWad.readInt16(data, pos);
    this.y = JSWad.readInt16(data, pos + 2);
    this.dx = JSWad.readInt16(data, pos + 4);
    this.dy = JSWad.readInt16(data, pos + 6);
    this.boundingBoxLeft.read(data, pos + 8);
    this.boundingBoxRight.read(data, pos + 16);
    this.leftChild = JSWad.readUint16(data, pos + 24);
    this.rightChild = JSWad.readUint16(data, pos + 26);
  }
  getByteSize() {
    return 28;
  }
}
JSWad.Vertex = class {
  constructor(x, y) {
    this.x = (x === undefined ? 0 : x);
    this.y = (y === undefined ? this.x : y);
  }
  read(data, pos) {
    this.x = JSWad.readInt16(data, pos);
    this.y = JSWad.readInt16(data, pos + 2);
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
JSWad.BoundingBox = class {
  constructor() {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
  }
  read(data, pos) {
    this.x1 = JSWad.readInt16(data, pos);
    this.y1 = JSWad.readInt16(data, pos + 2);
    this.x2 = JSWad.readInt16(data, pos + 4);
    this.y2 = JSWad.readInt16(data, pos + 6);
  }
  getByteSize() {
    return 8;
  }
  containsPoint(x, y) {
    return (x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2);
  }
}
JSWad.Sector = class {
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
    this.floorheight = JSWad.readInt16(data, pos);
    this.ceilingheight = JSWad.readInt16(data, pos + 2);
    this.floorpic = JSWad.readString(data, pos + 4, 8);
    this.ceilingpic = JSWad.readString(data, pos + 12, 8);
    this.lightlevel = JSWad.readInt16(data, pos + 20);
    this.special = JSWad.readInt16(data, pos + 22);
    this.tag = JSWad.readInt16(data, pos + 24);
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
JSWad.TextureList = class {
  constructor() {
    this.numtextures = 0;
    this.textureoffsets = [];
    this.textures = [];
  }
  read(data) {
    this.numtextures = JSWad.readInt32(data, 0);
    this.textureoffsets = JSWad.readInt32Array(data, 4, this.numtextures);

    for (var i = 0; i < this.numtextures; i++) {
      var tex = new JSWad.Texture();
      tex.read(data, this.textureoffsets[i]);
      this.textures.push(tex);
    }
  }
  loadTextures(wad) {
    var patches = wad.getPatches();
    for (var i = 0; i < this.textures.length; i++) {
      var tex = this.textures[i];
      //console.log('- load texture:', tex);

      tex.loadTexture(patches);
    }
  }
}
JSWad.Flat = class {
  constructor(name) {
    this.name = name;
    this.width = 64;
    this.height = 64;
    this.pixels = null;
    this.transparent = false;
  }
  read(data, pos) {
    if (!pos) pos = 0;
    this.pixels = JSWad.readUint8Array(data, pos, 4096);
  }
  loadTexture(palette) {
    if (!this.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      var ctx = canvas.getContext('2d');

      if (this.name == 'F_SKY1') {
        this.transparent = true;
        return this.canvas;
      }

      var colors = new Uint8ClampedArray(this.width * this.height * 4);
      for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
          var pixelnum = y * this.width + x;
          var offset = (y * this.width + x) * 4
          var color = palette.getColor(this.pixels[pixelnum]);
          colors[offset] = color[0];
          colors[offset + 1] = color[1];
          colors[offset + 2] = color[2];
          colors[offset + 3] = 255;
        }
      }
      var imagedata = new ImageData(colors, this.width, this.height);
      ctx.putImageData(imagedata, 0, 0);

/*
      var div = document.createElement('div');
      var div2 = document.createElement('div');
      div.className = 'texture';
      div.innerHTML = '<h5>' + this.name + '</h5>';
      div.appendChild(div2);
      div2.appendChild(canvas);
      document.body.appendChild(div);
*/
      this.canvas = canvas;
    }
    return this.canvas;
  }
  getPOT() {
    return this.canvas;
  }
}
JSWad.Texture = class {
  constructor() {
    this.name = '';
    this.flags = 0;
    this.scalex = 8;
    this.scaley = 8;
    this.width = 0;
    this.height = 0;
    this.columndirectory = null;
    this.patchcount = 0;
    this.patches = null;
    this.transparent = false;

    this.potwidth = 0;
    this.potheight = 0;
  }
  read(data, pos) {
    this.name = JSWad.readString(data, pos, 8);
    this.flags = JSWad.readUint16(data, pos + 8);
    this.scalex = JSWad.readUint8(data, pos + 10);
    this.scaley = JSWad.readUint8(data, pos + 11);
    this.width = JSWad.readUint16(data, pos + 12);
    this.height = JSWad.readUint16(data, pos + 14);
    this.columndirectory = JSWad.readUint8Array(data, pos + 16, 4);
    this.patchcount = JSWad.readUint16(data, pos + 20);
    this.patches = [];
    for (var i = 0; i < this.patchcount; i++) {
      var patch = new JSWad.Patch();
      patch.read(data, pos + 22 + i * 10);
      this.patches.push(patch);
    }
    this.potwidth = this.getNextPOT(this.width);
    this.potheight = this.getNextPOT(this.height);
  }
  loadTexture(patches) {
    if (!this.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      var ctx = canvas.getContext('2d');

      for (var j = 0; j < this.patchcount; j++) {
        var patchimage = patches[this.patches[j].patch];
        var patch = this.patches[j]; 
        if (patchimage) {
          var patchcanvas = patchimage.getCanvas();
          ctx.drawImage(patchcanvas, patch.originx, patch.originy);
        }
      }

      var pixeldata = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var hasalpha = false;
      for (var i = 3; i < pixeldata.data.length; i += 4) {
        if (pixeldata.data[i] != 255) {
          hasalpha = true;
          break;
        }
      }
      this.transparent = hasalpha;

/*
      var div = document.createElement('div');
      var div2 = document.createElement('div');
      div.className = 'texture';
      div.innerHTML = '<h5>' + this.name + '</h5>';
      div.appendChild(div2);
      div2.appendChild(canvas);
      document.body.appendChild(div);
*/
      this.canvas = canvas;
    }
    return this.canvas;
  }
  getPOT() {
    var orig = this.canvas;
    var newwidth = this.getNextPOT(orig.width),
        newheight = this.getNextPOT(orig.height);
    var canvas = orig;
    if (newwidth != orig.width || newheight != orig.height) {
      canvas = document.createElement('canvas');
      canvas.width = newwidth;
      canvas.height = newheight;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(orig, 0, 0, newwidth, newheight);
    }
    return canvas;
  }
  getNextPOT(x) {
    return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
  }
}
JSWad.PatchList = class {
  constructor() {
    this.numpatches = 0;
    this.patchnames = null;
  }
  read(data, pos) {
    if (!pos) pos = 0;
    this.numpatches = JSWad.readUint32(data, pos);
    this.patchnames = JSWad.readStringArray(data, pos + 4, 8, this.numpatches);
  }
}
JSWad.Patch = class {
  constructor() {
    this.originx = 0;
    this.originy = 0;
    this.patch = 0;
    this.stepdir = 0;
    this.colormap = 0;
  }
  read(data, pos) {
    this.originx = JSWad.readInt16(data, pos);
    this.originy = JSWad.readInt16(data, pos + 2);
    this.patch = JSWad.readInt16(data, pos + 4);
    this.stepdir = JSWad.readInt16(data, pos + 6);
    this.colormap = JSWad.readInt16(data, pos + 8);
  }
}
JSWad.PatchImage = class {
  constructor(id) {
    this.id = id;
    this.width = 0;
    this.height = 0;
    this.offsetx = 0;
    this.offsety = 0;

    this.columnpointers = null;
    this.columns = null;

    this.canvas = false;
  }
  read(data, pos) {
    if (!pos) pos = 0;
    this.width = JSWad.readUint16(data, pos);
    this.height = JSWad.readUint16(data, pos + 2);
    this.offsetx = JSWad.readInt16(data, pos + 4);
    this.offsety = JSWad.readInt16(data, pos + 6);
    this.columnpointers = JSWad.readUint32Array(data, pos + 8, this.width);

    this.columns = [];
    for (var x = 0; x < this.width; x++) {
      var column = new JSWad.PatchImageColumn(this.height);
      column.read(data, this.columnpointers[x]);
      this.columns.push(column);
    }
  }
  getCanvas(palette, mirrored) {
    if (!this.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      var ctx = canvas.getContext('2d');
      var colors = new Uint8ClampedArray(this.width * this.height * 4);
      for (var x = 0; x < this.width; x++) {
        var column = this.columns[(mirrored ? this.width - x - 1 : x)];
        for (var y = 0; y < column.pixels.length; y++) {
          var offset = ((y * this.width) + x) * 4;
          var idx = column.pixels[y];
          if (idx !== undefined) {
            var color = palette.getColor(idx);
            colors[offset] = color[0];
            colors[offset+1] = color[1];
            colors[offset+2] = color[2];
            colors[offset+3] = 255;
          } else {
            colors[offset] = 0;
            colors[offset+1] = 255;
            colors[offset+2] = 255;
            colors[offset+3] = 0;
          }
        }
      }
      var imagedata = new ImageData(colors, this.width, this.height);
      ctx.putImageData(imagedata, 0, 0);
      this.canvas = canvas;

/*
      var div = document.createElement('div');
      var div2 = document.createElement('div');
      div.className = 'texture';
      div.innerHTML = '<h5>' + this.name + '</h5>';
      div.appendChild(div2);
      div2.appendChild(canvas);
      document.body.appendChild(div);
*/
    }

    return this.canvas;
  }
}
JSWad.PatchImageColumn = class {
  constructor(height) {
    this.height = height;
    this.pixels = new Array(height)
  }
  read(data, pos) {
    if (!pos) pos = 0;
    var spanoffset = 0;
var dur = 0;
    var offset;
    do {
      offset = JSWad.readUint8(data, pos + spanoffset);
      var pixelcount = JSWad.readUint8(data, pos + 1 + spanoffset);
      var garbage = JSWad.readUint8(data, pos + 2 + spanoffset);
      var pixels = JSWad.readUint8Array(data, pos + 3 + spanoffset, pixelcount);

      if (offset == 255) {
        break;
      }


      for (var i = 0; i < pixelcount; i++) {
        this.pixels[offset + i] = pixels[i];
      }

      spanoffset += 4 + pixelcount;
dur++;
    } while (dur < 256 && offset != 255);
  }
}
JSWad.Palette = class {
  constructor() {
    this.colors = [];
  }
  read(data, pos) {
    if (!pos) pos = 0;
    var rgbdata = JSWad.readUint8Array(data, pos, 768);
    for (var i = 0; i < 256; i++) {
      var idx = i * 3;
      this.colors[i] = rgbdata.slice(idx, idx + 3);
    }
  }
  getColor(idx) {
    return this.colors[idx];
  }
}
JSWad.Sprite = class {
  constructor(id) {
    this.id = id;
    this.frames = {};

    this.frame = false;
    this.angle = false;

    this.hasAngles = false;
  }
  setPalette(palette) {
    this.palette = palette;
  }
  addFrame(frameid, angle, bytes, mirrored) {
    if (!this.frames[frameid]) {
      this.frames[frameid] = {};
    }
    var frameimg = new JSWad.PatchImage(this.id + frameid + angle);
    frameimg.read(bytes);
    frameimg.getCanvas(this.palette, mirrored);
    this.frames[frameid][angle] = frameimg;

    if (!this.canvas) {
      this.frame = frameid;
      this.angle = angle;

      // If we haven't created a canvas yet, we'll make one now
      this.canvas = document.createElement('canvas');
      this.canvas.width = frameimg.width;
      this.canvas.height = frameimg.height;
    }
  }
  setActiveFrame(frameid) {
    this.frame = frameid;
    this.updateCanvas();
  }
  setActiveAngle(angle) {
    this.angle = angle;
    this.updateCanvas();
  }
  frameHasAngles(frameid) {
    return typeof this.frames[frameid][0] == 'undefined';
  }
  updateCanvas() {
    var ctx = this.canvas.getContext('2d');
    var angles = this.frames[this.frame];
    var frame = (this.angle && angles[this.angle] ? angles[this.angle] : angles[0]);
    if (!frame) {
      console.log('ERROR - no frame!', this.frame, this.angle, this);
      return;
    }
    this.canvas.width = frame.width;
    this.canvas.height = frame.height;
    ctx.drawImage(frame.canvas, 0, 0);
  }
  animate() {
    var frameids = Object.keys(this.frames);
    var framenum = (frameids.indexOf(this.frame) + 1) % frameids.length;
    this.frame = frameids[framenum];
    this.updateCanvas();
  }
}
