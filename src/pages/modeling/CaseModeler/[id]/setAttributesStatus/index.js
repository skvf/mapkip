import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useReducer } from 'react'

import Header from '../../../../../components/Header'
import Loading from '../../../../../components/Loading'
import { ToastContext } from '../../../../../components/Toast'

// API call
async function getAttributesFromApi(idCaseModel) {
  const response = await fetch('/api/attribute/allByCaseModel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idCaseModel }),
  })
  const data = await response.json()
  return data
}

async function setCriticalsToApi(attributes) {
  const response = await fetch('/api/attribute/setCriticals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attributes),
  })
  const data = await response.json()
  return data
}

// useReducer initial state
const initialState = {
  attributes: [],
  // key: attribute._id, value: isStatusCritical
  changes: {},
  isLoading: true,
}

// useReducer reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ATTRIBUTES':
      return {
        ...state,
        attributes: action.payload,
      }
    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'ADD_SELECTED_ATTRIBUTE':
      return {
        ...state,
        changes: {
          ...state.changes,
          [action.payload._id]: true,
        },
      }
    case 'REMOVE_SELECTED_ATTRIBUTE':
      return {
        ...state,
        changes: {
          ...state.changes,
          [action.payload._id]: false,
        },
      }
    case 'SAVE_CHANGES':
      console.log('SAVE_CHANGES', state.changes)
      setCriticalsToApi(state.changes)
      return state
    default:
      return state
  }
}

// useReducer hook
const useAttributes = (idCaseModel) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { dispatchToast } = useContext(ToastContext)

  useEffect(() => {
    if (idCaseModel) {
      getAttributesFromApi(idCaseModel).then((data) => {
        setAttributes(data)
      })
    }
  }, [idCaseModel])

  const setAttributes = (attributes) => {
    dispatch({ type: 'SET_ATTRIBUTES', payload: attributes })
    dispatch({ type: 'SET_IS_LOADING', payload: false })
  }

  const addSelectedAttribute = (attribute) => {
    dispatch({ type: 'ADD_SELECTED_ATTRIBUTE', payload: attribute })
    // set change on attributes list
    const attributes = state.attributes.map((attr) => {
      if (attr._id === attribute._id) {
        attr.isStatusCritical = true
      }
      return attr
    })
    dispatch({ type: 'SET_ATTRIBUTES', payload: attributes })
  }

  const removeSelectedAttribute = (attribute) => {
    dispatch({ type: 'REMOVE_SELECTED_ATTRIBUTE', payload: attribute })
    // set change on attributes list
    const attributes = state.attributes.map((attr) => {
      if (attr._id === attribute._id) {
        attr.isStatusCritical = false
      }
      return attr
    })
    dispatch({ type: 'SET_ATTRIBUTES', payload: attributes })
  }

  const saveChanges = () => {
    dispatch({ type: 'SAVE_CHANGES' })
    dispatchToast('success', 'Changes saved successfully!')
  }

  return {
    ...state,
    addSelectedAttribute,
    removeSelectedAttribute,
    saveChanges,
  }
}

// Component
export default function SetAttributesStatus(props) {
  const {
    query: { id: idCaseModel },
  } = useRouter()

  const { attributes, isLoading, addSelectedAttribute, removeSelectedAttribute, saveChanges } =
    useAttributes(idCaseModel)

  return (
    <div>
      <Head>
        <title>Case Model Editor</title>
      </Head>

      <Header env="modeling"> </Header>

      <div className="container">
        <h2>Set Attributes Status</h2>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <Link href="/">
                <a>Home</a>
              </Link>
            </li>
            <li class="breadcrumb-item">
              <Link href="/modeling">
                <a>Modeling</a>
              </Link>
            </li>
            <li class="breadcrumb-item" aria-current="page">
              <Link href={'/modeling/CaseModeler/' + idCaseModel}>
                <a>Case Model Editor</a>
              </Link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Set Attributes Status
            </li>
          </ol>
        </nav>
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Attributes</h5>
            <small>
              <i>
                Select critical attributes. When the value of one of these attributes is outside the
                expected range, a notification will be sent.
              </i>
            </small>
          </div>
          <div className="card-body">
            {isLoading && <Loading />}
            {!isLoading &&
              attributes.map((attribute) => (
                <div key={attribute._id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={attribute.isStatusCritical}
                    id={attribute._id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addSelectedAttribute(attribute)
                      } else {
                        removeSelectedAttribute(attribute)
                      }
                    }}
                    checked={attribute.isStatusCritical}
                  />
                  <label role="button" className="form-check-label" htmlFor={attribute._id}>
                    {attribute.name} ({attribute.code})
                  </label>
                </div>
              ))}
          </div>
          <div className="card-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                saveChanges()
              }}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
