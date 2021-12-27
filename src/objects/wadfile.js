import * as WadJS from '../wad.js';

/**
 * Class representing a WAD file
 */

export class WadFile {
  constructor(url) {
    this.lumps = [];
    this.lumpmap = {};
    this.palettes = [];
    this.iwad = false;
    this.version = 'unknown';
    this.ids = {
      IWAD: 0x44415749,
      PWAD: 0x44415750
    };
    if (url) {
      this.load(url);
    }
  }

  /**
   * Load a WAD file from the specified URL
   * @param {string} url - URL of wad file
   * @return {promise} A promise which resolves with the newly-loaded WAD file
   */
  load(url) {
    return new Promise((resolve, reject) => {
      fetch(url).then((response) => {
        //console.log('Loading wad:', url);
        response.arrayBuffer().then((data) => {
          this.parse(data).then(resolve, reject);
        });
      });
    });
  }

  /**
   * Parse binary WAD data into usable objects
   * @param {ArrayBuffer|Uint8Array} Raw bytes
   * @param {integer} [offset] - byte offset to start at
   */
  parse(data, offset) {
    return new Promise((resolve, reject) => {
      if (!offset) offset = 0;
      if (data instanceof Uint8Array) data = data.buffer;
      //console.log('Parsing...', data);
      var wadtype = WadJS.readUint32(data, offset);
      this.iwad = (wadtype == this.ids.IWAD);

      var numlumps = WadJS.readUint32(data, offset + 4);
      var lumpoffsets = WadJS.readUint32(data, offset + 8);

      if (offset + lumpoffsets + (numlumps * 16) > data.length) {
        console.error("WAD.LoadFromData Error: Invalid lump info chunk.");
        return;
      }
      for (var i = 0; i < numlumps; i++) {
        var lump = new WadJS.Lump();
        var idx = offset + lumpoffsets + (i * 16);
        lump.read(data,
                  WadJS.readUint32(data, idx),
                  WadJS.readUint32(data, idx + 4),
                  WadJS.readString(data, idx + 8, 8),
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
      //console.log('Loaded ' + this.version + ' WAD data', this);
      resolve(this);
    });
  }

  /**
   * Get the data for a specified map within this WAD file
   * @param {string} mapname - name of map to load (eg, E1M1 or MAP01)
   * @return {WadJS.Map} Map object with all level data
   */
  getMap(mapname) {
    var map = new WadJS.Map(this, mapname);
    return map;
  }

  /**
   * Get all texture patches included in this WAD file
   * @return {array} List of PatchImage objects
   */
  getPatches() {
    if (!this.patches) {
      this.patches = [];

      var pnameslump = this.getLump('PNAMES');
      var pnames = new WadJS.PatchList();
      pnames.read(pnameslump.bytes);

      var palette = this.getPalette(0);

      for (var j = 0; j < pnames.numpatches; j++) {
        var patchname = pnames.patchnames[j].toUpperCase();
        var patchlump = this.getLump(patchname);
        //console.log('get patch', j, tex.patches[j].patch, patchname, patchlump);
        if (patchlump) {
          var patchimage = new WadJS.PatchImage(j);
          patchimage.read(patchlump.bytes);
          var canvas = patchimage.getCanvas(palette);
          //document.body.appendChild(canvas);

          this.patches[j] = patchimage;
        } else {
          console.log('WARNING - failed to load patch', patchname);
        }
      }
    }
    return this.patches;
  }

  /**
   * Get all textures included in this WAD file
   * @return {object} Map of Texture objects, keyed by texture name
   */
  getTextures() {
    if (!this.textures) {
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
          var tex = new WadJS.Flat(lump.name);
          tex.read(lump.bytes);
          tex.loadTexture(palette);
        }
        texturemap[tex.name.toLowerCase()] = tex;
      }
      
      this.textures = texturemap;
    }
    return this.textures;
  }

  /**
   * Get a specific texture from this WAD file
   * @param {string} texturename - name of texture to retrieve
   * @return {WadJS.Texture} Texture object
   */
  getTexture(texturename) {
    if (!this.textures) {
      this.textures = this.getTextures();
    }
    return this.textures[texturename.toLowerCase()];
  }

  /**
   * Get a TextureList object from the raw Lump data
   * @param {string} lumpname - name of lump which contains the data
   * @return {WadJS.TextureList} TextureList object
   */
  getTextureList(lumpname) {
    var texlump = this.lumps[this.lumpmap[lumpname]];
    var texlist = new WadJS.TextureList();
    if (texlump) {
      texlist.read(texlump.bytes);
    } else {
      console.error('Unknown lump:', lumpname);
    }
    return texlist;
  }

  /**
   * Get all sprites included in this WAD file
   * @return {object} Map of Sprite objects, keyed by sprite name
   */
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
          sprite = new WadJS.Sprite(spriteid);
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

  /**
   * Get a specific sprite from this WAD file
   * @param {string} spritename - name of sprite to retrieve
   * @return {WadJS.Sprite} Sprite object
   */
  getSprite(spritename) {
    if (!this.sprites) this.getSprites();
    return this.sprites[spritename]; // TODO - maybe return a default if sprite name isn't found?
  }

  /**
   * Get all HUD-related images
   * @return {object} Map of PatchImage objects, keyed by image name
   */
  getHUDImages() {
    var imagemap = {};
    var palette = this.getPalette(0);
    for (var k in this.lumpmap) {
      // HUD images start with ST, but ignore the STEP* images
      if (k[0] == 'S' && k[1] == 'T' && k[2] != 'E') {
        var lump = this.lumps[this.lumpmap[k]];
        if (lump.pos && lump.len) {
          try {
            var patchimg = new WadJS.PatchImage(this.lumpmap[k]);
            patchimg.read(lump.bytes, 0);
            patchimg.getCanvas(palette);
            imagemap[k.toLowerCase()] = patchimg;
          } catch (e) {
            console.log('Failed to load HUD image', k, patchimg);
          }
        }
      }
    }
    return imagemap;
  }

  /**
   * Get a Lump with the specified name
   * @param {string} lumpname - name of lump to retrieve
   * @return {WadJS.Lump} Lump object
   */
  getLump(lumpname) {
    return this.lumps[this.lumpmap[lumpname]];
  }

  /**
   * Get the specified texture palette from the WAD
   * @param {integer} paletteid - index of palette to retrieve
   * @return {WadJS.Palette} Palette object
   */
  getPalette(paletteid) {
    if (!this.palettes[paletteid]) {
      var palette = new WadJS.Palette();
      palette.read(this.getLump('PLAYPAL').bytes, 0);
      this.palettes[paletteid] = palette;
    }
    return this.palettes[paletteid];
  }

  /**
   * Get all sounds included in this WAD file
   * @return {object} Map of Sound objects, keyed by sound name
   */
  getSounds() {
    var sounds = {};
    for (var k in this.lumpmap) {
      if (k[0] == 'D' && k[1] == 'S') {
        sounds[k] = this.parseSound(this.lumps[this.lumpmap[k]]);
      }
    }
    this.sounds = sounds;
    return sounds;
  }

  /**
   * Parse a sound from binary data into unsigned float PCM data
   * @param {WadJS.Lump} Lump containing binary data
   * @return {object} Object representing sound data, rate, and samples
   * @todo This should really return a WadJS.Sound object (which doesn't exist yet)
   */
  parseSound(sndlump) {
    var samplerate = WadJS.readUint16(sndlump.bytes, 2);
    var numsamples = WadJS.readUint16(sndlump.bytes, 4);

    var pcm8bit = WadJS.readUint8Array(sndlump.bytes, 8, numsamples);

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
}

