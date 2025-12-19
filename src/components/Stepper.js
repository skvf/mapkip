import Link from 'next/link'
import { useCallback, useEffect, useReducer, useState } from 'react'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCopy,
  FiCornerDownRight,
  FiDownload,
  FiInfo,
  FiPlay,
  FiSave,
  FiTrash,
} from 'react-icons/fi'

import useSWR from 'swr'
import usePlanner from '../hooks/usePlanner'
import CodeEditor from './CodeEditor'
import Loading from './Loading'

const ACTION = {
  SET_INSTANCE: 0,
  SET_IS_LOADING: 1,
  ADD_ATTRIBUTE: 2,
  REMOVE_ATTRIBUTE: 3,
  SET_GOALS: 4,
  SET_PERCENTAGE_OF_PRECONDITION_SATISFACTION: 5,
  SET_PERCENTAGE_OF_GOAL_SATISFACTION: 6,
  SET_ANALYZE: 7,
  SET_PLAN_ID: 14,
  SET_SELECTED_TACTICS: 8,
  SET_SELECTED_ACTIVITIES: 9,
  SET_UTILITY_FUNCTION: 10,
  RESET: 12,
  DELETE_GOAL: 13,
  SET_FORMULA: 15,
}

const initialState = {
  instance: null,
  isLoading: false,
  selectedAttributes: [],
  goals: [],
  percentageOfPreconditionSatisfaction: 80,
  percentageOfGoalSatisfaction: 80,
  analyze: {
    // [attributeId]: [{TACTIC}]
  },
  selectedTactics: [],
  selectedActivities: [],
  utilityFunction: null,
  values: {
    // [attributeId]: value
  },
  planId: null,
  formula: null,
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter((goal) => goal._id !== action.payload),
      }
    case ACTION.RESET:
      return initialState
    case ACTION.SET_INSTANCE:
      return {
        ...state,
        instance: action.payload,
      }
    case ACTION.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case ACTION.ADD_ATTRIBUTE:
      return {
        ...state,
        selectedAttributes: [...state.selectedAttributes, action.payload],
      }
    case ACTION.REMOVE_ATTRIBUTE:
      return {
        ...state,
        selectedAttributes: state.selectedAttributes.filter(
          (attribute) => attribute._id !== action.payload._id
        ),
      }
    case ACTION.SET_GOALS:
      return {
        ...state,
        goals: [
          ...state.goals,
          {
            attribute: action.payload.attribute,
            operator: action.payload.operator,
            goal: action.payload.goal,
            _id: new Date().getTime(), // temporary id
          },
        ],
      }
    case ACTION.SET_PERCENTAGE_OF_PRECONDITION_SATISFACTION:
      return {
        ...state,
        percentageOfPreconditionSatisfaction: action.payload,
      }
    case ACTION.SET_PERCENTAGE_OF_GOAL_SATISFACTION:
      return {
        ...state,
        percentageOfGoalSatisfaction: action.payload,
      }
    case ACTION.SET_ANALYZE:
      // transform to key value object where key is attributeId
      const analyze = action.payload.reduce((acc, attr) => {
        if (!acc[attr._id]) {
          acc[attr._id] = []
        }
        acc[attr._id] = [...acc[attr._id], ...attr.tactics]
        return acc
      }, {})

      // save values
      const values = action.payload.reduce((acc, attr) => {
        acc[attr._id] = attr.value
        return acc
      }, {})

      return {
        ...state,
        analyze,
        values,
      }
    case ACTION.SET_SELECTED_TACTICS:
      return {
        ...state,
        selectedTactics: action.payload,
      }
    case ACTION.SET_SELECTED_ACTIVITIES:
      return {
        ...state,
        selectedActivities: action.payload,
      }
    case ACTION.SET_UTILITY_FUNCTION:
      return {
        ...state,
        utilityFunction: action.payload,
      }
    case ACTION.SET_PLAN_ID:
      return {
        ...state,
        planId: action.payload,
      }
    case ACTION.SET_FORMULA:
      return {
        ...state,
        formula: action.payload,
      }
    default:
      return state
  }
}

