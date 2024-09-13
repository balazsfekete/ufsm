export function createMachine(definition, transitionCallback) {
  let currentState = definition.initial
  const states = definition.states

  const handle = (eventType, event) => {
    const eventHandler = states[currentState]?.[eventType]
    if (eventHandler) {
      const targetState = typeof eventHandler === 'function' ? eventHandler(event) : eventHandler
      if (states[targetState]) {
        return targetState
      }
    }
  }

  const send = (event) => {
    let targetState = handle(typeof event === 'string' ? event : event.type, event)
    if (targetState) {
      targetState = handle('onExit', event) || targetState
      while (targetState) {
        currentState = targetState
        targetState = handle('onEnter', event)
      }
      transitionCallback(currentState)
    }
  }

  const state = () => currentState

  return {
    send,
    state,
  }
}
