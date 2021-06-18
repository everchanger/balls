import { Vec2 } from './index.js'

export class Ball {
  constructor(x, y) {
    this.position = new Vec2({ x, y })
    this.direction = new Vec2({ x: 0, y: 0})
    this.speed = new Vec2({ x: 0, y: 0})
    this.radius = 5
    this.terminalSpeed = 100
    this.color = 'black'
  }

  intersect(line) {
    // const radius = this.radius / 2
    // const LocalP1 = new Vec2(line.start)
    // LocalP1.sub(this.position)
    // const LocalP2 = new Vec2(line.end)
    // LocalP2.sub(this.position)

    // const P2MinusP1 = new Vec2(LocalP2)
    // P2MinusP1.sub(LocalP1)

    // const a = P2MinusP1.dot(P2MinusP1)
    // const b = 2 * ((P2MinusP1.x * LocalP1.x) + (P2MinusP1.y * LocalP1.y))
    // const c = LocalP1.dot(LocalP1) - radius * radius
    // const delta = b * b - (4 * a * c)

    // if (delta < 0) {
    //   return null
    // } else if (delta === 0) {
    //   const u = -b / (2 * a)
    //   const intersection = new Vec2(line.start)
  
    //   intersection.addScale(u, P2MinusP1)
    //   return intersection
    // } else if (delta > 0) {
    //   const squareRootDelta = Math.sqrt(delta)
    //   const u1 = (-b + squareRootDelta) / (2 * a)
    //   const u2 = (-b - squareRootDelta) / (2 * a)

    //   const intersection1 = new Vec2(line.start)
    //   const intersection2 = new Vec2(line.start)

    //   intersection1.addScale(u1, P2MinusP1)
    //   intersection2.addScale(u2, P2MinusP1)

    //   return [intersection1, intersection2]
    // }

    // console.error('this is not supposed to happen')
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
    return true
  }

  update(deltaTime, lines) {
    // Check for collisions
    for (const line of lines) {
      const res = this.intersect(line)
      // console.log(res, this.position)
      if (res) {
        this.color = 'red'
        const force = new Vec2(line.vector)
        const normal = force.normalCW()
        // normal.scaleWithVector(this.speed)
        normal.normalize()
        this.speed = new Vec2({ x: 0, y: 0 })
        this.speed.addScale(100, normal)
        setTimeout(() => this.color = 'black', 2000)
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

    this.direction = new Vec2(this.position)
    this.position.add(velocity)
    this.direction.sub(this.position)
  }

  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
  }
}