export default function Stepper({ instance }) {
  const [formStep, setFormStep] = useState(0)

  const [state, dispatch] = useReducer(reducer, initialState)

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1)
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1)

  const selectUtilityFunction = useCallback(
    (utilityFunction) => {
      dispatch({
        type: ACTION.SET_UTILITY_FUNCTION,
        payload: utilityFunction,
      })
    },
    [dispatch]
  )

  const selectActivity = (activity, isSelected) => {
    let selectedActivities = []
    if (isSelected) {
      selectedActivities = [...state.selectedActivities, activity]
    } else {
      selectedActivities = state.selectedActivities.filter((a) => a._id !== activity._id)
    }

    dispatch({
      type: ACTION.SET_SELECTED_ACTIVITIES,
      payload: selectedActivities,
    })
  }

  const onSelectedTacitcsChange = (tactic, isSelected) => {
    if (isSelected) {
      dispatch({
        type: ACTION.SET_SELECTED_TACTICS,
        payload: [...state.selectedTactics, tactic],
      })
    } else {
      dispatch({
        type: ACTION.SET_SELECTED_TACTICS,
        payload: state.selectedTactics.filter((t) => t._id !== tactic._id),
      })
    }
  }

  const getTactics = useCallback(async () => {
    // get selected attributes
    const selectedAttributes = state.selectedAttributes
      .map((attribute) => {
        return {
          attribute,
          goal: state.goals.find((g) => g.attribute._id === attribute._id) || { goal: null },
        }
      })
      .map((i) => {
        return {
          ...i,
          tactics: state.analyze[i.attribute._id],
        }
      })

    // group by tactic
    const tactics = selectedAttributes.reduce((acc, attr) => {
      attr.tactics?.forEach((tactic) => {
        if (!acc[tactic._id]) {
          acc[tactic._id] = {
            tactic,
            attributes: [],
          }
        }
        acc[tactic._id].attributes.push({
          attribute: attr.attribute,
          goal: attr.goal,
        })
      })

      return acc
    }, {})

    return Object.values(tactics)
  }, [state])

  const addAttributeCallback = useCallback(
    (attribute) => {
      dispatch({ type: ACTION.ADD_ATTRIBUTE, payload: attribute })
    },
    [dispatch]
  )

  const removeAttributeCallback = useCallback(
    (attribute) => {
      dispatch({ type: ACTION.REMOVE_ATTRIBUTE, payload: attribute })
    },
    [dispatch]
  )

  const setGoalCallback = useCallback(
    (attribute, goal, operator) => {
      dispatch({
        type: ACTION.SET_GOALS,
        payload: { attribute, goal, operator },
      })
    },
    [dispatch]
  )

  const deleteGoalCallback = useCallback(
    (goal_id) => {
      dispatch({
        type: ACTION.DELETE_GOAL,
        payload: goal_id,
      })
    },
    [dispatch]
  )

  const setPercentageOfPreconditionSatisfactionCallback = useCallback(
    (percentage) => {
      dispatch({
        type: ACTION.SET_PERCENTAGE_OF_PRECONDITION_SATISFACTION,
        payload: percentage,
      })
    },
    [dispatch]
  )

  const setPercentageOfGoalSatisfactionCallback = useCallback(
    (percentage) => {
      dispatch({
        type: ACTION.SET_PERCENTAGE_OF_GOAL_SATISFACTION,
        payload: percentage,
      })
    },
    [dispatch]
  )

  const setAnalyzeCallback = useCallback(
    (analyze) => {
      dispatch({
        type: ACTION.SET_ANALYZE,
        payload: analyze,
      })
    },
    [dispatch]
  )

  useEffect(() => {
    if (instance) {
      dispatch({ type: ACTION.RESET })
      dispatch({
        type: ACTION.SET_INSTANCE,
        payload: instance,
      })
      setFormStep(0)
    }
  }, [instance])

  const setPlanId = useCallback(
    (planId) => {
      dispatch({
        type: ACTION.SET_PLAN_ID,
        payload: planId,
      })
    },
    [dispatch]
  )

  const setFormulaCallback = useCallback(
    (formula) => {
      dispatch({
        type: ACTION.SET_FORMULA,
        payload: formula,
      })
    },
    [dispatch]
  )

  return (
    <div className="mt-5">
      <div className="text-center">
        <div className="row">
          <div className="col">
            <StepTitle
              isFinished={formStep > 0}
              number={1}
              isActive={formStep == 0}
              title="Define observable state"
            />
          </div>
          <div className="col">
            <StepTitle
              isFinished={formStep > 1}
              number={2}
              isActive={formStep == 1}
              title="Define the target goal"
            />
          </div>
          <div className="col">
            <StepTitle
              isFinished={formStep > 2}
              number={3}
              isActive={formStep == 2}
              title="Define precision parameters"
            />
          </div>
          <div className="col">
            <StepTitle
              isFinished={formStep > 3}
              number={4}
              isActive={formStep == 3}
              title="Select preferred tactics"
            />
          </div>
          <div className="col">
            <StepTitle
              isFinished={formStep > 4}
              number={5}
              isActive={formStep == 4}
              title="Check availabily of activities"
            />
          </div>
          <div className="col">
            <StepTitle
              isFinished={formStep > 5}
              number={6}
              isActive={formStep == 5}
              title="Define criteria for plan synthesis"
            />
          </div>
          <div className="col">
            <StepTitle
              isFinished={formStep > 6}
              number={7}
              isActive={formStep == 6}
              title="Generate MDP Planning Model"
            />
          </div>
          <div className="col">
            <StepTitle
              isFinished={formStep > 7}
              number={8}
              isActive={formStep == 7}
              title="Synthesize a Plan"
            />
          </div>
        </div>
      </div>

      <div className="card mt-5">
        <div className="card-header">Step {formStep + 1} of 8</div>
        <div className="card-body">
          {formStep == 0 && (
            <ObservableState
              idInstance={instance._id}
              addAttributeCallback={addAttributeCallback}
              removeAttributeCallback={removeAttributeCallback}
              selectedAttributes={state.selectedAttributes}
              setAnalyzeCallback={setAnalyzeCallback}
            />
          )}
          {formStep == 1 && (
            <TargetGoal
              selectedAttributes={state.selectedAttributes}
              setGoalCallback={setGoalCallback}
              deleteGoalCallback={deleteGoalCallback}
              goals={state.goals}
            />
          )}
          {formStep == 2 && (
            <SetPercentage
              setPercentageOfGoalSatisfactionCallback={setPercentageOfGoalSatisfactionCallback}
              setPercentageOfPreconditionSatisfactionCallback={
                setPercentageOfPreconditionSatisfactionCallback
              }
              percentageOfPreconditionSatisfaction={state.percentageOfPreconditionSatisfaction}
              percentageOfGoalSatisfaction={state.percentageOfGoalSatisfaction}
            />
          )}
          {formStep == 3 && (
            <SelectTactics
              getTactics={getTactics}
              onSelectedTacitcsChange={onSelectedTacitcsChange}
            />
          )}
          {formStep == 4 && (
            <CheckAvailabilityActivities
              selectedTactics={state.selectedTactics}
              selectActivity={selectActivity}
            />
          )}
          {formStep == 5 && state.instance && (
            <DefineUtilityFunction
              state={state}
              selectUtilityFunction={selectUtilityFunction}
              setFormulaCallback={setFormulaCallback}
            />
          )}
          {formStep == 6 && <GetMdpFile state={state} onPlanIdChange={setPlanId} />}
          {formStep == 7 && <SynthesizePlan state={state} />}
        </div>
      </div>
      <div className="mt-4">
        <div className="btn-group" role="group" aria-label="Basic example">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => prevFormStep()}
            disabled={formStep == 0}
          >
            <i className="bi bi-arrow-left"></i> Previous
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => nextFormStep()}
            disabled={formStep == 7}
          >
            Next <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

