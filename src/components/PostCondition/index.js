import { useContext, useEffect, useId, useReducer, useState } from 'react'

import Effect from '../Effect'
import { ToastContext } from '../Toast'
import { ACTIONS, initialState, reducer } from './store'

export default function PostCondition({
  idStep,
  idCaseModel,
  idEvent,
  idTactic,
  modifiedAttributeObjectId,
}) {
  const [isLoading, setLoading] = useState(true)
  const [modifyAttributeOption, setModifyAttributeOption] = useState('no') // value do check
  const [deterministicOption, setDeterministicOption] = useState('deterministic') // value do check

  const postConditionModifyAttributeYesOptionId = useId()
  const postConditionModifyAttributeNoOptionId = useId()

  const postConditionDeterministicOptionId = useId()
  const postConditionUndeterministicOptionId = useId()

  const { dispatchToast } = useContext(ToastContext)
  const [store, dispatch] = useReducer(reducer, initialState)

  async function addNewEffect() {
    // call api to create new effect
    const payload = {
      idStep: idStep,
      idEvent: idEvent,
      effect: 'Sucessfully respond to treatment',
      probability: 1,
      updates: [],
    }

    // se tipo de attributo é Attribute, deve endiar idAttribute
    // se tipo de attributo é Metric, deve endiar idMetric
    if (store.selectedAttribute.__type__ === 'Attribute') {
      payload.idAttribute = store.selectedAttribute._id
    } else {
      payload.idMetric = store.selectedAttribute._id
    }

    const request = await fetch(`/api/postcondition/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await request.json()
    if (!data) {
      dispatchToast('danger', 'Error creating postcondition')
      return
    } else {
      dispatchToast('success', 'Postcondition effect created successfully')
    }

    const effect = {
      _id: data.insertedId,
      ...payload,
    }

    dispatch({ type: ACTIONS.ADD_EFFECT, payload: effect })
  }

  // get postconditions data from API
  useEffect(() => {
    if (idStep) {
      dispatch({ type: ACTIONS.SET_STEP_ID, payload: idStep })

      const fetchData = async () => {
        const response = await fetch(`/api/postcondition/all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idStep: idStep }),
        })
        return await response.json()
      }

      fetchData().then((data) => {
        if (!data) {
          dispatchToast('danger', 'Step not found')
          return
        }

        dispatch({ type: ACTIONS.SET_EFFECTS, payload: data })
        setModifyAttributeOption(data.length > 0 ? 'yes' : 'no')
        setDeterministicOption(data.length > 1 ? 'undeterministic' : 'deterministic')
        setLoading(false)
      })
    }
  }, [idStep, dispatchToast])

  // get postconditions data from API
  useEffect(() => {
    if (idEvent) {
      const fetchData = async () => {
        const response = await fetch(`/api/postcondition/all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idEvent }),
        })
        return await response.json()
      }

      fetchData().then((data) => {
        if (!data) {
          dispatchToast('danger', 'Step not found')
          return
        }

        dispatch({ type: ACTIONS.SET_EFFECTS, payload: data })
        setModifyAttributeOption(data.length > 0 ? 'yes' : 'no')
        setDeterministicOption(data.length > 1 ? 'undeterministic' : 'deterministic')
        setLoading(false)
      })
    }
  }, [idEvent, dispatchToast])

  // get attributes by case model from API
  useEffect(() => {
    if (idCaseModel) {
      const fetchData = async () => {
        const response = await fetch(`/api/attribute/allByCaseModel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idCaseModel: idCaseModel }),
        })
        return await response.json()
      }

      fetchData().then((data) => {
        if (!data) {
          dispatchToast('danger', 'Step not found')
          return
        }

        dispatch({
          type: ACTIONS.SET_ATTRIBUTES,
          payload: data,
        })
        dispatch({
          type: ACTIONS.SET_SELECTED_ATTRIBUTE,
          payload: modifiedAttributeObjectId || data[0]?._id,
        })
        setLoading(false)
      })
    }
  }, [idCaseModel, dispatchToast, modifiedAttributeObjectId])

  useEffect(() => {
    if (idTactic) {
      const fetchData = async () => {
        const response = await fetch(`/api/metric/all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idTactic: idTactic }),
        })
        return await response.json()
      }

      fetchData().then((data) => {
        if (!data) {
          dispatchToast('danger', 'Step not found')
          return
        }

        dispatch({
          type: ACTIONS.SET_ATTRIBUTES,
          payload: data,
        })
        dispatch({
          type: ACTIONS.SET_SELECTED_ATTRIBUTE,
          payload: modifiedAttributeObjectId,
        })
        setLoading(false)
      })
    }
  }, [idTactic, dispatchToast, modifiedAttributeObjectId])

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '150px' }}
      >
        <div className="spinner-border text-primary" role="status" aria-label="Loading">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card-body">
      <div>
        <h6>Does the step modify an attribute?</h6>

        <div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id={postConditionModifyAttributeYesOptionId}
              checked={modifyAttributeOption === 'yes'}
              value="yes"
              onChange={() => setModifyAttributeOption('yes')}
              data-testid="post-condition-modify-attribute-yes"
            ></input>
            <label className="form-check-label" htmlFor={postConditionModifyAttributeYesOptionId}>
              Yes
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id={postConditionModifyAttributeNoOptionId}
              checked={modifyAttributeOption === 'no'}
              value="no"
              onChange={() => setModifyAttributeOption('no')}
            ></input>
            <label className="form-check-label" htmlFor={postConditionModifyAttributeNoOptionId}>
              No
            </label>
          </div>
        </div>
      </div>
      {modifyAttributeOption === 'yes' && (
        <>
          <div className="mt-4">
            <h6>Does the step has a deterministic or undeterministic effects?</h6>
            <small className="fst-italic">
              Info: Deterministic step has only one effect with probability equals 1.
              Undeterministic step has more than one effect with different probabilities.
            </small>
            <div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id={postConditionDeterministicOptionId}
                  value="deterministic"
                  checked={deterministicOption === 'deterministic'}
                  onChange={() => setDeterministicOption('deterministic')}
                ></input>

                <label className="form-check-label" htmlFor={postConditionDeterministicOptionId}>
                  Deterministic
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id={postConditionUndeterministicOptionId}
                  value="undeterministic"
                  checked={deterministicOption === 'undeterministic'}
                  onChange={() => setDeterministicOption('undeterministic')}
                  data-testid="post-condition-undeterministic"
                ></input>
                <label className="form-check-label" htmlFor={postConditionUndeterministicOptionId}>
                  Undeterministic
                </label>
              </div>
            </div>
            <div>
              {
                // if not effects, alert message
                store.effects.length === 0 && (
                  <div className="alert alert-warning mt-4" role="alert">
                    No effects found. Please add an effect.
                  </div>
                )
              }
              {store.effects &&
                store.effects.map((effect) => (
                  <Effect
                    key={effect._id}
                    attributes={store.attributes}
                    deterministic={deterministicOption === 'deterministic'}
                    effect={effect}
                    onChangeEffect={(newEffect) => {
                      // dispatch event
                      dispatch({
                        type: ACTIONS.EDIT_EFFECT,
                        payload: newEffect,
                      })
                    }}
                    onUpdatedCallback={(newEffect) => {
                      const newEffectList = store.effects.map((effect) => {
                        if (effect._id === newEffect._id) {
                          return newEffect
                        }
                        return effect
                      })
                      dispatch({
                        type: ACTIONS.SET_EFFECTS,
                        payload: newEffectList,
                      })
                    }}
                    onDeletedCallback={(deletedEffect) => {
                      const newEffectList = store.effects.filter(
                        (effect) => effect._id !== deletedEffect._id
                      )
                      dispatch({
                        type: ACTIONS.SET_EFFECTS,
                        payload: newEffectList,
                      })
                    }}
                  ></Effect>
                ))}
            </div>

            {!store.isProbabilityValid && (
              <div className="mt-4">
                <div class="alert alert-danger" role="alert">
                  The sum of probabilities must equal 1
                </div>
              </div>
            )}

            <div className="btn-group mt-4">
              {(deterministicOption === 'undeterministic' || store.effects.length == 0) && (
                <button
                  className="btn btn-outline-primary"
                  type="submit"
                  onClick={addNewEffect}
                  data-testid="btn-add-effect"
                >
                  Add effect
                </button>
              )}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!store.isProbabilityValid}
                onClick={() => {
                  const saveEffect = async (effect) => {
                    const request = await fetch(`/api/postcondition/edit`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(effect),
                    })

                    const data = await request.json()

                    if (!data) {
                      dispatchToast('danger', 'Error updating postcondition')
                      return
                    } else {
                      dispatchToast('success', 'Postcondition effect updated successfully')
                    }
                  }

                  store.effects.forEach((effect) => {
                    saveEffect(effect)
                  })
                }}
                data-testid="btn-save-effects"
              >
                Save all effects
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
