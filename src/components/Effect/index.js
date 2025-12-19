import { useContext, useEffect, useId, useReducer, useState } from 'react'

import { ToastContext } from '../Toast'
import { ACTIONS, initialState, reducer } from './store'

export default function Effect({
  attributes,
  deterministic,
  effect,
  onUpdatedCallback = () => {},
  onDeletedCallback = () => {},
  onChangeEffect = () => {},
}) {
  const [effectText, setEffectText] = useState(effect.effect)
  const [effectProbability, setEffectProbability] = useState(effect.probability)

  const { dispatchToast } = useContext(ToastContext)
  const [store, dispatch] = useReducer(reducer, initialState)

  const fieldEffectId = useId()
  const fieldEffectProbabilityId = useId()
  const fieldEffectUpdateId = useId()

  useEffect(() => {
    dispatch({
      type: ACTIONS.SET_UPDATES,
      payload: effect.updates || [],
    })
  }, [effect])

  const handleDeleteEffectButton = async () => {
    // call api to delete effect
    const payload = {
      ...effect,
    }

    const request = await fetch(`/api/postcondition/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await request.json()

    if (!data) {
      dispatchToast('danger', 'Error deleting postcondition')
      return
    } else {
      dispatchToast('success', 'Postcondition effect deleted successfully')
      onDeletedCallback(payload)
    }
  }

  return (
    <>
      <div className="mt-4">
        <div className="d-flex gap-4">
          <div className="col">
            <label className="form-label" htmlFor={fieldEffectId}>
              Effect:
            </label>
            <input
              className="form-control"
              type="text"
              id={fieldEffectId}
              value={effectText}
              onChange={(e) => {
                onChangeEffect({
                  ...effect,
                  effect: e.target.value,
                })
                setEffectText(e.target.value)
              }}
              data-testid="input-effect-name"
            ></input>
          </div>
          <div className="col">
            <label className="form-label" htmlFor={fieldEffectProbabilityId}>
              Probability:{' '}
            </label>
            <input
              className="form-control"
              type="number"
              step={0.01}
              min="0"
              max="1"
              id={fieldEffectProbabilityId}
              value={effectProbability}
              disabled={deterministic}
              onChange={(e) => {
                setEffectProbability(Number(e.target.value))
                onChangeEffect({
                  ...effect,
                  probability: Number(e.target.value),
                })
              }}
            ></input>
          </div>
          <div className="col">
            <label className="form-label" htmlFor={fieldEffectUpdateId}>
              -&gt; Update:
            </label>
            <div class="input-group">
              <input
                className="form-control"
                id={fieldEffectUpdateId}
                value={
                  attributes &&
                  effect.updates &&
                  (effect.updates.length == 0
                    ? 'No updates'
                    : effect.updates
                        .map((update) => {
                          const attribute = attributes.find(
                            (attribute) => attribute._id == update.idAttribute
                          )

                          if (!attribute) {
                            return 'No updates'
                          }

                          if (attribute.type === 'boolean') {
                            return `${attribute.code}'=${update.value === 1 ? 'true' : 'false'}`
                          }

                          if (update.operator === '=') {
                            return `${attribute.code}'${update.operator}${update.value}`
                          }

                          return `${attribute.code}'=${attribute.code}${update.operator}${update.value}`
                        })
                        .join(' & '))
                }
                disabled="true"
              ></input>
              <button
                class="btn btn-outline-secondary"
                type="button"
                id="button-addon2"
                data-bs-toggle="modal"
                data-bs-target={`#modalEditEffect${effect._id}`}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="col">
            <label className="form-label">Actions</label>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeleteEffectButton()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id={`modalEditEffect${effect._id}`}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Update Effect
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <h5>An effect can update multiple attributes</h5>
              <p className="text-muted">
                Example: a medice can reduce fever and pain at the same time
              </p>
              {store.updates.map((update, index) => (
                <div className="d-flex gap-4 align-items-center mb-2" key={update._id}>
                  <div className="col-2">
                    <strong>Update {index + 1}</strong>
                  </div>
                  <div className="col-5">
                    <select
                      className="form-select"
                      aria-label="Default select example"
                      value={update.idAttribute}
                      onChange={(e) => {
                        // if selected attribute is boolean, set operator to = and value to 1
                        const selectedAttribute = attributes.find(
                          (attribute) => attribute._id === e.target.value
                        )
                        if (selectedAttribute.type === 'boolean') {
                          dispatch({
                            type: ACTIONS.EDIT_UPDATE,
                            payload: {
                              ...update,
                              idAttribute: e.target.value,
                              operator: '=',
                              value: 1,
                            },
                          })
                          return
                        }
                        dispatch({
                          type: ACTIONS.EDIT_UPDATE,
                          payload: {
                            ...update,
                            idAttribute: e.target.value,
                          },
                        })
                      }}
                    >
                      {attributes.map((attribute) => (
                        <option key={attribute._id} value={attribute._id}>
                          {attribute.code}: {attribute.name} ({attribute.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-1">
                    <select
                      className="form-select"
                      aria-label="Default select example"
                      value={update.operator}
                      disabled={
                        attributes.find((attr) => attr._id === update.idAttribute)?.type ===
                        'boolean'
                      }
                      onChange={(e) => {
                        dispatch({
                          type: ACTIONS.EDIT_UPDATE,
                          payload: {
                            ...update,
                            operator: e.target.value,
                          },
                        })
                      }}
                    >
                      {['=', '+', '-', '*', '/'].map((operator) => (
                        <option key={operator} value={operator}>
                          {operator}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-2">
                    {attributes.find((attr) => attr._id === update.idAttribute)?.type ===
                    'boolean' ? (
                      <select
                        className="form-select"
                        aria-label="Default select example"
                        value={update.value}
                        onChange={(e) => {
                          dispatch({
                            type: ACTIONS.EDIT_UPDATE,
                            payload: {
                              ...update,
                              value: e.target.value === '1' ? 1 : 0,
                            },
                          })
                        }}
                        data-testid="select-effect-boolean-value"
                      >
                        <option value={1}>True</option>
                        <option value={0}>False</option>
                      </select>
                    ) : (
                      <input
                        className="form-control"
                        type="number"
                        id={fieldEffectId}
                        value={update.value}
                        onChange={(e) => {
                          dispatch({
                            type: ACTIONS.EDIT_UPDATE,
                            payload: {
                              ...update,
                              value: Number(e.target.value),
                            },
                          })
                        }}
                        data-testid="input-effect-value"
                      ></input>
                    )}
                  </div>

                  <div className="col-1">
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => {
                        dispatch({
                          type: ACTIONS.REMOVE_UPDATE,
                          payload: update,
                        })
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              ))}

              {store.showAlert && (
                <div className="alert alert-danger mt-3">
                  <strong>Warning!</strong> You have selected the same attribute multiple times.
                  Please check your updates.
                </div>
              )}

              <div className="d-flex gap-4 align-items-center mt-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={() =>
                    dispatch({
                      type: ACTIONS.ADD_UPDATE,
                      payload: {
                        idAttribute: attributes[0]._id,
                        operator: '=',
                        value: 1,
                        _id: new Date().getTime(),
                      },
                    })
                  }
                  data-testid="button-add-update"
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onChangeEffect({
                    ...effect,
                    updates: store.updates,
                  })
                }}
                data-bs-dismiss="modal"
                disabled={store.showAlert}
              >
                Save changes
              </button>
              <button type="button" className="btn btn-outline" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
