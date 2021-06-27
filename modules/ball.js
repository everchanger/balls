import { Vec2 } from './index.js'

export class Ball {
  constructor(x, y) {
    this.pallete = ['#FA448C', '#FEC859', '#43B5A0', '#1B96F4']
    this.canvas = document.getElementById('canvas');
    this.position = new Vec2({ x, y })
    this.direction = new Vec2({ x: 0, y: 0})
    this.speed = new Vec2({ x: 0, y: 0})
    this.radius = 5
    this.renderRadius = this.radius
    this.color = 'white'
    this.currentColor = 'white'
    this.collisionColor = this.pallete[Math.round(Math.random() * (this.pallete.length - 1))]
    this.deleteMe = false
    this.shrinkFactor = 10
    this.shrinkInterval = undefined
    this.debugPoints = []

  }

  intersect(line) {
    const startToBall = new Vec2(this.position)
    startToBall.sub(line.start)
    const startToEnd = new Vec2(line.end)
    startToEnd.sub(line.start)

    const projectedDirection = startToBall.projectOn(startToEnd)

    const closestPoint = new Vec2(line.start)
    closestPoint.add(projectedDirection)

    const ballToLine = new Vec2(this.position)
    ballToLine.sub(closestPoint)
    const length = ballToLine.length()
    
    if (length > this.radius) {
      return false
    }

    // Check if ball is between start and end of line
    const dxl = line.end.x - line.start.x
    const dyl = line.end.y - line.start.y

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

  update(deltaTime, lines, gravityMultiplier, terminalSpeed, friction, drag) {
    // Check for collisions
    this.debugPoints = []
    for (const line of lines) {
      if (!line.isPointInBoundingBox(this.position)) {
        continue
      }

      const speedLength = this.speed.length()
      const res = this.intersect(line)
      if (res) {
        const event = new CustomEvent('play-tone', { detail: { position: new Vec2(this.position), speed: new Vec2(this.speed) } });
        this.canvas.dispatchEvent(event)
        line.hasBeenHit(deltaTime)

        
        const scale = this.position.y / this.canvas.height
        const color = this.pallete[Math.round(scale * (this.pallete.length - 1))]

        this.currentColor = color
        this.renderRadius = 2 * this.radius * (speedLength * 0.005)

        const isLeft = line.isLeft(this.position)
        
        const force = new Vec2(line.vector)
        const normal = !isLeft ? force.normalCW() : force.normalCCW()
        normal.normalize()

        const collisionBoost = 1.1
        const speed = Math.max(0, (speedLength * collisionBoost) - friction)

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
    
    // Add "drag"
    if (this.speed.length()) {
      const dragVector = new Vec2(this.speed)
      dragVector.negate()
      dragVector.scale(drag * deltaTime)
      this.speed.add(dragVector)
    }

    // this.speed.min(terminalSpeed)

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
    const gradiant = context.createRadialGradient(this.position.x, this.position.y, this.renderRadius*0.6, this.position.x, this.position.y, this.renderRadius * 1);
    gradiant.addColorStop(0, this.currentColor);
    gradiant.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.beginPath();
    context.arc(this.position.x, this.position.y, this.renderRadius, 255, Math.PI * 2, true);
    context.closePath();
    context.fillStyle = gradiant;
    context.fill();

    for (const point of this.debugPoints) {
      context.beginPath();
      context.moveTo(point.start.x, point.start.y);
      context.lineTo(point.end.x, point.end.y);
      context.strokeStyle = point.color;
      context.stroke();
    } 
  }
}