import { Vec2 } from "./index.js"

export class BallSpawner {
  constructor(position, rate, synthType, timer = 0) {
    this.canvas = document.getElementById('canvas');
    this.rate = rate
    this.position = new Vec2(position)
    this.color = 'green'
    this.timer = timer
    this.synth = new Tone.PolySynth(Tone[synthType]).toDestination()

    if (synthType === 'FMSynth') {
      this.color = 'red'
    } else if (synthType === 'Synth') {
      this.color = 'blue'
    }
  }

  update(deltaTime) {
    this.timer += deltaTime
    if (this.timer > this.rate) {
      this.timer = 0

      const event = new CustomEvent('spawn-ball', { detail: { position: new Vec2(this.position), spawner: this }});
      this.canvas.dispatchEvent(event)
    }
  }

  draw(context) {
    const radius = 10
    const gradiant = context.createRadialGradient(this.position.x, this.position.y, radius*0.5, this.position.x, this.position.y, radius * 1);
    gradiant.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradiant.addColorStop(1, this.color);

    context.beginPath();
    context.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2, true);
    context.closePath();
    context.fillStyle = gradiant
    context.fill();
  }
}