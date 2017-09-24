/**
 * Class representing the geometry associated with a given texture
 */
export class MapTextureGroup {
  constructor(texture) {
    this.vertices = [];
    this.faces = [];
    this.uvs = [];
    this.colors = [];
    this.texture = texture;
  }
  /**
   * Generate a textured quad to add to this group
   * @param {WadJS.Vector} v1 - 
   * @param {WadJS.Vector} v2 - 
   * @param {integer} floorheight - 
   * @param {integer} ceilingheight - 
   * @param {WadJS.Linedef} linedef - 
   * @param {WadJS.Sidedef} side - 
   * @param {WadJS.Sector} sector1 - 
   * @param {WadJS.Sector} sector2 - 
   * @param {boolean} isLower - 
   * @param {boolean} isUpper - 
   */
  addQuad(v1, v2, floorheight, ceilingheight, linedef, side, sector1, sector2, isLower, isUpper) {
    var vertexOffset = this.vertices.length / 3;

    this.vertices.push(v1.x, v1.y, floorheight);   // bottom left
    this.vertices.push(v1.x, v1.y, ceilingheight); // top left
    this.vertices.push(v2.x, v2.y, ceilingheight); // top right
    this.vertices.push(v2.x, v2.y, floorheight);   // bottom right

    var quadtype = (isUpper ? 'top' : (isLower ? 'bottom' : 'middle')) 
    var uvs = side.getUVs(quadtype, floorheight, ceilingheight, this.texture);
    this.uvs.push.apply(this.uvs, uvs);

    this.faces.push(vertexOffset, vertexOffset + 2, vertexOffset + 1);
    this.faces.push(vertexOffset, vertexOffset + 3, vertexOffset + 2);

    side.addQuad(quadtype, [vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset + 3]);

    // Use vertex colors to simulate sector lighting

    for (var i = 0; i < 4; i++) {
      this.colors.push(sector1.lightlevel / 255, sector1.lightlevel / 255, sector1.lightlevel / 255);
    }
  }
  /**
   * Add an arbitrarily-sized polygon to this group
   * @param {array} vertices - 
   * @param {array} faces - 
   * @param {WadJS.Sector} sector - 
   */
  add(vertices, faces, sector) {
    var lightlevel = sector.lightlevel / 255;
    var vertexoffset = this.vertices.length / 3;
    for (var i = 0; i < vertices.length; i++) {
      this.vertices.push(vertices[i]);
      this.colors.push(lightlevel);
    }
    for (var i = 0; i < vertices.length / 3; i++) {
      var x = vertices[i * 3] / 64,
          y = vertices[i * 3 + 1] / 64;
      this.uvs.push(x, y);
    }
    var newfaces = [];
    for (var i = 0; i < faces.length; i++) {
      this.faces.push(faces[i][0] + vertexoffset, faces[i][1] + vertexoffset, faces[i][2] + vertexoffset);
      newfaces.push(faces[i][0] + vertexoffset, faces[i][1] + vertexoffset, faces[i][2] + vertexoffset);
    }
    return newfaces;
  }
  /**
   * Get the buffer data needed to render this group
   * @returns {object}
   */
  getBuffers() {
    return {
      index: new Int32Array(this.faces),
      position: new Float32Array(this.vertices),
      uv: new Float32Array(this.uvs),
      color: new Float32Array(this.colors),
    }
  }
}

