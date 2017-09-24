import * as WadJS from '../wad.js';

/**
 * Class representing a Sprite
 * https://zdoom.org/wiki/Sprite
 */
export class Sprite {
  constructor(id) {
    this.id = id;
    this.frames = {};

    this.frame = false;
    this.angle = false;

    this.hasAngles = false;
  }

  /**
   * Set the palette this sprite will use
   * @param {WadJS.Palette} palette - color palette
   */
  setPalette(palette) {
    this.palette = palette;
  }

  /**
   * Add a frame to this spite
   * @param {string} frameid - frame ID
   * @param {integer} angle - view angle for this frame
   * @param {bytes} bytes - image data
   * @param {boolean} mirrored - flip horizontally
   */
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

  /**
   * Set the specified frame active
   * @param {string} frameid - frame ID
   */
  setActiveFrame(frameid) {
    this.frame = frameid;
    this.updateCanvas();
  }

  /**
   * Set the current viewing angle for this sprite
   * @param {integer} angle - viewing angle
   */
  setActiveAngle(angle) {
    this.angle = angle;
    this.updateCanvas();
  }

  /**
   * Determine if a sprite has multiple viewing angles or not
   * @param {string} frameid - frame ID
   * @returns {boolean} has angles
   */
  frameHasAngles(frameid) {
    return typeof this.frames[frameid][0] == 'undefined';
  }

  /**
   * Update the canvas with the current frame and viewing angle
   */
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

  /**
   * Advance sprite by one frame and update the canvas
   */
  animate() {
    var frameids = Object.keys(this.frames);
    var framenum = (frameids.indexOf(this.frame) + 1) % frameids.length;
    this.frame = frameids[framenum];
    this.updateCanvas();
  }
}

