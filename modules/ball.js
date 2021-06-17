import { Vec2 } from './index.js'

export class Ball {
  constructor(x, y) {
    this.postion = new Vec2({ x, y })
    this.direction = new Vec2({ x: 0, y: 0})
    this.speed = new Vec2({ x: 0, y: 0})
    this.radius = 5
    this.terminalSpeed = 100
    this.color = 'black'
  }

  intersect(line) {
    const lineVec = new Vec2(line.end)
    lineVec.sub(line.start)
    const lineLength = lineVec.length()
    const lineNorm = new Vec2(lineVec)
    lineNorm.scale(1/lineLength)
    const segmentToCircle = new Vec2(this.postion)
    segmentToCircle.sub(line.start)
    const closestPointOnSegment = segmentToCircle.dot(lineVec) / lineLength

    let closest = new Vec2()
    if (closestPointOnSegment < 0) {
      closest = line.start
    } else if (closestPointOnSegment > lineLength) {
      closest = line.end
    } else {
      closest = new Vec2(line.start)
      const temp = new Vec2(closestPointOnSegment)
      temp.scaleWithVector(lineNorm)
      closest.add(temp)
    }

    const distanceFromClosest = new Vec2(this.postion)
    distanceFromClosest.sub(closest)
    const distanceFromClosestLength = distanceFromClosest.length()
    if (distanceFromClosestLength > this.radius) {
      return false
    }

    return true
  }

  update(deltaTime, lines) {
    // Check for collisions
    for (const line of lines) {
      if (this.intersect(line)) {
        this.color = 'red'
      }
    }

    // Add "gravity"
    this.speed.add({ x: 0, y: 9.82 * deltaTime })
    this.speed.min(this.terminalSpeed)
    
    if (this.direction.x === 0 && this.direction.y === 0) {
      this.direction = new Vec2(this.speed)
    }
    this.direction.normalize()

    const velocity = new Vec2(this.speed)
    velocity.scale(deltaTime)

    this.direction = new Vec2(this.postion)
    this.postion.add(velocity)
    this.direction.sub(this.postion)
  }

  draw(context) {
    context.beginPath();
    context.arc(this.postion.x, this.postion.y, this.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
  }
}