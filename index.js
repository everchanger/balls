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
    this.maxBalls = 10
    this.hz = 500
    this.gravityMultiplier = 10
    this.terminalSpeed = 100
    this.friction = 1
    this.showControls = false

    this.controls = [
      {
        attributes: {
          type: 'range',
          min: '0',
          max: '20',
        },
        label: 'Max # of balls',
        variable: 'maxBalls'
      },
      {
        attributes: {
          type: 'range',
          min: '100',
          max: '2000',
        },
        label: 'Hz',
        variable: 'hz'
      },
      {
        attributes: {
          type: 'range',
          min: '1',
          max: '100',
        },
        label: 'Gravity',
        variable: 'gravityMultiplier'
      },
      {
        attributes: {
          type: 'range',
          min: '-10',
          max: '50',
        },
        label: 'Friction',
        variable: 'friction'
      },
      {
        attributes: {
          type: 'range',
          min: '50',
          max: '200',
        },
        label: 'Terminal speed',
        variable: 'terminalSpeed'
      },
    ]
  }
 
  update() {
    this.spawner.update(this.deltaTime)
    for (const ball of this.balls) {
      ball.update(this.deltaTime, this.lines, this.gravityMultiplier, this.terminalSpeed, this.friction)
    }
    this.balls = this.balls.filter(ball => !ball.deleteMe)
  }

  draw() {
    const context = this.canvas.getContext('2d')

    if (!context) {
      console.error('No canvas context')
      return;
    }

    // context.clearRect(0,0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 255)';
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
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.setupUIInputs()
    this.setupEventListeners();

    this.spawner = new BallSpawner( new Vec2({x: this.canvas.width / 2, y: 10 }), 2)
    this.lastDraw = performance.now()
    window.requestAnimationFrame((hrt) => this.mainLoop(hrt))
  }

  setupUIInputs() {
    const controlSection = document.getElementById('control-section')
    for (const control of this.controls) {
      const wrapper = document.createElement('div')
      const inputOutputWrapper = document.createElement('div')
      const labelElement = document.createElement('label')
      const element = document.createElement('input')
      const outputElement = document.createElement('span')

      labelElement.innerHTML = control.label
      outputElement.innerHTML = this[control.variable]

      for (const attribute in control.attributes) {
        element.setAttribute(attribute, control.attributes[attribute])
      }

      element.setAttribute('value', this[control.variable])
      element.addEventListener('input', (e) => {
        this[control.variable] = e.target.value
        outputElement.innerHTML = this[control.variable]
      })

      inputOutputWrapper.appendChild(element)
      inputOutputWrapper.appendChild(outputElement)
      wrapper.appendChild(labelElement)
      wrapper.appendChild(inputOutputWrapper)
      controlSection.appendChild(wrapper)
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    });

    const controlButton = document.getElementById('control-toggle')
    const controlSection = document.getElementById('control-section')

    document.getElementById('control-toggle').addEventListener('click', (e) => {
      this.showControls = !this.showControls
      console.log('clicked', this.showControls)
      if (this.showControls) {
        controlSection.style.display = 'block'
        // controlButton.style.display = 'none'
      } else {
        controlSection.style.display = 'none'
        // controlButton.style.display = 'block'
      }
    })

    this.canvas.addEventListener('click', (e) => {
      if (this.lineStart === undefined && this.lines.length === 0) {
        this.audioContext.resume()
      }

      const parent = this.canvas.offsetParent
      const position = new Vec2({ x: e.pageX - (this.canvas.offsetLeft + parent.offsetLeft), y: e.pageY - (this.canvas.offsetTop + parent.offsetTop) })

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
      if (this.balls.length < this.maxBalls) {
        const ball = new Ball(e.detail.x, e.detail.y)
        this.balls.push(ball)
      }
    })

    this.canvas.addEventListener('play-tone', (e) => {
      const scale = e.detail.y / this.canvas.height
      const oscillator = this.audioContext.createOscillator()

      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = 0.5

      oscillator.type = 'sine'
      const hz = this.hz * scale
      oscillator.connect(gainNode)
      oscillator.frequency.setValueAtTime(hz, this.audioContext.currentTime) // value in hertz
      gainNode.connect(this.audioContext.destination)
      oscillator.start()
      // oscillator.stop()
      // gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
      setTimeout(() => {
        gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.015);
      }, 100)
    })
  }

  
}

window.init = function init() {
  console.log('global init')
  const game = new Game()
  game.init()
}