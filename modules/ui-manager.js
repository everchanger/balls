export class UIManager {
  constructor(game, canvas, controls) {
    this.game = game
    this.canvas = canvas
    this.controls = controls
    this.showControls = false
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
        outputElement.innerHTML = this.game[control.variable]
  
        for (const attribute in control.attributes) {
          element.setAttribute(attribute, control.attributes[attribute])
        }
  
        element.setAttribute('value', this.game[control.variable])
        element.addEventListener('input', (e) => {
          this.game[control.variable] = e.target.value
          outputElement.innerHTML = this.game[control.variable]
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
          if (this.game[control.variable] === option.value) {
            optionElement.setAttribute('selected', true)
          }
          element.appendChild(optionElement)
        }
        element.addEventListener('change', (e) => {
          this.game[control.variable] = e.target.value
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

  registerEventListeners() {
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
  }

  update(deltaTime) {
  }

  draw(context) {
  }

  init() {
    this.setupUIInputs()
    this.registerEventListeners()
  }
}