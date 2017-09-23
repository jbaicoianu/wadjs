export function readInt8(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Int8Array(data, offset, 1);
  return arr[0];
}
export function readUint8(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint8Array(data, offset, 1);
  return arr[0];
}
export function readUint8Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint8Array(data, offset, count);
  return arr;
}
export function readInt16(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Int16Array(data, offset, 1);
  return arr[0];
}
export function readUint16(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint16Array(data, offset, 1);
  return arr[0];
}
export function readUint16Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint16Array(data, offset, count);
  return arr;
}
export function readInt32(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Int32Array(data, offset, 1);
  return arr[0];
}
export function readUint32(data, offset) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint32Array(data, offset, 1);
  return arr[0];
}
export function readInt32Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Int32Array(data, offset, count);
  return arr;
}
export function readUint32Array(data, offset, count) {
  if (!(data instanceof ArrayBuffer)) {
    offset += data.byteOffset;
    data = data.buffer;
  }

  var arr = new Uint32Array(data, offset, count);
  return arr;
}
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

