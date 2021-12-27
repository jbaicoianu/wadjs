/**
 * Utility functions for working with binary data
 * @module binaryutils
 */

/**
 * Read a signed 8-bit integer (char)
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @returns {integer} Int8
 */
export function readInt8(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let view = new DataView(data);
  return view.getInt8(offset);
}
/**
 * Read an unsigned 8-bit integer (unsigned char)
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @returns {integer} Uint8
 */
export function readUint8(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let view = new DataView(data);
  return view.getUint8(offset);
}
/**
 * Read an array of unsigned 8-bit integers (unsigned char[])
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @param {integer} count - number of elements in array
 * @returns {array} Array of Uint8 values
 */
export function readUint8Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint8Array(data, offset, count);
  return arr;
}
/**
 * Read a signed 16-bit integer (short)
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @returns {integer} Int16
 */
export function readInt16(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let view = new DataView(data);
  return view.getInt16(offset, true);
}
/**
 * Read a unsigned 16-bit integer (unsigned short)
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @returns {integer} Uint16
 */
export function readUint16(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let view = new DataView(data);
  return view.getUint16(offset, true);
}
/**
 * Read an array of unsigned 16-bit integers (unsigned short[])
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @param {integer} count - number of elements in array
 * @returns {array} Array of Uint16 values
 */
export function readUint16Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint16Array(data, offset, count);
  return arr;
}
/**
 * Read a signed 32-bit integer (int)
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @returns {integer} Int32
 */
export function readInt32(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let view = new DataView(data);
  return view.getInt32(offset, true);
}
/**
 * Read an unsigned 32-bit integer (unsigned int)
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @returns {integer} Uint32
 */
export function readUint32(data, offset, endian=true) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let view = new DataView(data);
  return view.getUint32(offset, endian);
}
/**
 * Read an array of signed 32-bit integer (int[])
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @param {integer} count - number of elements in array
 * @returns {array} Array of Int32 values
 */
export function readInt32Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let dv = new DataView(data);
  var arr = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    arr[i] = dv.getInt32(offset + i * 4, true);
  }
  return arr;
}
/**
 * Read an array of unsigned 32-bit integers (unsigned int[])
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @param {integer} count - number of elements in array
 * @returns {array} Array of Uint32 values
 */
export function readUint32Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  let dv = new DataView(data);
  var arr = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    arr[i] = dv.getUint32(offset + i * 4, true);
  }
  return arr;
}
/**
 * Read a string (char*)
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @param {integer} length - max string length
 * @returns {string} String
 */
export function readString(data, offset, length) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  if (!length) length = data.byteSize;
  var arr = new Uint8Array(data, offset),
      str = '';
  for (var i = 0; i < length; i++) {
    var chr = arr[i];
    if (chr === 0) break;
    str += String.fromCharCode(chr);
  }
  return str;
}
/**
 * Read an array of strings (char*[])
 * @param {ArrayBuffer} data - binary data
 * @param {integer} offset - read offset
 * @param {integer} length - max string length
 * @param {integer} count - number of strings
 * @returns {array} Array of strings
 */
export function readStringArray(data, offset, length, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  if (!count) return [];

  if (!length) length = data.byteSize / count;
  var arr = new Uint8Array(data, offset),
      strs = [];
  for (var i = 0; i < count; i++) {
    var str = '';
    var offset = i * length;
    for (var j = 0; j < length && offset + j < arr.length; j++) {
      var chr = arr[offset + j];
      if (chr === 0) break;
      str += String.fromCharCode(chr);
    }
    strs.push(str);
  }
  return strs;
}

