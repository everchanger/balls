import { Vec2 } from "./vec2.js";

export class Line {
  constructor(start, end) {
    this.start = new Vec2(start)
    this.end = new Vec2(end)
    this.color = 'black'
  }

  update(deltaTime) {

  }

  draw(context) {
    if (!(this.start.x && this.start.y && this.end.x && this.end.y)) {
      return
    }

    context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
    context.fillStyle = this.color;
    context.stroke();
  }
}