import * as WadJS from '../wad.js';

/**
 * Class representing a Flat, which contains texture data normally used for floors and ceilings
 *  https://zdoom.org/wiki/Flat
 */
export class Flat {
  constructor(name) {
    this.name = name;
    this.width = 64;
    this.height = 64;
    this.pixels = null;
    this.transparent = false;
  }

  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    if (!pos) pos = 0;
    this.pixels = WadJS.readUint8Array(data, pos, 4096);
  }

  /**
   * Parse the raw image data into a canvas, using the specified color palette
   * @param {WadJS.Palette} palette - color palette to apply to this texture
   * @returns {HTMLCanvasElement} canvas element with the texture data
   */
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

  /**
   * Get this texture in a power-of-two size
   * All Flats are already power of two, so we just return the canvas
   * @returns {HTMLCanvasElement} canvas element with the texture data
   */
  getPOT() {
    return this.canvas;
  }
}

