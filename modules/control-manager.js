import { Vec2 } from "./vec2.js";

export class ControlManager {
  constructor(canvas) {
    this.canvas = canvas
    this.isTouching = false
    this.isHolding = false
    this.timeHeld = 0
    this.clickThreshold = 0.3
    this.mousePosition = new Vec2(0, 0)
  }

  setMousePosition(event) {
    if (event.changedTouches) {
      event = event.changedTouches[0]
    }
    const parent = this.canvas.offsetParent
    this.mousePosition = new Vec2({ x: event.pageX - (this.canvas.offsetLeft + parent.offsetLeft), y: event.pageY - (this.canvas.offsetTop + parent.offsetTop) })
  }

  getRelativeMousePosition() {
    return { x: this.mousePosition.x / this.canvas.width, y: this.mousePosition.y / this.canvas.height }
  } 

  registerEventListeners() {
    const handleTouch = (e) => {
      e.preventDefault();
      this.setMousePosition(e)
     
      this.isTouching = true  
    }
  
    const handleTouchRelease = (e) => {
      e.preventDefault();
      this.setMousePosition(e)

      if (this.timeHeld <= this.clickThreshold) {
        // this.handleClick(e)
        const event = new CustomEvent('control-manager-click', e);
        this.canvas.dispatchEvent(event)
      } else {
        // this.handleHeld(e)
        const event = new CustomEvent('control-manager-held', e);
        this.canvas.dispatchEvent(event)
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
  }

  update(deltaTime) {
    if (this.isTouching) {
      this.timeHeld += deltaTime
      if (this.timeHeld >= this.clickThreshold) {
        this.isHolding = true
      }
    }

    if (this.lineStart && this.isHolding) {
      this.lineStart = undefined
    }
  }

  draw(context) {
    
  }

  init() {
    this.registerEventListeners()
  }
}