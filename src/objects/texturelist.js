import * as WadJS from '../wad.js';

/**
 * Class representing a list of Texture objects
 * https://zdoom.org/wiki/Texture
 */
export class TextureList {
  constructor() {
    this.numtextures = 0;
    this.textureoffsets = [];
    this.textures = [];
  }

  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   */
  read(data) {
    this.numtextures = WadJS.readInt32(data, 0);
    this.textureoffsets = WadJS.readInt32Array(data, 4, this.numtextures);

    for (var i = 0; i < this.numtextures; i++) {
      var tex = new WadJS.Texture();
      tex.read(data, this.textureoffsets[i]);
      this.textures.push(tex);
    }
  }

  /**
   * Initialize all textures with patches from the WAD
   * @param {WadJS.WadFile} wad - wad file
   */
  loadTextures(wad) {
    var patches = wad.getPatches();
    for (var i = 0; i < this.textures.length; i++) {
      var tex = this.textures[i];
      tex.loadTexture(patches);
    }
  }
}

