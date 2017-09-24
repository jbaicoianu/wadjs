import * as WadJS from '../wad.js';

/**
 * Class representing a list of Patches
 * https://zdoom.org/wiki/Patch
 */
export class PatchList {
  constructor() {
    this.numpatches = 0;
    this.patchnames = null;
  }
  /**
   * Read binary data from the given position
   * @param {ArrayBuffer} data - binary data
   * @param {integer} pos - position to read from
   */
  read(data, pos) {
    if (!pos) pos = 0;
    this.numpatches = WadJS.readUint32(data, pos);
    this.patchnames = WadJS.readStringArray(data, pos + 4, 8, this.numpatches);
  }
}

