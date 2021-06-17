import { Ball, Line, Vec2 } from './modules/index.js'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.balls = []
    this.lines = []
    this.lineStart = new Vec2()
    this.deltaTime = 0
    this.lastDraw = 0
    
    const ballCount = 3
    for (let i = 0; i < ballCount; ++i) {
      this.balls.push(new Ball(i * 50, 0))
    }
  }
 
  update() {
    for (const ball of this.balls) {
      ball.update(this.deltaTime, this.lines)
    }
  }

  draw() {
    const context = this.canvas.getContext('2d')

    if (!context) {
      console.error('No canvas context')
      return;
    }

    //context.clearRect(0,0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const ball of this.balls) {
      ball.draw(context)
    }

    for (const line of this.lines) {
      line.draw(context)
    }
  }

  mainLoop(hightResolutionTimer) {
    this.deltaTime = (hightResolutionTimer - this.lastDraw) / 1000;

    this.update();
    this.draw()
    
    this.lastDraw = hightResolutionTimer
    window.requestAnimationFrame((hrt) => this.mainLoop(hrt))
  }
  
  init() {
    console.log('init')
    this.setupEventListeners();
    
    this.lastDraw = performance.now()
    window.requestAnimationFrame((hrt) => this.mainLoop(hrt))
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => {
      const position = new Vec2({ x: e.pageX - this.canvas.offsetLeft, y: e.pageY - this.canvas.offsetTop })

      if (this.lineStart.x && this.lineStart.y) {
        const line = new Line(this.lineStart, position)
        this.lines.push(line)
        this.lineStart = new Vec2()
      } else {
        this.lineStart = position
      }
      // this.balls.push(new Ball(e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetTop))
    });
  }
}

window.init = function init() {
  console.log('global init')
  const game = new Game()
  game.init()
}