import * as WadJS from '../wad.js';

export class Patch {
  constructor() {
    this.originx = 0;
    this.originy = 0;
    this.patch = 0;
    this.stepdir = 0;
    this.colormap = 0;
  }
  read(data, pos) {
    this.originx = WadJS.readInt16(data, pos);
    this.originy = WadJS.readInt16(data, pos + 2);
    this.patch = WadJS.readInt16(data, pos + 4);
    this.stepdir = WadJS.readInt16(data, pos + 6);
    this.colormap = WadJS.readInt16(data, pos + 8);
  }
}

export class PatchImage {
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
    this.width = WadJS.readUint16(data, pos);
    this.height = WadJS.readUint16(data, pos + 2);
    this.offsetx = WadJS.readInt16(data, pos + 4);
    this.offsety = WadJS.readInt16(data, pos + 6);
    this.columnpointers = WadJS.readUint32Array(data, pos + 8, this.width);

    this.columns = [];
    for (var x = 0; x < this.width; x++) {
      var column = new WadJS.PatchImageColumn(this.height);
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
export class PatchImageColumn {
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
      offset = WadJS.readUint8(data, pos + spanoffset);
      var pixelcount = WadJS.readUint8(data, pos + 1 + spanoffset);
      var garbage = WadJS.readUint8(data, pos + 2 + spanoffset);
      var pixels = WadJS.readUint8Array(data, pos + 3 + spanoffset, pixelcount);

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
