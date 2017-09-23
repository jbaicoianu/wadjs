import * as WadJS from '../wad.js';

export class Texture {
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
    this.name = WadJS.readString(data, pos, 8);
    this.flags = WadJS.readUint16(data, pos + 8);
    this.scalex = WadJS.readUint8(data, pos + 10);
    this.scaley = WadJS.readUint8(data, pos + 11);
    this.width = WadJS.readUint16(data, pos + 12);
    this.height = WadJS.readUint16(data, pos + 14);
    this.columndirectory = WadJS.readUint8Array(data, pos + 16, 4);
    this.patchcount = WadJS.readUint16(data, pos + 20);
    this.patches = [];
    for (var i = 0; i < this.patchcount; i++) {
      var patch = new WadJS.Patch();
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

