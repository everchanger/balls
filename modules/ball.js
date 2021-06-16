export class Ball {
  constructor(orginX, orginY) {
    this.x = orginX
    this.y = orginY
    this.vX = 0
    this.vY = 0
  }

  update() {
    console.log('ball updating!')
  }

  draw() {
    console.log('ball drawing!')
  }
}