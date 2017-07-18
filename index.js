/**
 * A state action/reducer wrapper for redux.
 * This is a slight modification of the state module from jumpsuit:
 * https://jumpsuit.io/
 * ...and was the original jumpstate, until jumpstate began to grow with feature bloat
 * The idea is that all your components look the same as if you were using vanilla redux,
 * but this module will alter the way you write ducks (actions and reducers)
 * @param  {string} stateName The state name everything defined here is nested under
 * @param  {object} actions   Object of action methods. Methods accept the initial `state` and a `payload`
 * @return {object}           Returns a reducer object for the redux store. Also includes action properties which can be dispatched
 * @example import jumpstore from 'jumpstore'
 * const initialState = {
 *   pageTitle: 'This is the default',
 * }
 * const store = jumpstore(
 *   'pageHeader',
 *   initialState,
 *   setTitle(state, payload) {
 *     return { pageTitle: payload }
 *   }
 * })
 * export default store
 *
 * //Can be consumed with:
 * import store from './store.js'
 * // Actions must be called with dispatch, as usual:
 * const { dispatch } = this.props
 * dispatch(store.setTitle('This is my title'))
 * // Calling dispatch(store.setTitle('This is my title')) is the equivalent of calling the
 * // setPageTitle action from below using plain redux. In other words, jumpstore defines and exports actions which are callable
 * // Each action, when defined (above), receives the state and a payload.
 * // When the action is called, you only need to pass in the payload
 *
 * //Async functions can be defined as well which under the hood using redux-thunk:
 *
 * export function setupPageHeader(config){
 *   return (dispatch, getState) => {
 *     //do some async call like an api request
 *     ...
 *     // after it resolves, you can call:
 *     dispatch(store.setTitle(response.data.title))
 *   }
 * }
 *
 *
 * // The above is a shortcut for doing it the purely redux way
 * // (except action names are different, but to the consumer, who really cares about action names?).
 * // As far as redux is concerned, it has the same result:
 *
 * const SET_PAGE_TITLE = 'template/SET_PAGE_TITLE'
 *
 * const defaultState = {
 *   pageTitle: 'This is the default'
 * }
 *
 * //REDUCER
 * export default function reducer(state = defaultState, action) {
 *   switch (action.type) {
 *     case SET_PAGE_TITLE:
 *       return Object.assign({}, state, {
 *         pageTitle: action.payload
 *       })
 *     default: return state
 *   }
 * }
 *
 * //ACTIONS
 * export function setPageTitle(pageTitle) {
 *   return {
 *     type: SET_PAGE_TITLE,
 *     payload: pageTitle
 *   }
 * }
 *
 * // Use combineReducers, createStore, and redux Provider as usual
 * import pageTitleStore from './PageTitle/store'
 * export default combineReducers({
 *   pageTitleStore,
 *   ... other reducers (stores from jumpstore or regular redux reducers) here
 * })
 *
 */
module.exports = function(stateName, initialState, actions) {

  const prefixedActions = {}

  /**
   * Create the reducer object (function) based on the
   * actions implied for our list of actions passed in
   * This is what gets passed to the redux root reducer
   * @param  {object} state   as is the standard for a reducer function, pass in the starting state (or initial state as default)
   * @param  {object} action  typical reducer action. contains type and payload. This is, when run, the action is run to get the resulting state
   * @return {object}         new state object
   */
  const reducerWithActions = (state = initialState, action) => {
    if (!prefixedActions[action.type]) {
      return state
    }

    return Object.assign({}, state, prefixedActions[action.type](state, action.payload))
  }

  //Add the name property for reference in other modules (used in jumpsuit)
  reducerWithActions._name = stateName

  /**
   * Loop through actions in our state, Create a redux action for each action passed in
   * and tack in on to our reducerWithActions object.
   * For example, this adds to the reducerWithActions object a property for each action,
   * so you can call dispatch(reducerWithActions.actionName()) to dispatch an action.
   * @param  {array} actions
   */
  Object.keys(actions).forEach((actionName) => {
    /* alias the action to the state under the action name */
    reducerWithActions[actionName] = (payload) => {
      return {
        type: `${stateName}_${actionName}`,
        payload
      }
    }

    /* prefix an alias to the action for the reducer to reference */
    prefixedActions[`${stateName}_${actionName}`] = actions[actionName]

    /* makes actions available directly when testing */
    if (process.env.NODE_ENV === 'testing') {
      reducerWithActions[`_${actionName}`] = actions[actionName]
    }
  })

  return reducerWithActions
}
