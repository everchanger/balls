import { Ball, Line, Vec2, BallSpawner } from './modules/index.js'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.currentSynth = Tone.AMSynth
    this.synth = new Tone.PolySynth(this.currentSynth).toDestination()
    this.balls = []
    this.spawners = []
    this.lines = []
    this.lineStart = undefined
    this.deltaTime = 0
    this.lastDraw = 0
    this.maxBalls = 10
    this.gravityMultiplier = 27
    this.friction = 1
    this.drawTool = 'emitter'
    this.drag = 0.5
    this.showControls = false

    const toneScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    const numericalScale = [1, 2, 3, 4, 5, 6]
    this.fullScale = numericalScale.flatMap(num => toneScale.map(note => `${note}${num}`)).reverse()

    this.controls = [
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
            value: 'line',
            name: 'Line'
          },
          {
            value: 'emitter',
            name: 'Emitter'
          },
        ],
        label: 'Draw',
        variable: 'drawTool',
        callback: () => { this.lineStart = undefined }
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
        ],
        label: 'Synth',
        variable: 'currentSynth',
        callback: () => { 
          this.synth = new Tone.PolySynth(Tone[this.currentSynth]).toDestination()
        }
      },
    ]
  }
 
  update() {
    for (const spawner of this.spawners) {
      spawner.update(this.deltaTime)
    }
    for (const ball of this.balls) {
      ball.update(this.deltaTime, this.lines, this.gravityMultiplier, this.friction, this.drag)
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
    const gradiant = context.createLinearGradient(0, 0, 0, canvas.height)
    gradiant.addColorStop(0, '#331A38')
    gradiant.addColorStop(1, '#111')

    context.fillStyle = gradiant
    context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    for (const spawner of this.spawners) {
      spawner.draw(context)
    }

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

    this.lastDraw = performance.now()
    window.requestAnimationFrame((hrt) => this.mainLoop(hrt))
  }

  setupUIInputs() {
    const controlSection = document.getElementById('control-section')
    for (const control of this.controls) {
      const wrapper = document.createElement('div')
      const inputOutputWrapper = document.createElement('div')
      const labelElement = document.createElement('label')
      labelElement.innerHTML = control.label
      let element
      let outputElement
      if (control.type === 'input') {
        element = document.createElement('input')
        outputElement = document.createElement('span')
        outputElement.innerHTML = this[control.variable]
  
        for (const attribute in control.attributes) {
          element.setAttribute(attribute, control.attributes[attribute])
        }
  
        element.setAttribute('value', this[control.variable])
        element.addEventListener('input', (e) => {
          this[control.variable] = e.target.value
          outputElement.innerHTML = this[control.variable]
        })
      } else if (control.type === 'select') {
        element = document.createElement('select')
        for (const option of control.options) {
          const optionElement = document.createElement('option')
          optionElement.setAttribute('value', option.value)
          optionElement.innerHTML = option.name
          optionElement.classList = `option-${option.value}`
          if (this[control.variable] === option.value) {
            optionElement.setAttribute('selected', true)
          }
          element.appendChild(optionElement)
        }
        element.addEventListener('change', (e) => {
          this[control.variable] = e.target.value
          if (control.callback) {
            control.callback()
          }
        })
        inputOutputWrapper.classList = ('select-wrapper')
      }
     

      inputOutputWrapper.appendChild(element)
      if (outputElement) {
        inputOutputWrapper.appendChild(outputElement)
      }
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
        Tone.start()
      }

      const parent = this.canvas.offsetParent
      const position = new Vec2({ x: e.pageX - (this.canvas.offsetLeft + parent.offsetLeft), y: e.pageY - (this.canvas.offsetTop + parent.offsetTop) })

      if (this.drawTool === 'line') {
        if (this.lineStart) {
          const line = new Line(this.lineStart, position)
          this.lines.push(line)
          this.lineStart = undefined
        } else {
          this.lineStart = position
        }
      } else if (this.drawTool === 'emitter') {
        const timer = this.spawners.length ? this.spawners[0].timer : 0
        this.spawners.push(new BallSpawner(new Vec2(position), 2, this.currentSynth, timer))
      }
      
    });

    this.canvas.addEventListener('spawn-ball', (e) => {
      if (this.balls.length < this.spawners.length * this.maxBalls) {
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
      const noteLength = Math.round(speedFraction * maxNoteLength) + noteFloor

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