function StepTitle({ isActive, title, number, isFinished }) {
  if (isFinished) {
    return (
      <>
        <p className="text-muted">
          <i className={'fs-3 bi bi-check2'}></i> <br /> {title}
        </p>
      </>
    )
  }
  if (isActive) {
    return (
      <>
        <p className="fw-bolder">
          <i className={'fs-3 bi bi-' + number + '-circle'}></i> <br /> {title}
        </p>
      </>
    )
  }
  return (
    <>
      <p>
        <i className={'fs-3 bi bi-' + number + '-circle'}></i> <br /> {title}
      </p>
    </>
  )
}

function ObservableState({
  idInstance,
  addAttributeCallback,
  removeAttributeCallback,
  selectedAttributes,
  setAnalyzeCallback,
}) {
  const [attributes, setAttributes] = useState([])
  const [attributesValues, setAttributesValues] = useState({})
  const [analyze, setAnalyze] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (idInstance) {
      const fetchAttributes = async () => {
        setIsLoading(true)
        const response = await fetch('/api/runningInstance/form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: idInstance }),
        })
        const data = await response.json()

        const responseAnalyze = await fetch('/api/runningInstance/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: idInstance }),
        })
        const dataAnalyze = await responseAnalyze.json()

        setAttributes(data.caseModel.attributes)
        setAttributesValues(data.values)
        setAnalyze(dataAnalyze.analysis)
        setAnalyzeCallback(dataAnalyze.analysis)
        setIsLoading(false)
      }
      fetchAttributes()
    }
  }, [idInstance, setAnalyzeCallback])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <p className="h5">Define observable state</p>
      <div>
        <div className="alert alert-info" role="alert">
          <FiInfo />
          Identify relevant attributes and issues of the case instance to define the initial state
          to create a strategic plan. The issues represent attributes with undesired or
          unsatisfactory values.
        </div>
        <div className="container-fluid">
          <div className="row">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Select</th>
                  <th scope="col">Name</th>
                  <th scope="col">Code</th>
                  <th scope="col">Critical Attribute</th>
                  <th scope="col">Value</th>
                  <th scope="col">Analysis Result</th>
                </tr>
              </thead>
              <tbody>
                {attributes.map((attribute) => (
                  <tr
                    key={attribute._id}
                    className={!!!attributesValues[attribute._id] ? 'opacity-25' : ''}
                  >
                    <th scope="row">
                      <input
                        role="button"
                        type="checkbox"
                        className="form-check-input"
                        id={attribute._id}
                        disabled={!!!attributesValues[attribute._id]}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addAttributeCallback(attribute)
                          } else {
                            removeAttributeCallback(attribute)
                          }
                        }}
                        checked={
                          !!attributesValues[attribute._id] &&
                          selectedAttributes.find((a) => a._id == attribute._id)
                        }
                      ></input>
                    </th>
                    <td>{attribute.name}</td>
                    <td>{attribute.code}</td>
                    <td>{attribute.isStatusCritical ? 'Yes' : 'No'}</td>
                    <td>
                      {attributesValues[attribute._id]
                        ? attributesValues[attribute._id] + attribute.unit
                        : '-'}
                    </td>
                    <td>
                      {analyze.find((a) => a._id == attribute._id)?.analysis.result ===
                      'abnormal' ? (
                        <>
                          <FiAlertTriangle /> {'Abnormal'}
                        </>
                      ) : (
                        <>
                          <FiCheckCircle /> {'Normal'}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

function TargetGoal({ selectedAttributes, setGoalCallback, goals, deleteGoalCallback }) {
  const [selectedAttribute, setSelectedAttribute] = useState(null)
  const [selectedOperator, setSelectedOperator] = useState('=')
  const [selectedTargetValue, setSelectedTargetValue] = useState(null)

  useEffect(() => {
    if (selectedAttributes.length > 0) {
      setSelectedAttribute(selectedAttributes[0])
    }
  }, [selectedAttributes])

  return (
    <>
      <p className="h5">Define the target goal</p>
      <div className="alert alert-info" role="alert">
        <FiInfo />
        Define target values for the selected attributes in the previous step.
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <span className="h5">Goal</span>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-4">
            <div className="form-group">
              <label>Attribute</label>
              <select
                className="form-control form-select"
                name="type"
                id="Type"
                value={selectedAttribute?._id}
                disabled={false}
                onChange={(e) => {
                  const attribute = selectedAttributes.find((a) => a._id == e.target.value)
                  setSelectedAttribute(attribute)

                  if (attribute?.type === 'boolean') {
                    setSelectedTargetValue(1)
                  }
                }}
              >
                {selectedAttributes.map((attr) => (
                  <option key={attr._id} value={attr._id}>
                    {attr.code}: {attr.name} ({attr.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedAttribute && selectedAttribute.type !== 'boolean' && (
              <div className="form-group">
                <label>Operator</label>
                <select
                  className="form-control form-select"
                  name="type"
                  id="Type"
                  defaultValue={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  disabled={false}
                >
                  <option value="=" selected={selectedOperator === '='}>
                    equals
                  </option>
                  <option value="!=" selected={selectedOperator === '!='}>
                    not-equals
                  </option>
                  <option value="<" selected={selectedOperator === '<'}>
                    less-than
                  </option>
                  <option value=">" selected={selectedOperator === '>'}>
                    greater-than
                  </option>
                  <option value="<=" selected={selectedOperator === '<='}>
                    less-than-or-equals
                  </option>
                  <option value=">=" selected={selectedOperator === '>='}>
                    greater-than-or-equals
                  </option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Value inside the range of the attribute</label>
              {selectedAttribute && selectedAttribute?.type !== 'boolean' && (
                <input
                  className="form-control"
                  onChange={(e) => setSelectedTargetValue(e.target.value)}
                  value={selectedTargetValue}
                  placeholder={`Normal Range: [${selectedAttribute.normalRangeOfValues[0]} .. ${selectedAttribute.normalRangeOfValues[1]}]`}
                ></input>
              )}
              {selectedAttribute && selectedAttribute?.type === 'boolean' && (
                <select
                  className="form-control form-select"
                  name="boolSelect"
                  id="boolSelect"
                  defaultValue={selectedTargetValue}
                  onChange={(e) => setSelectedTargetValue(e.target.value)}
                >
                  <option value={1} selected={selectedTargetValue === 1}>
                    True
                  </option>
                  <option value={0} selected={selectedTargetValue === 0}>
                    False
                  </option>
                </select>
              )}
            </div>

            <div>
              <button
                className="btn btn-primary"
                type="submit"
                onClick={() => {
                  console.log(selectedAttribute, selectedTargetValue, selectedOperator)
                  setGoalCallback(selectedAttribute, selectedTargetValue, selectedOperator)
                }}
                disabled={false}
              >
                Save Goal
              </button>
            </div>
          </div>

          <div>
            <h6 className="mt-4">Goals List</h6>
            <div>
              {goals?.length === 0 && <p>No goals set</p>}
              {goals?.map((g) => (
                <div
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                  key={g._id}
                >
                  <div>
                    {g.attribute.unit !== 'boolean' && (
                      <code>
                        {g.attribute?.code}
                        {g.metric?.code} {g.operator} {g.goal} {g.attribute?.unit}
                        {g.metric?.unit}
                      </code>
                    )}

                    {g.attribute.unit === 'boolean' && (
                      <code>
                        {g.attribute?.code} {g.operator} {g.goal == 1 ? 'True' : 'False'}
                      </code>
                    )}
                  </div>
                  <div>
                    <button title="Delete" className="btn btn-sm btn-outline-danger">
                      <FiTrash onClick={(e) => deleteGoalCallback(g._id)} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SetPercentage({
  setPercentageOfPreconditionSatisfactionCallback,
  setPercentageOfGoalSatisfactionCallback,
  percentageOfPreconditionSatisfaction,
  percentageOfGoalSatisfaction,
}) {
  return (
    <>
      <p className="h5">Define precision parameters</p>

      <div className="alert alert-info" role="alert">
        <FiInfo />
        In order to show relevant tactics, we need that you indicate how strictly the system should
        match tactics to the current context and goal, specify acceptable thresholds for similarity
        in preconditions and completeness of goal fulfillment.
      </div>

      <div className="row mb-4 gap justify-content-between">
        <div className="col-4">
          <label>Percentage of Precondition Similarity </label>
        </div>
        <div className="col-6">
          <input
            type="range"
            className="form-range"
            onChange={(e) => {
              setPercentageOfPreconditionSatisfactionCallback(Number(e.target.value))
            }}
            value={percentageOfPreconditionSatisfaction}
          ></input>
        </div>
        <div className="col">
          <span>{percentageOfPreconditionSatisfaction}%</span>
        </div>
      </div>
      <div className="row mb-4 gap">
        <div className="col-4">
          <label>Percentage of goal fulfillment </label>
        </div>
        <div className="col-6">
          <input
            type="range"
            className="form-range"
            onChange={(e) => {
              setPercentageOfGoalSatisfactionCallback(Number(e.target.value))
            }}
            value={percentageOfGoalSatisfaction}
          ></input>
        </div>
        <div className="col">
          <span>{percentageOfGoalSatisfaction}%</span>
        </div>
      </div>
    </>
  )
}

function SelectTactics({ getTactics, onSelectedTacitcsChange }) {
  const [tactics, setTactics] = useState([])

  useEffect(() => {
    getTactics().then((tactics) => {
      setTactics(tactics)
      console.log(tactics)
    })
  }, [getTactics])

  return (
    <>
      <p className="h5">Select preferred tactics</p>
      <div className="alert alert-info" role="alert">
        <FiInfo />
        According to the defined target goal state and the observable situation, some tactics were
        retrieved from the database. Select which tactics are more suitable for the observable
        situation:
      </div>

      <div>
        {tactics.map((i) => (
          <div key={i.tactic._id} className="form-group form-check">
            <input
              type="checkbox"
              className="form-check-input"
              role="button"
              id={i.tactic._id}
              onChange={(e) => {
                onSelectedTacitcsChange(i.tactic, e.target.checked)
              }}
            ></input>
            <label role="button" className="form-check-label" htmlFor={i.tactic._id}>
              Tactic: {i.tactic.name}.
            </label>
          </div>
        ))}
      </div>
    </>
  )
}

function CheckAvailabilityActivities({ selectedTactics, selectActivity }) {
  const [steps, setSteps] = useState([])
  const [tasks, setTasks] = useState([])
  const [isLoadingSteps, setIsLoadingSteps] = useState(false)

  // call api to get steps
  useEffect(() => {
    const getSteps = async (idTactic) => {
      setIsLoadingSteps(true)
      const response = await fetch(`/api/step/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idTactic }),
      })
      const steps = await response.json()
      setIsLoadingSteps(false)
      return steps
    }
    const getTasks = async (idTactic) => {
      const response = await fetch(`/api/task/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idTactic }),
      })
      const tasks = await response.json()
      return tasks
    }

    if (selectedTactics.length > 0) {
      selectedTactics.forEach((tactic) => {
        getSteps(tactic._id).then((steps) => {
          setSteps((prev) => [...prev, ...steps])
        })
        getTasks(tactic._id).then((tasks) => {
          setTasks((prev) => [...prev, ...tasks])
        })
      })
    }
  }, [selectedTactics])

  return (
    <>
      <h5>Check availabily of activities</h5>
      <div className="alert alert-info" role="alert">
        <FiInfo />
        These are the activities from the selected tactics. Which activities are available to
        perform?
      </div>
      <div>
        {selectedTactics.map((tactic) => (
          <div key={tactic._id} className="mb-4 p-4 border rounded bg-body-tertiary">
            <p className="h6">Tactic: {tactic.name}</p>
            <div>
              {isLoadingSteps && <Loading />}
              {steps
                .filter((step) => step.idTactic === tactic._id)
                .map((step, i) => (
                  <div key={step._id} className="d-flex gap-2 align-items-center">
                    <FiCornerDownRight />
                    <div className="form-group form-check d-flex gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        role="button"
                        id={step._id}
                        onChange={(e) => {
                          selectActivity(step, e.target.checked)
                        }}
                      ></input>
                      <label role="button" className="form-check-label" htmlFor={step._id}>
                        Step {i + 1}: {step.description}.
                      </label>
                    </div>
                  </div>
                ))}
              {tasks
                .filter((task) => task.idTactic === tactic._id)
                .map((task, i) => (
                  <div key={task._id} className="d-flex gap-2 align-items-center">
                    <FiCornerDownRight />
                    <div className="form-group form-check  d-flex gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        role="button"
                        id={task._id}
                        onChange={(e) => {
                          selectActivity(task, e.target.checked)
                        }}
                      ></input>
                      <label role="button" className="form-check-label" htmlFor={task._id}>
                        Task {i + 1}: {task.name}.
                      </label>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function DefineUtilityFunction({ state, selectUtilityFunction, setFormulaCallback }) {
  const [utilityFunctionName, setUtilityFunctionName] = useState('maximizeProbability')
  const [formula, setFormula] = useState('')
  const [selectedVariable, setSelectedVariable] = useState(null)
  const [operator, setOperator] = useState(null)
  const [addFormula, setAddFormula] = useState(false)

  // get attributes from case model using swr
  const { data: attributes } = useSWR(
    ['/api/attribute/allByCaseModel', state.instance.caseModel._id],
    async (url, idCaseModel) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCaseModel }),
      })
      const data = await response.json()
      return data
    }
  )

  const { data: metrics } = useSWR(
    ['/api/metric/allByCaseModel', state.instance.caseModel._id],
    async (url, idCaseModel) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCaseModel }),
      })
      const data = await response.json()
      return data
    }
  )

  useEffect(() => {
    if (!state.utilityFunction && state.goals.length > 0) {
      selectUtilityFunction('maximizeProbability')

      // callback to set utility function in parent
      selectUtilityFunction(translateUtilityFunction())
    }
  }, [state.goals, state.utilityFunction, selectUtilityFunction, translateUtilityFunction])

  const translateUtilityFunction = useCallback(() => {
    const goals = state.goals.map((g) => `${g.attribute.code}${g.operator}${g.goal}`).join('&')

    const dictFunctionNameToStringExpression = {
      maximizeProbability: 'Pmax=? [ F (' + goals + ') ]',
      maximizeCost: 'R{"cost"}max=? [ F (' + goals + ') ]',
      minimizeCost: 'R{"cost"}min=? [ F (' + goals + ') ]',
    }

    return dictFunctionNameToStringExpression[utilityFunctionName]
  }, [state, utilityFunctionName])

  return (
    <>
      <p className="h5">Define criteria for plan synthesis</p>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexCheckDefault"
          onChange={(e) => {
            if (e.target.checked) {
              setUtilityFunctionName('maximizeProbability')
            }
          }}
          checked={utilityFunctionName === 'maximizeProbability'}
        />
        <label className="form-check-label" for="flexCheckDefault" role="button">
          Maximize the probability of reaching the goal state
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexCheckDefault1"
          onChange={(e) => {
            if (e.target.checked) {
              setUtilityFunctionName('maximizeCost')
            }
          }}
          checked={utilityFunctionName === 'maximizeCost'}
        />
        <label className="form-check-label" for="flexCheckDefault1" role="button">
          Maximize the cost
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexCheckDefault2"
          onChange={(e) => {
            if (e.target.checked) {
              setUtilityFunctionName('minimizeCost')
            }
          }}
          checked={utilityFunctionName === 'minimizeCost'}
        />
        <label className="form-check-label" for="flexCheckDefault2" role="button">
          Minimize the cost
        </label>
      </div>
      <div>
        <p className="h5">Formula</p>
        <p>Would you like to add formula to relay model variables?</p>

        {/* checkbox yes or no */}
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckDefault3"
            onChange={(e) => {
              if (e.target.checked) {
                setAddFormula(true)
              }
            }}
            checked={addFormula === true}
          />
          <label className="form-check-label" for="flexCheckDefault3" role="button">
            Yes
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckDefault4"
            onChange={(e) => {
              if (e.target.checked) {
                setAddFormula(false)
              }
            }}
            checked={addFormula === false}
          />
          <label className="form-check-label" for="flexCheckDefault4" role="button">
            No
          </label>
        </div>

        {addFormula && (
          <>
            <div className="d-flex gap-2 mb-2">
              <select
                className="form-select"
                aria-label="Default select example"
                value={selectedVariable}
                onChange={(e) => {
                  setSelectedVariable(e.target.value)
                }}
              >
                <option selected>Select an attribute or metric</option>
                {attributes &&
                  metrics &&
                  // Checkbox list of attributes and metrics
                  attributes.map((attribute) => (
                    <option key={attribute.id} value={attribute.code}>
                      {attribute.code}: {attribute.name} ({attribute.unit})
                    </option>
                  ))}
                {attributes &&
                  metrics &&
                  // Checkbox list of attributes and metrics
                  metrics.map((metric) => (
                    <option key={metric.id} value={metric.code}>
                      {metric.code}: {metric.name} ({metric.unit})
                    </option>
                  ))}
              </select>
              <div
                className="btn btn-primary"
                onClick={() => {
                  const newFormula = formula + selectedVariable
                  setFormula(newFormula)
                  setFormulaCallback(newFormula)
                }}
              >
                Add Variable
              </div>
            </div>
            <div className="d-flex gap-2 mb-2">
              <select
                className="form-select mt-2"
                aria-label="Default select example"
                value={operator}
                onChange={(e) => {
                  setOperator(e.target.value)
                }}
              >
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="*">*</option>
                <option value="/">/</option>
                <option value="(">(</option>
                <option value=")">)</option>
                <option value="=">=</option>
              </select>

              <div
                className="btn btn-primary"
                onClick={() => {
                  const newFormula = formula + operator
                  setFormula(newFormula)
                  setFormulaCallback(newFormula)
                }}
              >
                Add Operator
              </div>
            </div>
            <pre>{formula}</pre>
          </>
        )}
      </div>
    </>
  )
}

function GetMdpFile({ state, onPlanIdChange }) {
  const [isLoadingIntermediateJson, setIsLoadingIntermediateJson] = useState(false)
  const [isSuccessIntermediateJson, setIsSuccessIntermediateJson] = useState(false)
  const [tempJson, setTempJson] = useState(null)

  const [isLoadingMdpFile, setIsLoadingMdpFile] = useState(false)
  const [isMdpFileGenerationSuccessful, setMdpFileGenerationSuccess] = useState(null)
  const [mdpFile, setMdpFile] = useState(null)

  async function getMdpFile(j) {
    setIsLoadingMdpFile(true)
    const response = await fetch('/api/planner/getMdp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(j),
    })
    const data = await response.text()
    setIsLoadingMdpFile(false)
    return data
  }

  useEffect(() => {
    if (isMdpFileGenerationSuccessful === true) {
      return
    }

    async function createJsonFile() {
      const response = await fetch('/api/planner/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      })

      const data = await response.json()

      return data
    }

    setIsLoadingIntermediateJson(true)
    createJsonFile()
      .then((json) => {
        setIsLoadingIntermediateJson(false)
        setIsSuccessIntermediateJson(true)
        setTempJson(json)
        onPlanIdChange(json.id)

        getMdpFile(json)
          .then((d) => {
            setMdpFileGenerationSuccess(true)
            setMdpFile(d)
          })
          .catch((err) => {
            console.error(err)
          })
      })
      .catch((err) => {
        setIsLoadingIntermediateJson(false)
        console.error('Error creating intermediate JSON file: ' + err.message)
      })
  }, [onPlanIdChange, isMdpFileGenerationSuccessful])

  async function updateMdpFile() {
    const response = await fetch('/api/planner/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: tempJson.id,
        mdpText: mdpFile,
      }),
    })

    const data = await response.json()

    if (data.acknowledge) {
      alert('Atualizado!')
    }

    return data
  }

  return (
    <div>
      <h5>Generate the MDP Planning Model</h5>

      <div className="alert alert-info" role="alert">
        <FiInfo /> A file containing the MDP Planning model, expressed in PRISM language, will be
        generated. The Planning model will be configured with the previously set parameters. You can
        edit it or execute it in PRISM.
      </div>

      <h6>Steps</h6>
      <div>
        <p className={`${isSuccessIntermediateJson ? 'text-success' : ''}`}>
          {isLoadingIntermediateJson && (
            <div class="spinner-border spinner-border-sm" role="status"></div>
          )}
          {isSuccessIntermediateJson && <FiCheckCircle />} Generating intermediate files.{' '}
          {isLoadingIntermediateJson && 'This step may take a few seconds. Please wait.'}
          {!isLoadingIntermediateJson && !isSuccessIntermediateJson && ' An error occurred.'}
        </p>
        {isSuccessIntermediateJson && (
          <p className={`${isMdpFileGenerationSuccessful ? 'text-success' : ''}`}>
            {isLoadingMdpFile && <div class="spinner-border spinner-border-sm" role="status"></div>}
            {isMdpFileGenerationSuccessful && <FiCheckCircle />} Generating the MDP file. Please
            wait.
          </p>
        )}
        {isMdpFileGenerationSuccessful && (
          <p>Download the MDP Planning Model. You can use it to run on PRISM.</p>
        )}
      </div>

      {mdpFile && (
        <div className="mt-4">
          <div className="mt-4">
            <h6>Properties (editable)</h6>
            <input
              type="text"
              className="form-control"
              value={tempJson?.Property ?? ''}
              onChange={(e) => setTempJson({ ...tempJson, Property: e.target.value })}
              placeholder="Edit property"
            />
          </div>
          <h5>Editor</h5>
          <h6>MDP file</h6>
          <div className="highlight">
            <pre className="pre border user-select-none">
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => {
                    navigator.clipboard.writeText(mdpFile)
                  }}
                >
                  <FiCopy /> Copy
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => {
                    const blob = new Blob([mdpFile], {
                      type: 'text/plain;charset=utf-8',
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${tempJson.id}.mdp`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                  }}
                >
                  <FiDownload /> Download
                </button>

                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => {
                    updateMdpFile()
                  }}
                >
                  <FiSave /> Save
                </button>
              </div>
              <CodeEditor value={mdpFile} onChangeValue={setMdpFile} />
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

function SynthesizePlan({ state, instance }) {
  const { planner, isLoading, isError } = usePlanner(state.planId)

  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <div className="alert alert-danger">Error loading planner data.</div>
  }

  return (
    <>
      <h5>Synthesize a Plan</h5>
      <div className="alert alert-info" role="alert">
        <FiInfo /> Here you can execute the created MDP Planning Model on PRISM which produce an
        optimal plan based on the selected criteria.
      </div>
      <div className="mb-3">
        <p>
          Selected activities: {state.selectedActivities ? state.selectedActivities.length : 0} ·
          Selected tactics: {state.selectedTactics ? state.selectedTactics.length : 0}
        </p>
        <Link href={`/runTime/Planner/${state.planId}`}>
          <a className="btn btn-primary btn-lg">
            Run on MAPKIP Cloud <FiPlay />
          </a>
        </Link>

        <h6 className="mt-4">Generated Plan</h6>

        <pre>{planner.content.Property}</pre>
        <pre>{planner.mdpText}</pre>
      </div>
    </>
  )
}
