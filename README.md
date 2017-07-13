# jumpstore
A redux boilerplate saver. Ever feel like sometimes your redux actions and reducers are unnecessarily verbose? While doing things as described in the [redux](http://redux.js.org/docs/basics/Reducers.html) docs makes the workings behind redux blatantly obvious, using this tiny module can cut down a LOT of code.

## Installation

Install with npm:
```
npm install jumpstore --save
```

Then include it in your module:

es6:
```javascript
import jumpstore from 'jumpstore'
```
or (commonjs):
```javascript
const jumpstore = require('jumpstore')
```

## Usage
The store replaces action creators and reducers (or rather, creates them for you all at once)
```javascript
// store.js
import jumpstore from 'jumpstore'

const initialState = {
  pageTitle: 'This is the default',
}

// See "API" section below for info about these arguments
const store = jumpstore(
  'pageHeader', //the prefix for all actions in this "store"
  initialState,
  {
    setTitle(state, payload) { //action+reducer is combined, an action is created called `pageHeader_setTitle`
      return {
        pageTitle: payload
      }
    },
    //any other action/reducer you want
  }
})

export default store
```

Dispatch actions in your component the same as always:

```javascript
import React from 'react'
import { connect } from 'react-redux'
import store from './store' //import this instead of your actions

const mapStateToProps = (state, ownProps) => {
  return {
    pageTitle: state.pageTitle
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeTitle: (newTitle) => {
      //when calling actions (from the store above) you only need to pass in the payload
      dispatch(store.setTitle(newTitle))
    }
  }
}

const PageHeader = ({ pageTitle, changeTitle }) => (
  <div>
    <h1>{pageTitle}</h1>
    <button onClick={() => changeTitle('This is the new title')}>Change The Title</button>
  </div>
)

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader)
```

Use `redux` [combineReducers and createStore](http://redux.js.org/docs/recipes/reducers/UsingCombineReducers.html) as usual:

```javascript
//rootReducer.js
import pageTitle from './PageTitle/store'
export default combineReducers({
  pageTitle,
  //... other reducers (stores from jumpstore or regular redux reducers) here
})
```

## API

`jumpstore(<actionPrefix>, <initialState>, <actions>)`: Returns an object with action creators that can be called via dispatch

#### `actionPrefix` *String*:
All resulting action names are prepended with this string. If you use redux devtools chrome extension, you'll see each action defined in the 3rd argument is prepended with this string.

#### `initialState` *Object*:
The initial state for this store - reducers are applied to this state. Ex: `{ pageTitle: 'Default' }`

#### `actions` *Object*:
Functions defined here become reducers, and action creators are exported for each one. Each function must return whatever changes are to be made - no need to return the entire state (via `Object.assign`), `jumpstore` does that under the hood similar to how react's `setState` works. For example:
```
{
  //the current state is received, along with the payload (whatever is normally provided to an action creator)
  setTitle(state, payload) {
    return {
      pageTitle: payload
    }
  },
  clearTitle(state){
    return {
      pageTitle: ''
    }
  }
}
```
When dispatching this action, you only need to provide the payload: `dispatch(store.setTitle('New title'))`


## Origins
This was the seed module behind [jumpstate](https://github.com/jumpsuit/jumpstate) but without all the `hooks` and `effects` and your components look exactly as they would if you were using regular ole `redux` (doesn't abstract `dispatch`)
