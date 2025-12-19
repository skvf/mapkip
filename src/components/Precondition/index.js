import { useContext, useEffect, useReducer, useState } from 'react'
import { FiAlertTriangle, FiTrash } from 'react-icons/fi'

import Loading from '../Loading'
import { ToastContext } from './../Toast'
import {
  createPreconditionFromApi,
  deletePreconditionFromApi,
  getAttributesFromApi,
  getMetricsFromApi,
  getPreconditionsFromApiByEvent,
  getPreconditionsFromApiByStep,
  getPreconditionsFromApiByTactic,
} from './api'

// reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'add':
      const newList = [...state.list, ...action.payload]
      // remove duplicates
      const uniqueList = newList.filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i)
      // sort by name
      uniqueList.sort((a, b) => a.name.localeCompare(b.name))
      return {
        ...state,
        list: uniqueList,
      }
    case 'selected_item':
      // find the selected item by id
      const selected_item = state.list.find((item) => item._id === action.payload)

      // if selected is boolean, set operator to "="
      const newState = {
        ...state,
        selected_item,
      }

      if (selected_item.type === 'boolean') {
        newState.operator = '='
        newState.isAttrTypeBoolean = true
        newState.value = 1
      } else {
        newState.isAttrTypeBoolean = false
        newState.value = null
      }

      return newState
    case 'set_operator':
      return { ...state, operator: action.payload }
    case 'set_value':
      return { ...state, value: action.payload }
    case 'set_sub_preconditions':
      console.log('Setting sub_preconditions', action.payload)
      return { ...state, sub_preconditions: action.payload }
    default:
      return state
  }
}

