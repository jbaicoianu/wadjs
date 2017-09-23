import * as WadJS from '../wad.js';

export class TextureList {
  constructor() {
    this.numtextures = 0;
    this.textureoffsets = [];
    this.textures = [];
  }
  read(data) {
    this.numtextures = WadJS.readInt32(data, 0);
    this.textureoffsets = WadJS.readInt32Array(data, 4, this.numtextures);

    for (var i = 0; i < this.numtextures; i++) {
      var tex = new WadJS.Texture();
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

