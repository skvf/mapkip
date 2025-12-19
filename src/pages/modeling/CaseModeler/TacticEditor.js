import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiEdit, FiTrash } from 'react-icons/fi'
import useSWR from 'swr'

import Goal from '../../../components/Goal'
import Header from '../../../components/Header'
import Metric from '../../../components/Metric'
import Precondition from '../../../components/Precondition'

// To get the ID of the tactic
async function getTacticById(url, id) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: id,
    }),
  })

  return await request.json()
}

// get Task of the tactic

async function getTasksByTacticId(url, idTactic) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idTactic,
    }),
  })

  return await request.json()
}

// get Step of the tactic

async function getStepsByTacticId(url, idTactic) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idTactic: idTactic,
    }),
  })

  return await request.json()
}

// function that call a function after some time(delay)
const debounce = (fn, delay) => {
  let timeout = -1

  return (...args) => {
    if (timeout !== -1) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(fn, delay, ...args)
  }
}

export default function Tactic(props) {
  const [tacticName, setTacticName] = useState('')
  const [tacticDescription, setTacticDescription] = useState('')
  const [idCaseModel, setIdCaseModel] = useState(null)
  const [caseModelName, setCaseModelName] = useState('')
  const [lastUpdated, setLastUpdated] = useState(0)
  const [isSaved, setIsSaved] = useState(true)

  const [metricList, setMetricList] = useState([])
  //useRouter returns the router, an object that contains
  const router = useRouter()

  // router.query returns the  dynamic route parameter of the idRole
  const { idTactic } = router.query

  // get the tactic information (name, description) or an error
  const { data: tactic, error } = useSWR(['/api/tactic/retrieve', idTactic], getTacticById)

  // get tasks of the tactic (names)

  const { data: tasks } = useSWR(['/api/task/all', idTactic], getTasksByTacticId)

  // get steps of the tactic (names)

  const { data: steps } = useSWR(['/api/step/all', idTactic], getStepsByTacticId)

  // set in the interface the artifact information
  useEffect(() => {
    if (tactic) {
      setTacticName(tactic.name)
      setTacticDescription(tactic.description)
      setCaseModelName(tactic.caseModel.name)
      setIdCaseModel(tactic.idCaseModel)
      setLastUpdated(tactic.updatedAt)
      setIsSaved(true)
    }
  }, [tactic])

  // send the update data to the API for saving changes
  async function updateTactic(tactic) {
    const request = await fetch('/api/tactic/edit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tactic),
    })

    return await request.json()
  }

  // event that sends updates after 750ms
  //useMemo save in cache the results of calculation
  const dispatchChangesToApi = useMemo(() => {
    return debounce((editTactic) => {
      updateTactic(editTactic)
      setIsSaved(true)
    }, 750)
  }, [])

  // função da interface

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%

  /**
   * delete task by Id
   *
   * @param {String} idTask
   * @returns
   */
  async function deleteTaskById(idTask) {
    const request = await fetch(`/api/task/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idTask,
      }),
    })

    await request.json()

    router.reload()
  }

  /**
   * delete step of tactic by Id
   *
   * @param {String} idStep
   * @returns
   */
  async function deleteStepById(idStep) {
    const request = await fetch(`/api/step/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idStep,
      }),
    })

    await request.json()

    router.reload()
  }

  // function for adding task

  async function addTaskButtonClickHandler(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/task/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idTactic: idTactic }),
    })

    // retuns the id of the task
    const newTask = await data.json()
    // acknowledged is confirmation of success
    if (newTask.acknowledged) {
      // redirect
      router.push('/modeling/CaseModeler/TaskEditor?idTask=' + newTask.insertedId)
    }
  }

  // function for adding a step
  const addStepButtonClickHandler = async (e) => {
    e.preventDefault()

    // call api to create a new step
    const response = await fetch(`/api/step/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idTactic: idTactic }),
    })

    const data = await response.json()

    // redirect to step editor if successful
    if (data.acknowledged) {
      router.push(`/modeling/CaseModeler/StepEditor?idStep=${data.insertedId}`)
    } else {
      alert('Error creating step')
    }
  }

  return (
    <>
      <Head>
        <title>Tactic Editor</title>
      </Head>
      <Header env="modeling"> </Header>
      <div className="container my-4">
        <h2>Tactic Editor</h2>
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
            <li class="breadcrumb-item">
              <Link href={`/modeling/CaseModeler/${idCaseModel}`}>
                <a>Case Model: {caseModelName}</a>
              </Link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Tactic: {tacticName}
            </li>
          </ol>
        </nav>
        <div className="card mb-4">
          <div className="card-body">
            <div className="form-group mb-4">
              <label>Name of the Tactic</label>
              <input
                className="form-control"
                placeholder="Name of the Tactic"
                value={tacticName}
                onChange={(e) => {
                  setTacticName(e.target.value)
                  dispatchChangesToApi({
                    _id: idTactic,
                    name: e.target.value,
                    description: tacticDescription,
                  })
                }}
              ></input>
            </div>

            <div className="form-group mb-4">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Description of the Tactic"
                value={tacticDescription}
                onChange={(e) => {
                  setTacticDescription(e.target.value)
                  dispatchChangesToApi({
                    _id: idTactic,
                    name: tacticName,
                    description: e.target.value,
                  })
                }}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <Metric idTactic={idTactic} />
        </div>

        <div className="card mb-4">
          <Goal idTactic={idTactic} idCaseModel={idCaseModel}></Goal>
        </div>

        <div className="card mb-4">
          <Precondition idTactic={idTactic} idCaseModel={idCaseModel}></Precondition>
        </div>
        <div className="card mb-4">
          <div className="card-header">
            <span className="h5">Activities</span>
          </div>
          <div className="card-body">
            <div className="d-flex gap-2 mb-4">
              <button
                className="btn btn-primary"
                onClick={(e) => addStepButtonClickHandler(e)}
                data-testid="btn-add-step"
              >
                Add a Step
              </button>

              <button className="btn btn-primary" onClick={addTaskButtonClickHandler}>
                Add a Task
              </button>
            </div>

            <div>
              <div className="card mb-4">
                <div className="card-header">
                  <span className="card-title h6">Steps</span>
                </div>
                <div className="card-body">
                  {
                    // if there are no steps, show a warning
                    steps && steps.length === 0 && (
                      <div className="alert alert-warning">
                        <div className="d-flex gap-2 align-items-center">
                          <FiAlertTriangle></FiAlertTriangle>
                          <span>There are no steps for this tactic</span>
                        </div>
                      </div>
                    )
                  }

                  {steps &&
                    steps.map((step) => (
                      <>
                        <div
                          className="d-flex justify-content-between border-bottom py-2"
                          key={step._id}
                        >
                          <span>{step.description}</span>
                          <div className="d-flex gap-2">
                            <Link href={'/modeling/CaseModeler/StepEditor?idStep=' + step._id}>
                              <a className="btn btn-outline-primary btn-sm">
                                <FiEdit></FiEdit>
                                <span>edit</span>
                              </a>
                            </Link>

                            <div
                              className="btn btn-outline-danger btn-sm"
                              onClick={(e) => deleteStepById(step._id)}
                            >
                              <FiTrash></FiTrash>
                              <span>delete</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                </div>
              </div>
            </div>

            <div>
              <div className="card mb-4">
                <div className="card-header">
                  <span className="card-title h6">Tasks</span>
                </div>
                <div className="card-body">
                  {tasks && tasks.length === 0 && (
                    <div className="alert alert-warning">
                      <div className="d-flex gap-2 align-items-center">
                        <FiAlertTriangle></FiAlertTriangle>
                        <span>There are no tasks for this tactic</span>
                      </div>
                    </div>
                  )}

                  {tasks &&
                    tasks.map((task) => (
                      <div
                        className="d-flex justify-content-between border-bottom py-2"
                        key={task._id}
                      >
                        <p>{task.name}</p>
                        <div className="d-flex gap-2">
                          <Link href={'/modeling/CaseModeler/TaskEditor?idTask=' + task._id}>
                            <a className="btn btn-outline-primary btn-sm">
                              <FiEdit></FiEdit>
                              edit
                            </a>
                          </Link>

                          <div
                            className="btn btn-outline-danger btn-sm"
                            onClick={(e) => deleteTaskById(task._id)}
                          >
                            <FiTrash></FiTrash>
                            delete
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
