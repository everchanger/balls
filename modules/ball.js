import { Vec2 } from './index.js'

export class Ball {
  constructor(x, y) {
    this.canvas = document.getElementById('canvas');
    this.position = new Vec2({ x, y })
    this.direction = new Vec2({ x: 0, y: 0})
    this.speed = new Vec2({ x: 0, y: 0})
    this.radius = 5
    this.renderRadius = this.radius
    this.color = 'white'
    this.currentColor = 'white'
    this.collisionColor = 'red'
    this.deleteMe = false
    this.shrinkFactor = 10
    this.shrinkInterval = undefined
  }

  intersect(line) {
    const dxc = this.position.x - line.start.x
    const dyc = this.position.y - line.start.y

    const dxl = line.end.x - line.start.x
    const dyl = line.end.y - line.start.y

    const cross = dxc * dyl - dyc * dxl
    const threshold = this.radius**3
    if (Math.abs(cross) > threshold) {
      return false
    }
    if (Math.abs(dxl) >= Math.abs(dyl)) {
      return dxl > 0 ? 
        line.start.x <= this.position.x && this.position.x <= line.end.x :
        line.end.x <= this.position.x && this.position.x <= line.start.x
    } else {
      return dyl > 0 ? 
        line.start.y <= this.position.y && this.position.y <= line.end.y :
        line.end.y <= this.position.y && this.position.y <= line.start.y
    }
  }

  shrinkRenderRadius(deltaTime) {
    if (this.renderRadius <= this.radius) {
      this.currentColor = this.color
      clearInterval(this.shrinkInterval)
      return
    }
    this.renderRadius -= deltaTime * this.shrinkFactor
  }

  update(deltaTime, lines, gravityMultiplier, terminalSpeed) {
    // Check for collisions
    for (const line of lines) {
      const res = this.intersect(line)
      if (res) {
        const event = new CustomEvent('play-tone', { detail: new Vec2(this.position) });
        this.canvas.dispatchEvent(event)

        this.currentColor = this.collisionColor
        this.renderRadius = 2 * this.radius

        const isLeft = line.isLeft(this.position)
        
        const force = new Vec2(line.vector)
        const normal = !isLeft ? force.normalCW() : force.normalCCW()
        normal.normalize()

        const friction = 0
        const speed = Math.max(0, this.speed.length() - friction)

        normal.scale(speed)
        this.speed = new Vec2(normal)
        if (this.shrinkInterval) {
          clearInterval(this.shrinkInterval)
        }
        this.shrinkInterval = setInterval(() => {
          this.shrinkRenderRadius(deltaTime)
        }, 10);
      }
    }

    // Add "gravity"
    this.speed.add({ x: 0, y: 9.82 * deltaTime * gravityMultiplier })
    this.speed.min(terminalSpeed)
    
    if (this.direction.x === 0 && this.direction.y === 0) {
      this.direction = new Vec2(this.speed)
    }
    this.direction.normalize()

    const velocity = new Vec2(this.speed)
    velocity.scale(deltaTime)

    this.direction = new Vec2(this.position)
    this.position.add(velocity)
    this.direction.sub(this.position)
    // this.canvas.height
    if (this.position.y > this.canvas.height) {
      this.deleteMe = true
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.renderRadius, 0, Math.PI * 2, true);
    context.closePath();
    context.fillStyle = this.currentColor;
    context.fill();
  }
}