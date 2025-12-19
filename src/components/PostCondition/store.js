export const initialState = {
  effects: [],
  isProbabilityValid: false,
  modifyAttributeOption: 'no',
  selectedAttribute: null,
  deterministicOption: 'deterministic',
  attributes: [],
  idStep: null,
}

/**
 * Validate that the sum of effect probabilities equals 100 (percent).
 *
 * Each item in the `effects` array is expected to be an object with a numeric
 * `probability` property representing a fractional probability (e.g. 0.25 for 25%).
 * The function converts each fraction to a percentage by multiplying by 100 and
 * returns true only if the total percentage equals exactly 100.
 *
 * @param {Array<{ probability: number }>} effects - Array of effect objects with a `probability` number (fraction between 0 and 1).
 * @returns {boolean} True if the sum of (probability * 100) for all effects equals 100, otherwise false.
 *
 * @example
 * // returns true (0.5 -> 50, 0.5 -> 50)
 * validateProbabilities([{ probability: 0.5 }, { probability: 0.5 }]);
 *
 * @example
 * // returns false (0.3 -> 30, 0.3 -> 30)
 * validateProbabilities([{ probability: 0.3 }, { probability: 0.3 }]);
 *
 * @note Due to floating-point precision, sums that are mathematically 100 may
 * sometimes not equal 100 exactly. Consider introducing a tolerance if needed.
 */
const validateProbabilities = (effects) => {
  const totalProbability = effects.reduce(
    (a, b) => a + (typeof b.probability === 'number' ? b.probability : 0) * 100,
    0
  )
  return totalProbability === 100
}

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_EFFECTS:
      return {
        ...state,
        effects: action.payload,
        isProbabilityValid: validateProbabilities(action.payload),
      }
    case ACTIONS.ADD_EFFECT:
      return {
        ...state,
        effects: [...state.effects, action.payload],
        isProbabilityValid: validateProbabilities([...state.effects, action.payload]),
      }
    case ACTIONS.SET_MODIFY_ATTRIBUTE_OPTION:
      return { ...state, modifyAttributeOption: action.payload }
    case ACTIONS.SET_SELECTED_ATTRIBUTE:
      // call api to set selected attribute

      let _id = action.payload

      // if payload object
      if (typeof action.payload === 'object') {
        _id = action.payload._id
      }
      // find attribute
      const attribute = state.attributes.filter((a) => a._id === _id)[0]

      // call api to change selected attribute
      const fetchApi = async () => {
        const response = await fetch(`/api/step/edit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: state.idStep,
            modifiedAttributeObjectId: _id,
            __TYPE_MODIFIED_ATTRIBUTE__: attribute ? attribute.__type__ : undefined,
          }),
        })

        const data = await response.json()
        return data
      }

      // Only call the API if we actually found an attribute and there was no previously selected attribute
      if (!state.selectedAttribute && attribute) {
        fetchApi()
      }

      return {
        ...state,
        selectedAttribute: attribute,
      }
    case ACTIONS.SET_ATTRIBUTES:
      const newAttributes = [...state.attributes, ...action.payload]

      // remove duplicates
      const uniqueAttributes = newAttributes.filter(
        (v, i, a) => a.findIndex((t) => t._id === v._id) === i
      )

      // sort by code
      uniqueAttributes.sort((a, b) => a.code.localeCompare(b.code))

      return { ...state, attributes: uniqueAttributes }

    case ACTIONS.SET_STEP_ID:
      return { ...state, idStep: action.payload }
    case ACTIONS.EDIT_EFFECT:
      const updatedEffects = state.effects.map((effect) =>
        effect._id === action.payload._id ? action.payload : effect
      )
      return {
        ...state,
        effects: updatedEffects,
        isProbabilityValid: validateProbabilities(updatedEffects),
      }
    default:
      return state
  }
}

export const ACTIONS = {
  ADD_EFFECT: 'addEffect',
  SET_EFFECTS: 'setEffects',
  SET_MODIFY_ATTRIBUTE_OPTION: 'setModifyAttributeOption',
  SET_SELECTED_ATTRIBUTE: 'setSelectedAttribute',
  SET_ATTRIBUTES: 'setAttributes',
  SET_STEP_ID: 'setStepId',
  EDIT_EFFECT: 'editEffect',
}