export default function Precondition({ idTactic, idCaseModel, idStep, idEvent }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { dispatchToast } = useContext(ToastContext)

  // set the list of attributes and metrics

  useEffect(() => {
    if (idCaseModel) {
      async function getAttributes() {
        const data = await getAttributesFromApi(idCaseModel)
        if (data.length == 0) {
          setError('No attributes found')
          setIsLoading(false)
          return
        }
        // setAttributeId(data[0]._id);
        dispatch({ type: 'add', payload: data })
        dispatch({ type: 'selected_item', payload: data[0]._id })
        setIsLoading(false)
        setError(null)
      }
      getAttributes()
    }
  }, [idCaseModel])

  useEffect(() => {
    if (idTactic) {
      // get Preconditions from api given idTactic
      async function getPreconditions() {
        const data = await getPreconditionsFromApiByTactic(idTactic)
        dispatch({ type: 'set_sub_preconditions', payload: data })
        setIsLoading(false)
        setError(null)
      }

      // ATENÇÃO!!!!
      // SÓ PEGA PRECONDITIONS DE TÁTICAS SE NÃO TIVER IDSTEP
      if (!idStep) getPreconditions()

      //  get metrics from api given idTactic
      async function getMetrics() {
        const data = await getMetricsFromApi(idTactic)
        dispatch({ type: 'add', payload: data })
        setIsLoading(false)
        setError(null)
      }
      getMetrics()
    }
  }, [idTactic, idStep])

  useEffect(() => {
    async function getPreconditionsByEvent() {
      const data = await getPreconditionsFromApiByEvent(idEvent)
      dispatch({ type: 'set_sub_preconditions', payload: data })
      setIsLoading(false)
      setError(null)
    }

    getPreconditionsByEvent()
  }, [idEvent])

  useEffect(() => {
    if (idStep) {
      // get Preconditions from api given idStep
      async function getPreconditions() {
        const data = await getPreconditionsFromApiByStep(idStep)
        dispatch({ type: 'set_sub_preconditions', payload: data })
        setIsLoading(false)
        setError(null)
      }
      getPreconditions()
    }
  }, [idStep])

  // create reduce to store the list of attributes and metrics
  const [store, dispatch] = useReducer(reducer, {
    list: [],
    selected_item_id: null,
    operator: '=',
    isAttrTypeBoolean: false,
    value: null,
    sub_preconditions: [],
  })

  if (isLoading || (!store.list && !error)) {
    return <Loading message="Loading Preconditions" />
  }

  if (store.list.length == 0) {
    return (
      <div
        class="alert alert-primary align-items-center"
        role="alert"
        data-testid="alert-no-attribute"
      >
        <FiAlertTriangle />
        <div>Add attribute of numeric type</div>
      </div>
    )
  }

  /**
   * Call api to create a new Precondition and update the list of Preconditions
   *
   * @param {Event} e click event
   * @returns
   */
  async function savePreconditionButtonHandler(e) {
    e.preventDefault()

    const data = {
      idStep: idStep,
      idEvent: idEvent,
      operator: store.operator,
      value: store.value,
    }

    // ATENÇÃO!!!
    // Envio o idTactic APENAS se não tiver idStep
    if (!idStep) {
      data.idTactic = idTactic
    }

    const selected = store.selected_item

    if (selected.__type__ === 'Attribute') {
      data.idAttribute = selected._id
    } else if (selected.__type__ === 'Metric') {
      data.idMetric = selected._id
    }

    setIsLoading(true)

    const response = await createPreconditionFromApi(data)

    if (response.error) {
      setError(response.error)
      setIsLoading(false)
      return
    }

    if (response.acknowledged) {
      // se enviou idStep tem que atualizar a lista de preconditions do step
      if (idStep) {
        const updatedPreconditions = await getPreconditionsFromApiByStep(idStep)
        dispatch({
          type: 'set_sub_preconditions',
          payload: updatedPreconditions,
        })
      } else if (idTactic) {
        const updatedPreconditions = await getPreconditionsFromApiByTactic(idTactic)

        dispatch({
          type: 'set_sub_preconditions',
          payload: updatedPreconditions,
        })
      } else if (idEvent) {
        const updatedPreconditions = await getPreconditionsFromApiByEvent(idEvent)

        dispatch({
          type: 'set_sub_preconditions',
          payload: updatedPreconditions,
        })
      } else {
        dispatchToast('error', 'No idTactic or idStep or idEvent to update preconditions')
      }

      dispatchToast('success', 'Precondition created')
      setIsLoading(false)
    }
  }

  async function deletePreconditionButtonHandler(e, idPrecondition) {
    e.preventDefault()

    setIsLoading(true)

    const response = await deletePreconditionFromApi(idPrecondition)
    if (response.error) {
      setError(response.error)
      setIsLoading(false)
      return
    }

    if (response.acknowledged && response.deletedCount > 0) {
      let updatedPreconditions = []
      dispatchToast('success', 'Precondition deleted')

      if (idTactic && !idStep) {
        updatedPreconditions = await getPreconditionsFromApiByTactic(idTactic)
      } else if (idStep) {
        updatedPreconditions = await getPreconditionsFromApiByStep(idStep)
      } else if (idEvent) {
        updatedPreconditions = await getPreconditionsFromApiByEvent(idEvent)
      } else {
        dispatchToast('danger', 'No idTactic or idStep to update preconditions')
        // caso de alto acoplamento
      }

      dispatch({
        type: 'set_sub_preconditions',
        payload: updatedPreconditions,
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="card-header">
        <span className="h5">Precondition</span>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-4 mb-4">
          <div className="form-group">
            <label>Attribute</label>
            <select
              className="form-control form-select"
              name="type"
              id="Type"
              defaultValue={store.selected_item?._id}
              disabled={isLoading}
              onChange={(e) => {
                dispatch({ type: 'set_value', payload: null })
                dispatch({ type: 'selected_item', payload: e.target.value })
              }}
            >
              {store.list.map((attr) => (
                <option
                  key={attr._id}
                  value={attr._id}
                  selected={attr._id === store.selected_item?._id}
                >
                  {attr.code}: {attr.name} ({attr.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Operator</label>
            <select
              className="form-control form-select"
              name="type"
              id="Type"
              defaultValue={store.operator}
              onChange={(e) => dispatch({ type: 'set_operator', payload: e.target.value })}
              disabled={store.isAttrTypeBoolean}
            >
              <option value="=" selected={store.operator === '='}>
                equals
              </option>
              <option value="!=" selected={store.operator === '!='}>
                not-equals
              </option>
              <option value="<" selected={store.operator === '<'}>
                less-than
              </option>
              <option value=">" selected={store.operator === '>'}>
                greater-than
              </option>
              <option value="<=" selected={store.operator === '<='}>
                less-than-or-equals
              </option>
              <option value=">=" selected={store.operator === '>='}>
                greater-than-or-equals
              </option>
            </select>
          </div>
          <div className="form-group">
            <label>Value inside the range of the attribute</label>
            {!store.isAttrTypeBoolean && (
              <input
                className="form-control"
                data-testid="input-precondition-value"
                type="number"
                onChange={(e) => {
                  e.preventDefault()
                  dispatch({
                    type: 'set_value',
                    payload: Number(e.target.value),
                  })
                }}
                placeholder={`Normal Range: ${JSON.stringify(
                  store.list.filter((a) => a._id == store.selected_item?._id)[0]
                    ?.normalRangeOfValues
                )}`}
              ></input>
            )}
            {store.isAttrTypeBoolean && (
              <select
                className="form-control form-select"
                defaultValue={store.value}
                onChange={(e) => {
                  dispatch({
                    type: 'set_value',
                    payload: Number(e.target.value),
                  })
                }}
              >
                <option value={1} selected={store.value === 1}>
                  True
                </option>
                <option value={0} selected={store.value === 0}>
                  False
                </option>
              </select>
            )}
          </div>

          <div>
            <button
              className="btn btn-primary"
              type="submit"
              onClick={savePreconditionButtonHandler}
              disabled={!!!store.selected_item?._id || !!!store.operator || store.value === null}
              data-testid="btn-save-precondition"
            >
              Save Precondition
            </button>
          </div>
        </div>

        <div>
          <h6>Preconditions</h6>
          <div>
            {store.sub_preconditions &&
              store.sub_preconditions.length > 0 &&
              store.sub_preconditions.map((precondition, index) => (
                <div
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                  key={precondition._id}
                >
                  <div>
                    {precondition.attribute && precondition.attribute.type === 'boolean' && (
                      <code>
                        {precondition.attribute?.code} {precondition.operator}{' '}
                        {Boolean(precondition.value).toString()}
                      </code>
                    )}
                    {precondition.attribute && precondition.attribute.type !== 'boolean' && (
                      <code data-testid={`precondition-${index}`}>
                        {precondition.attribute?.code} {precondition.operator} {precondition.value}{' '}
                        {precondition.attribute?.unit}
                      </code>
                    )}

                    {precondition.metric && precondition.metric.type === 'boolean' && (
                      <code>
                        {precondition.metric.code} {precondition.operator}{' '}
                        {Boolean(precondition.value).toString()}
                      </code>
                    )}
                    {precondition.metric && precondition.metric.type !== 'boolean' && (
                      <code data-testid={`precondition-${index}`}>
                        {precondition.metric?.code} {precondition.operator} {precondition.value}{' '}
                        {precondition.metric?.unit}
                      </code>
                    )}
                  </div>
                  <div>
                    <button
                      title="Delete"
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => deletePreconditionButtonHandler(e, precondition._id)}
                    >
                      <FiTrash data-testid="btn-delete-precondition" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
