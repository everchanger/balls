import { Vec2 } from "./vec2.js";

export class Line {
  constructor(start, end) {
    this.start = new Vec2(start)
    this.end = new Vec2(end)

    this.vector = new Vec2(this.end)
    this.vector.sub(this.start)

    this.color = 'rgba(255, 255, 255, 0.5)'
    this.currentColor = this.color
    this.collisionColor = 'white'
    this.shrinkInterval = undefined
    this.width = 1.5
    this.collisionWidth = 5
    this.currentWidth = this.width
    this.shrinkFactor = 10
  }

  isLeft(vector) {
    return ((this.end.x - this.start.x)*(vector.y - this.start.y) - (this.end.y - this.start.y)*(vector.x - this.start.x)) > 0;
  }

  isPointInBoundingBox(point) {
    const dxl = this.end.x - this.start.x
    const dyl = this.end.y - this.start.y

    if (Math.abs(dxl) >= Math.abs(dyl)) {
      return dxl > 0 ? 
        this.start.x <= point.x && point.x <= this.end.x :
        this.end.x <= point.x && point.x <= this.start.x
    } else {
      return dyl > 0 ? 
        this.start.y <= point.y && point.y <= this.end.y :
        this.end.y <= point.y && point.y <= this.start.y
    }
  }

  shrinkRenderRadius(deltaTime) {
    if (this.currentWidth <= this.width) {
      this.currentColor = this.color
      clearInterval(this.shrinkInterval)
      return
    }
    this.currentWidth -= deltaTime * this.shrinkFactor
  }

  hasBeenHit(deltaTime) {
    if (this.shrinkInterval) {
      clearInterval(this.shrinkInterval)
    }
    this.currentColor = this.collisionColor
    this.currentWidth = this.collisionWidth
    this.shrinkInterval = setInterval(() => {
      this.shrinkRenderRadius(deltaTime)
    }, 10);
  }

  update(deltaTime) {

  }

  draw(context) {
    if (!(this.start.x && this.start.y && this.end.x && this.end.y)) {
      return
    }

    const currentWidth = context.lineWidth

    context.lineWidth = this.currentWidth
    context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
    context.strokeStyle = this.currentColor;
    context.stroke();

    context.lineWidth = currentWidth
  }
}