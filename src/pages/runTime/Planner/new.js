import { useRouter } from 'next/router'
import { useCallback, useEffect, useReducer, useState } from 'react'

import useSWR from 'swr'
import Header from '../../../components/Header'
import Loading from '../../../components/Loading'
import Stepper from '../../../components/Stepper'

//API call
async function getInstancesFromApi() {
  const response = await fetch('/api/runningInstance/all?limit=' + 1_000_000, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  return data
}

// reduce initial state
const initialState = {
  caseModels: [],
  instances: [],
  caseModelInstances: [],
  isLoading: true,
}

// reduce reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_CASE_MODELS':
      return {
        ...state,
        caseModels: action.payload,
      }
    case 'SET_INSTANCES':
      return {
        ...state,
        instances: action.payload,
      }
    case 'SET_CASE_MODEL_INSTANCES':
      return {
        ...state,
        caseModelInstances: action.payload,
      }
    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

// reduce hook
const usePageState = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useSWR('/api/caseModel/all', async () => {
    return fetch('/api/caseModel/all')
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: 'SET_CASE_MODELS', payload: data })
        return data
      })
  })

  const setSelectedCaseModel = useCallback((id) => {
    // filter instances by case model
    fetch('/api/runningInstance/all?caseType=' + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: 'SET_CASE_MODEL_INSTANCES', payload: data })
      })
  }, [])

  return { ...state, setSelectedCaseModel }
}

export default function PlannerPage(params) {
  const [currentInstance, setCurrentInstance] = useState(null)

  const router = useRouter()

  const { caseModels, setSelectedCaseModel, caseModelInstances } = usePageState()

  // if idInstance on router params, use it to set currentInstance
  useEffect(() => {
    if (router.query.idInstance) {
      //  get from API
      fetch(`/api/runningInstance/getById?id=${router.query.idInstance}`)
        .then((response) => response.json())
        .then((instance) => {
          setCurrentInstance(instance)
          setSelectedCaseModel(instance.idCaseModel)
        })
    }
  }, [router.query, setSelectedCaseModel])

  return (
    <>
      <Header env="runtime" />
      <div className="container mt-4">
        <h4>Make a Strategic Plan</h4>
        {currentInstance && (
          <h5 className="text-muted">for {currentInstance.alias || 'No alias'}</h5>
        )}
        {!router.query.idInstance && (
          <div className="row gap">
            <div className="col">
              <div className="input-group">
                <span className="input-group-text" id="inputGroup-sizing-default">
                  Select Case Model
                </span>
                <select
                  role="button"
                  className="form-select"
                  aria-label="Default select example"
                  onChange={(e) => {
                    setSelectedCaseModel(e.target.value)
                  }}
                >
                  <option selected>Select a case model</option>
                  {caseModels.map((caseModel) => {
                    return (
                      <option key={caseModel._id} value={caseModel._id}>
                        {caseModel.name}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <div className="col">
              <div className="input-group">
                <span className="input-group-text" id="inputGroup-sizing-default">
                  Select Instance
                </span>
                <select
                  role="button"
                  className="form-select"
                  aria-label="Default select example"
                  onChange={(e) => {
                    const instance = caseModelInstances.find(
                      (instance) => instance._id === e.target.value
                    )
                    setCurrentInstance(instance)
                  }}
                  value={currentInstance?._id}
                  disabled={!caseModelInstances.length}
                >
                  <option selected>Select an instance</option>
                  {caseModelInstances.map((instance) => {
                    return (
                      <option
                        key={instance._id}
                        value={instance._id}
                        selected={instance._id === currentInstance?._id}
                      >
                        i-{instance._id} [{instance.alias || 'No alias'}]
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>
        )}
        {router.query.idInstance && !currentInstance && <Loading />}
        {currentInstance && <Stepper instance={currentInstance} />}
      </div>
    </>
  )
}
