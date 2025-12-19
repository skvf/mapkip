import { useContext, useEffect, useMemo, useReducer, useState } from 'react'

import Loading from '../Loading'
import PostCondition from '../PostCondition'
import Precondition from '../Precondition'
import { ToastContext } from './../Toast'
import { ACTIONS, initialState, reducer } from './store'

export default function Step({ idStep }) {
  const [idCaseModel, setIdCaseModel] = useState(null)
  const [roles, setRoles] = useState([])
  const [hasPreconditionsOption, setHasPreconditionsOption] = useState('no') // value do check
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [idTactic, setIdTactic] = useState(null)
  const [modifiedAttributeObjectId, setModifiedAttributeObjectId] = useState(null)
  const [isSaved, setIsSaved] = useState(true)
  const { dispatchToast } = useContext(ToastContext)
  const [state, dispatch] = useReducer(reducer, initialState)

  /**
   * Sends a POST request to update a step object on the server.
   *
   * @param {Object} payload - The data to be sent in the request body.
   * @returns {Promise<Response>} A promise that resolves to the fetch response.
   */
  async function updateStepObject(payload) {
    const request = await fetch('/api/step/edit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return await request.json()
  }

  /**
   * Creates a debounced version of the provided function that delays its execution until after
   * a specified delay has elapsed since the last time it was invoked.
   *
   * @param {Function} fn - The function to debounce.
   * @param {number} delay - The number of milliseconds to delay.
   * @returns {Function} A debounced function that delays invoking `fn` until after `delay` milliseconds have elapsed.
   */
  function debounce(fn, delay) {
    let timeout = -1

    return function (...args) {
      if (timeout !== -1) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(fn, delay, ...args)
    }
  }

  /**
   * Returns a debounced function that updates a step object.
   * The debounced function delays invoking the update until after 750ms have elapsed since the last time it was invoked.
   *
   * @function
   * @param {Object} payload - The data to update the step object with.
   * @param {Function} [callback=(isSuccess, res) => {}] - Optional callback invoked after the update attempt.
   *        Receives a boolean indicating success and the response or error.
   * @returns {void}
   */
  const debouncedUpdateStep = useMemo(() => {
    return debounce((payload) => {
      updateStepObject(payload)
      setIsSaved(true)
    }, 750)
  }, [])

  // get step data from API
  useEffect(() => {
    if (idStep) {
      const fetchData = async () => {
        const response = await fetch(`/api/step/retrieve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: idStep }),
        })

        const fetchTactic = async (idTactic) => {
          const response = await fetch(`/api/tactic/retrieve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: idTactic }),
          })
          const data = await response.json()
          return data
        }

        const data = await response.json()

        if (!data) {
          dispatchToast('danger', 'Step not found')
          return
        }

        dispatch({
          type: ACTIONS.SET_DESCRIPTION,
          payload: data.description,
        })
        dispatch({
          type: ACTIONS.SET_ASSIGNED_ROLE,
          payload: data.idRole,
        })
        dispatch({
          type: ACTIONS.SET_COST,
          payload: data.cost,
        })

        setHasPreconditionsOption(data.preconditions.length > 0 ? 'yes' : 'no')
        setModifiedAttributeObjectId(data.modifiedAttributeObjectId)

        // if there are not idTactic in the step, then it is a task step
        if (!data.tactic) {
          setIdTactic(data.task.idTactic)
          const tactic = await fetchTactic(data.task.idTactic)
          setIdCaseModel(tactic.idCaseModel)
        } else {
          setIdTactic(data.tactic._id)
          setIdCaseModel(data.tactic.idCaseModel)
        }

        setIsLoading(false)
      }
      fetchData()
      setIsSaved(true)
    }
  }, [idStep, dispatchToast])

  // get roles from API
  useEffect(() => {
    if (idCaseModel) {
      const fetchData = async () => {
        const response = await fetch(`/api/role/all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idCaseModel }),
        })
        const data = await response.json()

        if (!data) {
          dispatchToast('danger', 'Roles not found')
          return
        }

        setRoles(data)
      }
      fetchData()
    }
  }, [idCaseModel, dispatchToast])

  const saveStepButtonClickHandler = async (e) => {
    e.preventDefault()

    setIsLoadingSave(true)

    // call to api to edit
    const response = await fetch(`/api/step/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idStep,
        description: state.description,
        idRole: state.assignedRole,
        cost: state.cost,
      }),
    })
    const data = await response.json()

    // if success, alert success
    if (data.ok > 0) {
      dispatchToast('success', 'Step saved successfully')
    }
    setIsLoadingSave(false)
  }

  if (isLoading) {
    return (
      <div className="container">
        <Loading message="Loading step..." />
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="card mb-4">
          <div className="card-header">
            Step <code>#{idStep}</code>{' '}
          </div>
          <div className="card-body">
            <div className="form-group mb-4">
              <label className="form-label">Description of the step</label>{' '}
              <input
                className="form-control"
                value={state.description}
                onChange={(e) => {
                  dispatch({
                    type: ACTIONS.SET_DESCRIPTION,
                    payload: e.target.value,
                  })
                  debouncedUpdateStep({
                    _id: idStep,
                    description: e.target.value,
                    idRole: state.assignedRole,
                    cost: state.cost,
                  })
                }}
              />
            </div>
            <div className="row mb-4">
              <div className="col">
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-control form-select"
                  value={state.assignedRole}
                  onChange={(e) => {
                    dispatch({
                      type: ACTIONS.SET_ASSIGNED_ROLE,
                      payload: e.target.value,
                    })
                    debouncedUpdateStep({
                      _id: idStep,
                      description: state.description,
                      idRole: e.target.value,
                      cost: state.cost,
                    })
                  }}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label className="form-label">Cost</label>
                <input
                  className="form-control"
                  value={state.cost}
                  type="text"
                  onChange={(e) => {
                    dispatch({
                      type: ACTIONS.SET_COST,
                      payload: Number(e.target.value),
                    })
                    debouncedUpdateStep({
                      _id: idStep,
                      description: state.description,
                      idRole: state.assignedRole,
                      cost: Number(e.target.value),
                    })
                  }}
                ></input>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <span className="h5">Preconditions</span>
          </div>

          <div className="card-body">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="yes-option-radio-button"
                id="yes-option-radio-button"
                value="yes"
                onChange={(e) => {
                  setHasPreconditionsOption(e.target.value)
                }}
                checked={hasPreconditionsOption == 'yes'}
              ></input>
              <label className="form-check-label" for="yes-option-radio-button">
                Yes
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="no-option-radio-button"
                id="no-option-radio-button"
                checked={hasPreconditionsOption == 'no'}
                value="no"
                onChange={(e) => {
                  setHasPreconditionsOption(e.target.value)
                }}
              ></input>
              <label className="form-check-label" for="no-option-radio-button">
                No
              </label>
            </div>
            {hasPreconditionsOption == 'yes' && (
              <div className="card mt-4">
                <Precondition
                  idStep={idStep}
                  idCaseModel={idCaseModel}
                  idTactic={idTactic}
                ></Precondition>
              </div>
            )}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <span className="h5">Post-Conditions:</span>
          </div>

          <PostCondition
            idStep={idStep}
            idCaseModel={idCaseModel}
            idTactic={idTactic}
            modifiedAttributeObjectId={modifiedAttributeObjectId}
          ></PostCondition>
        </div>
      </div>
    </>
  )
}
