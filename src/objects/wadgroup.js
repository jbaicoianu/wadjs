import * as WadJS from '../wad.js';

/**
 * Class representing a stack of one IWAD and 0 or more PWADs
 */

export class WadGroup {
  constructor(url) {
    this.iwad = null;
    this.pwads = {};
  }

  /**
   * Load a WAD file from the specified URL
   * @param {string} url - URL of wad file
   * @return {promise} A promise which resolves with the newly-loaded WAD file
   */
  async load(url) {
    let wad = new WadJS.WadFile();
    await wad.load(url);
    if (wad.iwad) {
console.log('loaded an IWAD', wad);
      this.iwad = wad;
    } else {
console.log('loaded a PWAD', wad);
      this.pwads[url] = wad;
    }
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
  getLump(lumpname, offset=0) {
    let pwadkeys = Object.keys(this.pwads);
    for (let i = pwadkeys.length - 1; i >= 0; i--) {
      let lump = this.pwads[pwadkeys[i]].getLump(lumpname, offset);
      if (lump) return lump;
    }
    return this.iwad.getLump(lumpname, offset);
  }
  getHUDImages() {
    // TODO - check pwads as well
    return this.iwad.getHUDImages();
  }
  /**
   * Get all textures included in this WAD file
   * @return {object} Map of Texture objects, keyed by texture name
   */
  getTextures() {
    if (!this.textures) {
      var pnames = this.getLump('PNAMES'),
          texture1 = this.getTextureList('TEXTURE1'),
          texture2 = this.getTextureList('TEXTURE2'),
          fstart = this.iwad.lumpmap['F_START'],
          fend = this.iwad.lumpmap['F_END'];

      //console.log('textures!', texture1, texture2, pnames, fstart, fend); 

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

      var palette = this.iwad.getPalette(0);

      for (var i = fstart + 1; i < fend - 1; i++) {
        var lump = this.iwad.lumps[i],
            lumpname = lump.name;
        // Allow pwads to override built-in lumps by name
        for (let k in this.pwads) {
          let plump = this.pwads[k].getLump(lumpname);
          if (plump) {
            lump = plump;
          }
        }
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
    var texlump = this.getLump(lumpname);
    var texlist = new WadJS.TextureList();
    if (texlump) {
      texlist.read(texlump.bytes);
    } else {
      console.error('Unknown lump:', lumpname);
    }
console.log('texture list!', texlist);
    return texlist;
  }
  getSounds() {
    // TODO - check pwads as well
    this.sounds = this.iwad.getSounds();
    return this.sounds;
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

      var palette = this.iwad.getPalette(0); // FIXME - should we read palettes from pwads too?

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
  getSprites() {
    let palette = this.iwad.getPalette(0); // FIXME - should we read palettes from pwads too?
    this.sprites = this.iwad.getSprites(palette);
    for (let k in this.pwads) {
      let psprites = this.pwads[k].getSprites(palette);
      if (psprites) {
        for (let s in psprites) {
console.log('REPLACE SPRITE', s, psprites[s]);
          this.sprites[s] = psprites[s];
        }
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
}
