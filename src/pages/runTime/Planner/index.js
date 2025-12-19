import { useRouter } from 'next/router'
import { useEffect, useReducer, useState } from 'react'

import Header from '../../../components/Header'
import Planners from '../../../components/Planners'

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

  useEffect(() => {
    // get running instances
    getInstancesFromApi().then((instances) => {
      dispatch({ type: 'SET_INSTANCES', payload: instances })

      // get unique case models
      const caseModels = instances
        .map((instance) => instance.caseModel)
        .reduce((acc, caseModel) => {
          if (!acc[caseModel._id]) {
            acc[caseModel._id] = caseModel
          }
          return acc
        }, {})

      // get case models
      const caseModelsArray = Object.values(caseModels)
      dispatch({ type: 'SET_CASE_MODELS', payload: caseModelsArray })
    })
  }, [])

  const setSelectedCaseModel = (id) => {
    // filter instances by case model
    const instances = state.instances.filter((instance) => {
      return instance.caseModel._id === id
    })

    dispatch({ type: 'SET_CASE_MODEL_INSTANCES', payload: instances })
  }

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
  }, [router.query, setSelectedCaseModel, setCurrentInstance])

  return (
    <>
      <Header env="runtime" />
      <div className="container">
        <Planners instanceId={router.query.idInstance} />
      </div>
    </>
  )
}
