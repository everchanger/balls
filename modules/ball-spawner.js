import { Vec2 } from "./index.js"

export class BallSpawner {
  constructor(position, rate) {
    this.canvas = document.getElementById('canvas');
    this.rate = rate
    this.position = new Vec2(position)
    this.color = 'green'
    this.timer = 0
  }

  update(deltaTime) {
    this.timer += deltaTime
    if (this.timer > this.rate) {
      this.timer = 0

      const event = new CustomEvent('spawn-ball', { detail: new Vec2(this.position) });
      this.canvas.dispatchEvent(event)
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, 10, 0, Math.PI * 2, true);
    context.closePath();
    context.strokeStyle = this.color;
    context.stroke();
  }
}