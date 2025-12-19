import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiTrash } from 'react-icons/fi'

import Loading from '../Loading'
import {
  createGoalFromApi,
  deleteGoalFromApi,
  getAttributesFromApi,
  getGoalsFromApi,
  getMetricsFromApi,
} from './api'

export default function Goal({ idTactic, idCaseModel }) {
  const [attributeId, setAttributeId] = useState('')
  const [attributeType, setAttributeType] = useState('') // ["Attribute", "Metric"]
  const [operator, setOperator] = useState('=')
  const [lockOperator, setLockOperator] = useState(false)
  const [value, setValue] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attributeList, setAttributeList] = useState([])

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [errorMetrics, setErrorMetrics] = useState(null)
  const [metricList, setMetricList] = useState([])

  const [subGoalString, setSubGoal] = useState('')
  const [subGoalList, setSubGoalList] = useState([])
  const [subGoalListJson, setSubGoalListJson] = useState([])

  useEffect(() => {
    if (idCaseModel) {
      async function getAttributes() {
        const data = await getAttributesFromApi(idCaseModel)
        if (data.length == 0) {
          setError('No attributes found')
          setIsLoading(false)
          return
        }
        setAttributeId(data[0]._id)
        setAttributeType(data[0].__type__)
        setAttributeList(data)
        setIsLoading(false)
        setError(null)
      }
      getAttributes()
    }
  }, [idCaseModel])

  useEffect(() => {
    if (idTactic) {
      // get goals from api given idTactic
      async function getGoals() {
        const data = await getGoalsFromApi(idTactic)
        setSubGoalListJson(data)
        setIsLoading(false)
        setError(null)
      }
      getGoals()

      // get metrics from api given idTactic
      async function getMetrics() {
        const data = await getMetricsFromApi(idTactic)
        setMetricList(data)
        setIsLoadingMetrics(false)
        setErrorMetrics(null)
      }
      getMetrics()
    }
  }, [idTactic])

  if (isLoading || (!attributeList && !error)) {
    return <Loading message="Loading goals" />
  }

  if (attributeList.length == 0) {
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
   * Call api to create a new goal and update the list of goals
   *
   * @param {Event} e click event
   * @returns
   */
  async function saveGoalButtonHandler(e) {
    e.preventDefault()

    const data = {
      operator: operator,
      value: value,
    }

    if (attributeType === 'Attribute') {
      data.idAttribute = attributeId
    } else if (attributeType === 'Metric') {
      data.idMetric = attributeId
    }

    setIsLoading(true)

    const response = await createGoalFromApi({ ...data, idTactic })

    if (response.error) {
      setError(response.error)
      setIsLoading(false)
      return
    }

    if (response.acknowledged) {
      const updatedGoals = await getGoalsFromApi(idTactic)

      setSubGoalListJson(updatedGoals)
      setIsLoading(false)
    }
  }

  async function deleteGoalButtonHandler(e, idGoal) {
    e.preventDefault()

    setIsLoading(true)

    const response = await deleteGoalFromApi(idGoal)
    if (response.error) {
      setError(response.error)
      setIsLoading(false)
      return
    }

    if (response.acknowledged && response.deletedCount > 0) {
      alert('Goal deleted')
      const updatedGoals = await getGoalsFromApi(idTactic)

      setSubGoalListJson(updatedGoals)
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="card-header">
        <span className="h5">Goal</span>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-4">
          <div className="form-group">
            <label>Attribute/Metric</label>
            <select
              className="form-control form-select"
              name="type"
              id="Type"
              value={`${attributeType}-${attributeId}`}
              disabled={isLoading}
              onChange={(e) => {
                // qual o tipo? Attribute ou Metric?
                console.log(e.target.value)
                const [type, id] = e.target.value.split('-')
                setAttributeType(type)
                setAttributeId(id)

                // se objeto for boolean, operator deve ser "travado" em "="
                if (type === 'Attribute') {
                  const attribute = attributeList.find((a) => a._id === id)
                  if (attribute.type === 'boolean') {
                    setOperator('=')
                    setLockOperator(true)
                    console.log('Attr operador travado em =')
                  } else {
                    setLockOperator(false)
                  }
                } else if (type === 'Metric') {
                  const metric = metricList.find((m) => m._id === id)
                  if (metric.type === 'boolean') {
                    setOperator('=')
                    setLockOperator(true)
                    console.log('Metr operador travado em =')
                  } else {
                    setLockOperator(false)
                  }
                }
              }}
            >
              {[...attributeList, ...metricList].map((attr) => (
                <option key={attr._id} value={`${attr.__type__}-${attr._id}`}>
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
              defaultValue={operator}
              onChange={(e) => setOperator(e.target.value)}
              disabled={lockOperator}
            >
              <option value="=" selected={operator === '='}>
                equals
              </option>
              <option value="!=" selected={operator === '!='}>
                not-equals
              </option>
              <option value="<" selected={operator === '<'}>
                less-than
              </option>
              <option value=">" selected={operator === '>'}>
                greater-than
              </option>
              <option value="<=" selected={operator === '<='}>
                less-than-or-equals
              </option>
              <option value=">=" selected={operator === '>='}>
                greater-than-or-equals
              </option>
            </select>
          </div>
          <div className="form-group">
            <label>Value inside the range of the attribute</label>
            {!lockOperator && (
              <input
                className="form-control"
                defaultValue={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Normal Range: ${JSON.stringify(
                  (attributeList.filter((a) => a._id == attributeId)[0] ||
                    metricList.filter((a) => a._id == attributeId)[0])['normalRangeOfValues']
                )}`}
              ></input>
            )}
            {lockOperator && (
              <select
                className="form-control form-select"
                name="boolSelect"
                id="boolSelect"
                defaultValue={value}
                onChange={(e) => setValue(e.target.value == 'true' ? 1 : 0)}
              >
                <option value={'true'} selected={value === 'true'}>
                  True
                </option>
                <option value={'false'} selected={value === 'false'}>
                  False
                </option>
              </select>
            )}
          </div>

          <div>
            <button
              className="btn btn-primary"
              type="submit"
              onClick={saveGoalButtonHandler}
              disabled={!!!attributeId || !!!operator}
            >
              Save Goal
            </button>
          </div>
        </div>

        <div>
          <h6 className="mt-4">Subgoals</h6>
          <div>
            {subGoalListJson &&
              subGoalListJson.length > 0 &&
              subGoalListJson.map((subGoal, index) => (
                <div
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                  key={subGoal._id}
                >
                  <div>
                    {subGoal.attribute?.unit == 'boolean' && (
                      <code>
                        {subGoal.attribute?.code} {subGoal.operator}{' '}
                        {Boolean(subGoal.value).toString()}
                      </code>
                    )}
                    {subGoal.attribute?.unit !== 'boolean' && (
                      <code>
                        {subGoal.attribute?.code}
                        {subGoal.metric?.code} {subGoal.operator} {subGoal.value}{' '}
                        {subGoal.attribute?.unit}
                        {subGoal.metric?.unit}
                      </code>
                    )}
                  </div>
                  <div>
                    <button
                      title="Delete"
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => deleteGoalButtonHandler(e, subGoal._id)}
                    >
                      <FiTrash />
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
