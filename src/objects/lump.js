export class Lump {
  constructor() {
    this.name = '';
    this.pos = 0;
    this.len = 0;
    this.bytes = false;
  }
  read(data, pos, len, name, offset) {
    if (!offset) offset = 0;

    this.name = name;
    this.pos = pos;
    this.len = len;
    this.bytes = new Uint8Array(data, offset + pos, len);
  }
}

