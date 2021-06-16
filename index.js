import { Ball } from './modules/ball.js'

class Game {
  constructor() {
    this.balls = []
    const ballCount = 10
    for (let i = 0; i < ballCount; ++i) {
      this.balls.push(new Ball(i * 10, 0))
    }
  }

  draw() {
    for (const ball of this.balls) {
      ball.draw()
    }
    console.log('draw')
  }
  
  update() {
    for (const ball of this.balls) {
      ball.update()
    }
    console.log('update')
  }
  
  mainLoop() {
    this.update()
    this.draw()
  }
  
  init() {
    console.log('init')
    setInterval(() => this.mainLoop(), 1000)
  }
}

window.init = function init() {
  console.log('global init')
  const game = new Game()
  game.init()
}