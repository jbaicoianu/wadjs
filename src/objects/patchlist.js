import * as WadJS from '../wad.js';

export class PatchList {
  constructor() {
    this.numpatches = 0;
    this.patchnames = null;
  }
  read(data, pos) {
    if (!pos) pos = 0;
    this.numpatches = WadJS.readUint32(data, pos);
    this.patchnames = WadJS.readStringArray(data, pos + 4, 8, this.numpatches);
  }
}

