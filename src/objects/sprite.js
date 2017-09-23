import * as WadJS from '../wad.js';

export class Sprite {
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
    var frameimg = new WadJS.PatchImage(this.id + frameid + angle);
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

