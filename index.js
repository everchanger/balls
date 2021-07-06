import { Ball, Line, Vec2, BallSpawner } from './modules/index.js'

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    this.drag = 0.5
    this.showControls = false
    this.objectIdCounter = 1
    this.actions = []
    this.isTouching = false
    this.isHolding = false
    this.timeHeld = 0
    this.clickThreshold = 0.3
    this.mousePosition = new Vec2(0, 0)

    const toneScale = ['C', 'D', 'E', 'F']
    const numericalScale = [1, 2, 3, 4]
    this.fullScale = numericalScale.flatMap(num => toneScale.map(note => `${note}${num}`)).reverse()

    this.controls = [
      {
        type: 'button',
        label: 'Undo',
        callback: () => this.undoLastAction()
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
    
    if (this.isTouching) {
      this.timeHeld += this.deltaTime
      if (this.timeHeld >= this.clickThreshold) {
        this.isHolding = true
      }
    }

    if (this.lineStart && this.isHolding) {
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

    for (const spawner of this.spawners) {
      spawner.draw(context)
    }

    for (const ball of this.balls) {
      ball.draw(context)
    }

    for (const line of this.lines) {
      line.draw(context)
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
      context.lineTo(this.mousePosition.x, this.mousePosition.y);
      context.strokeStyle = 'green';
      context.stroke();
    }

    if (this.isHolding) {
      context.beginPath();
      context.arc(this.mousePosition.x, this.mousePosition.y, 25, 255, Math.PI * 2, true);
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
      } else if (control.type === 'button') {
        element = document.createElement('button')
        element.innerHTML = control.label
        element.addEventListener('click', control.callback)
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

  addObjectAction(obj) {
    obj.actionId = this.objectIdCounter
    this.objectIdCounter++
    this.actions.push(obj)
  }

  undoLastAction() {
    if (this.actions.length) {
      const lastAction = this.actions.pop()
      if (lastAction instanceof Line) {
        this.lines = this.lines.filter(object => object.actionId !== lastAction.actionId)
      } else if (lastAction instanceof BallSpawner) {
        this.spawners = this.spawners.filter(object => object.actionId !== lastAction.actionId)
      }
    }
  }

  setMousePosition(event) {
    if (event.changedTouches) {
      event = event.changedTouches[0]
    }
    const parent = this.canvas.offsetParent
    this.mousePosition = new Vec2({ x: event.pageX - (this.canvas.offsetLeft + parent.offsetLeft), y: event.pageY - (this.canvas.offsetTop + parent.offsetTop) })
  }

  handleClick() {
    const position = new Vec2(this.mousePosition)
    console.log('handle click')
    
    if (this.lineStart) {
      const line = new Line(this.lineStart, position)

      this.lines.push(line)
      this.lineStart = undefined
      this.addObjectAction(line)
    } else {
      this.lineStart = position
    }
  }

  handleHeld() {
    const position = new Vec2(this.mousePosition)

    const timer = this.spawners.length ? this.spawners[0].timer : 0
    const spawner = new BallSpawner(new Vec2(position), 2, this.currentSynth, timer)

    this.addObjectAction(spawner)
    this.spawners.push(spawner)
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

    const handleTouch = (e) => {
      e.preventDefault();
      this.setMousePosition(e)
      if (this.lineStart === undefined && this.lines.length === 0) {
        Tone.start()
      }
      this.isTouching = true  
    }
    const handleTouchRelease = (e) => {
      e.preventDefault();
      this.setMousePosition(e)

      if (this.timeHeld <= this.clickThreshold) {
        this.handleClick(e)
      } else {
        this.handleHeld(e)
      }
      this.isTouching = false
      this.isHolding = false
      this.timeHeld = 0
    }
    const handleTouchMovement = (e) => {
      e.preventDefault();
      this.setMousePosition(e)
    }

    this.canvas.addEventListener('mousedown', (e) => handleTouch(e));
    this.canvas.addEventListener('touchstart', (e) => handleTouch(e));

    this.canvas.addEventListener('mouseup', (e) => handleTouchRelease(e))
    this.canvas.addEventListener('touchend', (e) => handleTouchRelease(e))

    this.canvas.addEventListener('mousemove', (e) => handleTouchMovement(e))
    this.canvas.addEventListener('touchmove', (e) => handleTouchMovement(e))

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
