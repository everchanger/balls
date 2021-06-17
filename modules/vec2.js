export class Vec2 {
  constructor(vector) {
    if (!vector) {
      vector = { x: 0, y: 0 }
    }
    this.x = vector.x
    this.y = vector.y
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
    return Math.sqrt(this.dot(this));
  }

  min(max) {
    this.x = Math.min(this.x, max)
    this.y = Math.min(this.y, max)
  }

  scaleWithVector(vector) {
    this.x *= vector.x
    this.y *= vector.y
  }

  scale(scale) {
    this.x *= scale
    this.y *= scale
  }
}