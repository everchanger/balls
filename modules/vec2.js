export class Vec2 {
  constructor(vector) {
    if (!vector) {
      vector = { x: 0, y: 0 }
    }
    this.x = vector.x
    this.y = vector.y
  }

  negate() {
    this.x = -this.x
    this.y = -this.y
  }

  normalize() {
    if (this.x === 0 && this.y === 0) {
      return
    }
    length = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= length
    this.y /= length
  }

  add(vector) {
    this.x += vector.x
    this.y += vector.y
  }

  sub(vector) {
    this.x -= vector.x
    this.y -= vector.y
  }

  dot(vector) {
    return this.x*vector.x + this.y*vector.y;
  }

  length() {
    // return Math.sqrt(this.dot(this));
    return Math.hypot(this.x, this.y)
  }

  min(max) {
    this.x = Math.min(this.x, max)
    this.y = Math.min(this.y, max)
  }

  scaleWithVector(vector) {
    this.x *= vector.x
    this.y *= vector.y
  }

  normalCW() {
    return new Vec2({x: this.y, y: -this.x})
  }

  normalCCW() {
    return new Vec2({x: -this.y, y: this.x})
  }

  addScale(scale, vector) {
    const scaleVec = new Vec2(vector)
    scaleVec.scale(scale)
    this.add(scaleVec)
  }

  scale(scale) {
    this.x *= scale
    this.y *= scale
  }

  projectOn(vector) {
    const normalized = new Vec2(vector)
    normalized.normalize()
    normalized.scale(this.dot(normalized))
    return normalized
  }
}