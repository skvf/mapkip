export const initialState = {
  updates: [],
  showAlert: false,
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_EFFECT':
      return { ...state, effect: action.payload }
    case 'SET_UPDATES':
      return { ...state, updates: action.payload }
    case ACTIONS.ADD_UPDATE:
      const newUpdatesArray = [...state.updates, action.payload]

      // show alert if there are more than 1 update with the same idAttribute
      const showAlert = newUpdatesArray.some(
        (update, index) =>
          newUpdatesArray.findIndex((u) => u.idAttribute === update.idAttribute) !== index
      )

      return {
        ...state,
        updates: newUpdatesArray,
        showAlert,
      }
    case ACTIONS.EDIT_UPDATE:
      const newUpdatesArray2 = state.updates.map((update) =>
        update._id === action.payload._id ? { ...update, ...action.payload } : update
      )

      // show alert if there are more than 1 update with the same idAttribute
      const showAlert1 = newUpdatesArray2.some(
        (update, index) =>
          newUpdatesArray2.findIndex((u) => u.idAttribute === update.idAttribute) !== index
      )
      return {
        ...state,
        updates: newUpdatesArray2,
        showAlert: showAlert1,
      }
    case ACTIONS.REMOVE_UPDATE:
      const newUpdatesArray3 = state.updates.filter((update) => update._id !== action.payload._id)
      // show alert if there are more than 1 update with the same idAttribute
      const showAlert2 = newUpdatesArray3.some(
        (update, index) =>
          newUpdatesArray3.findIndex((u) => u.idAttribute === update.idAttribute) !== index
      )
      return {
        ...state,
        updates: newUpdatesArray3,
        showAlert: showAlert2,
      }

    default:
      return state
  }
}

export const ACTIONS = {
  SET_UPDATES: 'SET_UPDATES',
  ADD_UPDATE: 'ADD_UPDATE',
  EDIT_UPDATE: 'EDIT_UPDATE',
  REMOVE_UPDATE: 'REMOVE_UPDATE',
}
