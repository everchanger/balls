import { Ball, Line, Vec2, BallSpawner } from './modules/index.js'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.balls = []
    this.lines = []
    this.lineStart = undefined
    this.deltaTime = 0
    this.lastDraw = 0

    this.spawner = new BallSpawner( new Vec2({x: this.canvas.width / 2, y: 10 }), 2)
  }
 
  update() {
    this.spawner.update(this.deltaTime)
    for (const ball of this.balls) {
      ball.update(this.deltaTime, this.lines)
    }
    this.balls = this.balls.filter(ball => !ball.deleteMe)
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

    this.spawner.draw(context)

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
      if (this.lineStart === undefined && this.lines.length === 0) {
        this.audioContext.resume()
      }

      const position = new Vec2({ x: e.pageX - this.canvas.offsetLeft, y: e.pageY - this.canvas.offsetTop })

      if (this.lineStart) {
        const line = new Line(this.lineStart, position)
        this.lines.push(line)
        this.lineStart = undefined
      } else {
        this.lineStart = position
      }
      // this.balls.push(new Ball(e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetTop))
    });

    this.canvas.addEventListener('spawn-ball', (e) => {
      const ball = new Ball(e.detail.x, e.detail.y)
      console.log('got event!', e)
      this.balls.push(ball)
    })

    this.canvas.addEventListener('play-tone', (e) => {
      const scale = e.detail.y / this.canvas.height
      const oscillator = this.audioContext.createOscillator();

      oscillator.type = 'sine';
      const hz = 50 * scale
      console.log(hz)
      oscillator.frequency.setValueAtTime(hz, this.audioContext.currentTime); // value in hertz
      oscillator.connect(this.audioContext.destination);
      oscillator.start();
      setTimeout(() => oscillator.stop(), 100)
    })
  }

  
}

window.init = function init() {
  console.log('global init')
  const game = new Game()
  game.init()
}