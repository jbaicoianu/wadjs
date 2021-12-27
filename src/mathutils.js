/**
 * Utility function to determine how far a point is from a line
 * @todo Move this into a separate module
 */
export function pointDistanceFromLine(px, py, lx, ly, dx, dy) {
  var d = (px - lx) * dy - (py - ly) * dx;
  return d;
}
/**
 * Utility function to determine if a point is on a line
 * @todo Move this into a separate module, and fill in the logic
 */
export function pointIsOnLine(px, py, lx, ly, dx, dy) {
  return false;
}


