import { Ball, Line, Vec2, BallSpawner, ControlManager, UIManager, ObjectManager } from './modules/index.js'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.isSoundInitiated = false
    this.synth = new Tone.PolySynth(this.currentSynth).toDestination()
    this.objectManager = new ObjectManager(this.canvas)
    this.controlManager = new ControlManager(this.canvas)
    this.balls = []
    this.lineStart = undefined
    this.deltaTime = 0
    this.lastDraw = 0
    this.maxBalls = 10
    this.gravityMultiplier = 27
    this.friction = 1
    this.drag = 0.5
    
    const toneScale = ['C', 'D', 'E', 'F']
    const numericalScale = [1, 2, 3, 4]
    this.fullScale = numericalScale.flatMap(num => toneScale.map(note => `${note}${num}`)).reverse()
    this.UIManager = new UIManager(this, this.canvas, [
      {
        type: 'button',
        label: 'Undo',
        callback: () => this.objectManager.undoLastObject()
      },
      {
        type: 'input',
        attributes: {
          type: 'range',
          min: '0',
          max: '20',
        },
        label: 'Max # of balls',
        variable: 'maxBalls'
      },
      {
        type: 'input',
        attributes: {
          type: 'range',
          min: '1',
          max: '100',
        },
        label: 'Gravity',
        variable: 'gravityMultiplier'
      },
      {
        type: 'input',
        attributes: {
          type: 'range',
          min: '-10',
          max: '50',
        },
        label: 'Friction',
        variable: 'friction'
      },
      {
        type: 'select',
        options: [
          {
            value: 'AMSynth',
            name: 'AM Synth'
          },
          {
            value: 'FMSynth',
            name: 'FM Synth'
          },
          {
            value: 'Synth',
            name: 'Synth'
          },
          {
            value: 'MembraneSynth',
            name: 'Membrane Synth'
          },
          {
            value: 'MetalSynth',
            name: 'Metal Synth'
          },
        ],
        label: 'Synth',
        variable: 'currentSynth',
        callback: () => { 
          this.synth = new Tone.PolySynth(Tone[this.currentSynth]).toDestination()
        }
      },
    ])
  }
 
  update() {
    this.objectManager.update(this.deltaTime)
    for (const ball of this.balls) {
      const lines = this.objectManager.getObjectsOfClass(Line)
      ball.update(this.deltaTime, lines, this.gravityMultiplier, this.friction, this.drag)
    }
    this.balls = this.balls.filter(ball => !ball.deleteMe)
    
    this.controlManager.update(this.deltaTime)
    
    if (this.lineStart && this.controlManager.isHolding) {
      this.lineStart = undefined
    }
  }

  draw() {
    const context = this.canvas.getContext('2d')

    if (!context) {
      console.error('No canvas context')
      return;
    }

    const gradiant = context.createLinearGradient(0, 0, 0, canvas.height)
    gradiant.addColorStop(0, '#331A38')
    gradiant.addColorStop(1, '#111')

    context.fillStyle = gradiant
    context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.objectManager.draw(context)

    for (const ball of this.balls) {
      ball.draw(context)
    }

    if (this.lineStart) {
      // Draw a point where the line will start, on desktop also draw a line to the mouse pointers current pos
      context.beginPath();
      context.arc(this.lineStart.x, this.lineStart.y, 2, 255, Math.PI * 2, true);
      context.closePath();
      context.fillStyle = 'green';
      context.fill();

      context.beginPath();
      context.moveTo(this.lineStart.x, this.lineStart.y);
      context.lineTo(this.controlManager.mousePosition.x, this.controlManager.mousePosition.y);
      context.strokeStyle = 'green';
      context.stroke();
    }

    if (this.controlManager.isHolding) {
      context.beginPath();
      context.arc(this.controlManager.mousePosition.x, this.controlManager.mousePosition.y, 25, 255, Math.PI * 2, true);
      context.closePath();
      context.fillStyle = 'green';
      context.fill();
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
    this.UIManager.init()
    this.controlManager.init()
    this.objectManager.init()
    this.setupEventListeners();

    this.lastDraw = performance.now()
    window.requestAnimationFrame((hrt) => this.mainLoop(hrt))
  }

  handleClick() {
    if (!this.isSoundInitiated) {
      Tone.start()
      this.isSoundInitiated = true
    }

    const position = this.controlManager.getRelativeMousePosition()    
    if (this.lineStart) {
      this.lineStart = new Vec2( { x: this.lineStart.x / this.canvas.width, y: this.lineStart.y / this.canvas.height } )
      this.objectManager.addObject(Line, this.lineStart, position)
      this.lineStart = undefined
    } else {
      this.lineStart = this.controlManager.mousePosition
    }
  }

  handleHeld() {
    const position = this.controlManager.getRelativeMousePosition()
    const spawners = this.objectManager.getObjectsOfClass(BallSpawner)

    const timer = spawners.length ? spawners[0].timer : 0
    this.objectManager.addObject(BallSpawner, new Vec2(position), 2, this.currentSynth, timer)
  }

  setupEventListeners() {
    this.canvas.addEventListener('control-manager-click', (e) => this.handleClick(e))
    this.canvas.addEventListener('control-manager-held', (e) => this.handleHeld(e))

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    });

    this.canvas.addEventListener('spawn-ball', (e) => {
      const spawners = this.objectManager.getObjectsOfClass(BallSpawner)

      if (this.balls.length < spawners.length * this.maxBalls) {
        const ball = new Ball(e.detail.position.x, e.detail.position.y, e.detail.spawner)
        this.balls.push(ball)
      }
    })

    this.canvas.addEventListener('play-tone', (e) => {
      const maxSpeed = 500
      const speed = e.detail.speed.length()
      const speedFraction = speed / maxSpeed

      const maxNoteLength = 12
      const noteFloor = 2
      const noteLength = maxNoteLength - Math.round(speedFraction * maxNoteLength) + noteFloor

      const scale = e.detail.position.y / this.canvas.height
      
      const indexToPlay = Math.round((this.fullScale.length - 1) * scale)
      console.log('playing an', this.fullScale[indexToPlay], noteLength+'n')

      const now = Tone.now()
      const synth = e.detail.spawner.synth
      synth.triggerAttackRelease(this.fullScale[indexToPlay], noteLength + 'n', now)
    })
  } 
}

window.init = function init() {
  console.log('global init')

  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.26/Tone.min.js'
  document.head.append(script)

  script.onload = () => {
    const game = new Game()
   game.init()
  }
}
