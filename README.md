# Unfinite-State Machine

_A tiny, flexible state machine to work with external contexts_

It's called 'unfinite' because it's not a finite-state machine.

Sometimes modelling the overall state of an application with a state machine is impractical. Unfinite-State Machine is conceived to interact with an external context, allowing the machine's behaviour to both depend on, and modify this context. It's perfect for fast prototyping and creative experimentation, just remember to test your edge cases.

## Installation

```bash
npm i ufsm
```

## How it works

The machine can only be in one of its predefined **states**.

```js
states: {
    stateA: { ... },
    stateB: { ... },
}
```

You interact with the machine by sending it an **event**.

```js
machine.send(event)
```

The machine's response to an event is determined by the **event handlers** of its current state. If the current state has a matching event handler, that handler is executed. Otherwise, the event is ignored.

```js
stateA: {
    eventA: ...,
    eventB: ...,
    eventC: ...,
}
```

If the event handler returns a valid state, the machine **transitions** to that new state:

1. the `onExit` handler of the old state is called,
2. the `onEnter` handler of the new state is called,
3. the `transitionCallback` function is called.

## Usage example

This example creates merchants who can sell products when they are open and restock when they are closed. The stock is an external context shared by all merchants.

```js
import { createMachine } from 'ufsm'

let stock = 10

const merchantDefinition = {
  initial: 'closed',
  states: {
    closed: {
      openStore: () => {
        if (stock > 0) {
          return 'open'
        }
      },
      restock: (event) => {
        stock += event.quantity
      },
    },
    open: {
      closeStore: 'closed',
      sellProduct: () => {
        if (stock > 0) {
          stock -= 1
        }
      },
    },
  },
}

const merchantA = createMachine(merchantDefinition, console.log)
const merchantB = createMachine(merchantDefinition, console.log)

merchantA.send('openStore')
merchantA.send('sellProduct')
merchantA.send('closeStore')
merchantA.send({ type: 'restock', quantity: 5 })
```

## Reference

### `createMachine`

To use the `createMachine` function, import it from the `ufsm` package.

```js
import { createMachine } from 'ufsm'
```

It creates a state machine based on a [`definition`](#definition), with an optional [`transitionCallback`](#transitionCallback) function and returns a machine object.

The machine object has two function properties:

- `send`: sends an [event](#event) to the machine,
- `state`: returns the name of the current state as a string.

```js
const machine = createMachine(definition, transitionCallback)

// Send an event to the machine
machine.send(event)

//Get the current state
let currentState = machine.state()
```

### `definition`

The `definition` object specifies the machine's behaviour by setting the initial and all possible [`states`](#states) it can be in.

```js
const definition = {
    initial: 'initialState',
    states: {
        stateA: {...},
        stateB: {...},
        stateC: {...},
    },
}
```

### `states`

States are objects where keys represent the type of the [`event`](#event) and values represent the [`handlers`](#eventHandler) for that event.

```js
state: {
    eventType: eventHandler,
    ...
}
```

### `eventHandler`

An event handler can either be a simple string or a function. When the machine receives an [`event`](#event):

- If the event handler is a simple string matching the name of a valid state, the machine transitions to that state.
- If the event handler is a function, that function is called with the event as the argument. If the function returns a string matching the name of a valid state, the machine transitions to that state.

There are two special event handlers that the machine executes automatically during a transition:

- `onExit`: Called when the machine transition out of a state. It can redirect a transition by returning a valid state.
- `onEnter`: Called when the machine transition into a state. It can redirect a transition by returning a valid state, which may cause an infinite loop. If the transition is redirected by `onEnter`, the `transitionCallback` and `onExit` functions are not called on the redirecting state. `onEnter` is not executed for the initial state when the machine is created.

### `transitionCallback`

An optional callback function provided during initialization. The machine calls this function when it enters a new state, passing the name of that state as the argument.

### `event`

An event can either be a simple string or an object with a `type` property that has a string value. This value is matched against the event handlers defined in the current state. This format is compatible with DOM Events, such as `click` or `mousemove`.

```js
machine.send('eventA')
machine.send({type: 'eventB', ...})
```
