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
   * Add a frame to this sprite
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

/*
    if (!this.canvas) {
      this.frame = frameid;
      this.angle = angle;

      // If we haven't created a canvas yet, we'll make one now
      this.canvas = document.createElement('canvas');
      this.canvas.width = frameimg.width;
      this.canvas.height = frameimg.height;
    }
*/
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
/*
    var frameids = Object.keys(this.frames);
    var framenum = (frameids.indexOf(this.frame) + 1) % frameids.length;
    this.frame = frameids[framenum];
    if (this.frameHasAngles(this.frame)) {
      if (this.angle === 0) {
        this.angle = 1;
      }
    } else {
      this.angle = 0;
    }
    this.updateCanvas();
*/
  }
  getSpriteSheet() {
    // Build a sprite map, packing them into the spritesheet from left to right until we hit the max width
    // Once we hit max width, start a new row, using the height of the talles object from the previous row as our new baseline
    // Keep a record of the offsets and sizes for each frame, so we can map back to them and update UVs to play the animation forward
    // There are probably smarter packing algorithms out there, but this will get us started and we can revisit if we need to later

    if (!this.canvas) {
      let maxdim = 1024;

      let framemap = {},
          x = 0,
          y = 0,
          lineheight = 0,
          maxwidth = 0;

      for (let frameid in this.frames) {
        let angles = this.frames[frameid];
        if (!framemap[frameid]) framemap[frameid] = {};
        for (let angle in angles) {
          let frame = angles[angle];
          if (frame.height > lineheight) {
            lineheight = frame.height;
          }
          
          if (x + frame.width > maxdim) {
            x = 0;
            y += lineheight;
            lineheight = 0;
          }
          framemap[frameid][angle] = [x, y];
          x += frame.width;
          if (x > maxwidth) {
            maxwidth = x;
          }
        }
      }

      this.canvas = document.createElement('canvas');
      this.canvas.width = maxwidth;
      this.canvas.height = y + lineheight;
      let ctx = this.canvas.getContext('2d');

      for (let frameid in framemap) {
        let angles = framemap[frameid];
        for (let angle in angles) {
          let framepos = angles[angle],
              frame = this.frames[frameid][angle];
          ctx.drawImage(frame.canvas, framepos[0], framepos[1]);
        }
      }

      this.framemap = framemap;
    } 
    return this.canvas;
  }
  getSpriteSheetFrame(frameid, angle) {
    let offset = this.framemap[frameid][angle],
        frame = this.frames[frameid][angle];
  
    return [offset[0] / this.canvas.width, (this.canvas.height - offset[1] - frame.height) / this.canvas.height, frame.width / this.canvas.width, frame.height / this.canvas.height];
  }
}

