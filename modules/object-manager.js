import { Line, BallSpawner } from "./index.js"

export class ObjectManager {
  constructor(canvas) {
    this.canvas = canvas
    this.objects = []
    this.history = []
    this.objectIdCounter = 1
  }

  addObject(objectClass, ...data) {
    if (typeof objectClass === 'string') {
      if (objectClass === Line.prototype.constructor.name) {
        objectClass = Line
      } else if (objectClass === BallSpawner.prototype.constructor.name) {
        objectClass = BallSpawner
        data[3] = 0
      }
    }

    this.history.push({ c: objectClass.prototype.constructor.name, d: data })
    this.storeHistory()

    const obj = new objectClass(...data)
    obj.handleRelativePosition()

    obj.actionId = this.objectIdCounter
    this.objectIdCounter++
    this.objects.push(obj)
  }

  replayHistory(encodedHistory) {
    const json = atob(encodedHistory)
    const objects = JSON.parse(json)
    for (const obj of objects) {
      this.addObject(obj.c, ...obj.d)
    }
  }

  storeHistory() {
    let historyString = '?h='
    if (this.history.length) {
      const jsonHistory = JSON.stringify(this.history)
      historyString += `${btoa(jsonHistory)}`
    }
    history.replaceState({}, '', historyString);
  }

  undoLastObject() {
    if (!this.objects.length) {
      return
    }
    const lastAction = this.objects.pop()
    this.history.pop()
    this.objects = this.objects.filter(object => object.actionId !== lastAction.actionId)

    this.storeHistory()
  }
  
  removeAllObjects() {
    this.objects = []
    this.history = []
    this.storeHistory()
  }

  getObjectsOfClass(objectClass) {
    return this.objects.filter(obj => obj instanceof objectClass)
  }

  update(deltaTime) {
    for (const obj of this.objects) {
      obj.update(deltaTime)
    }
  }

  draw(context) {
    for (const obj of this.objects) {
      obj.draw(context)
    }
  }

  init() {
    const split = window.location.href.split('?h=')
    if (split.length > 1 && split[1].length) {
      this.replayHistory(split[1])
    }
  }
}