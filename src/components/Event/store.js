export const initialState = {
  description: null,
}

export const reducer = (state, action) => {
  let newState
  switch (action.type) {
    case 'SET_DESCRIPTION':
      newState = { ...state, description: action.payload }
      return newState
    default:
      return state
  }
}

/**
 * Action types for managing step state in the application.
 * @enum {string}
 * @property {string} SET_DESCRIPTION - Action to set the description of a step.
 */
export const ACTIONS = {
  SET_DESCRIPTION: 'SET_DESCRIPTION',
}
