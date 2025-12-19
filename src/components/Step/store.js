export const initialState = {
  description: null,
  assignedRole: null,
  cost: null,
}

export const reducer = (state, action) => {
  let newState
  switch (action.type) {
    case 'SET_DESCRIPTION':
      newState = { ...state, description: action.payload }
      return newState
    case 'SET_ASSIGNED_ROLE':
      newState = { ...state, assignedRole: action.payload }
      return newState
    case 'SET_COST':
      newState = { ...state, cost: action.payload }
      return newState
    default:
      return state
  }
}

/**
 * Action types for managing step state in the application.
 * @enum {string}
 * @property {string} SET_DESCRIPTION - Action to set the description of a step.
 * @property {string} SET_ASSIGNED_ROLE - Action to set the assigned role for a step.
 * @property {string} SET_COST - Action to set the cost of a step.
 */
export const ACTIONS = {
  SET_DESCRIPTION: 'SET_DESCRIPTION',
  SET_ASSIGNED_ROLE: 'SET_ASSIGNED_ROLE',
  SET_COST: 'SET_COST',
}
