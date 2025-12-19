import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useMemo, useState } from 'react'
import { FiEdit, FiTrash } from 'react-icons/fi'
import useSWR from 'swr'

import Header from '../../../components/Header'
import Step from '../../../components/Step'
import { ToastContext } from '../../../components/Toast'
import styles from './styles.module.scss'

// To get the ID of the tactic
async function getTaskById(url, id) {
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

// get Step of the task

async function getStepsByTaskId(url, idTask) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idTask: idTask,
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

export default function TaskEditor(props) {
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [idCaseModel, setIdCaseModel] = useState(null)
  const [caseModelName, setCaseModelName] = useState('')
  const [lastUpdated, setLastUpdated] = useState(0)
  const [isSaved, setIsSaved] = useState(true)

  const [stepList, setStepList] = useState([])
  const { dispatchToast } = useContext(ToastContext)

  // %%%%%%%%%%%%%%

  //useRouter returns the router, an object that contains
  const router = useRouter()

  // router.query returns the  dynamic route parameter of the idRole
  const { idTask } = router.query

  // get the artifact information (name, description) or an error
  const { data: task, error } = useSWR(['/api/task/retrieve', idTask], getTaskById)

  // get steps of the tactic (names)

  const { data: listSteps } = useSWR(['/api/step/allStepFromTask', idTask], getStepsByTaskId)

  // set in the interface the artifact information
  useEffect(() => {
    if (task) {
      setTaskName(task.name)
      setTaskDescription(task.description)
      // setCaseModelName(task.caseModel.name);
      setIdCaseModel(task.idCaseModel)
      setLastUpdated(task.updatedAt)
      setIsSaved(true)
    }
  }, [task])

  // send the update data to the API for saving changes
  async function updateTask(task) {
    const request = await fetch('/api/task/edit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })

    return await request.json()
  }

  // event that sends updates after 750ms
  //useMemo save in cache the results of calculation
  const dispatchChangesToApi = useMemo(() => {
    return debounce((editTask) => {
      updateTask(editTask)
      setIsSaved(true)
    }, 750)
  }, [])

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

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%

  async function addNewStep(e) {
    e.preventDefault()

    // call api to add new step
    const response = await fetch('/api/step/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idTask: idTask,
      }),
    })
    const data = await response.json()

    if (data.acknowledged === false) {
      dispatchToast('error', 'Error adding step')
    } else {
      dispatchToast(
        'success',
        "Step added successfully. You we'll be redirected to the step editor."
      )

      // wait for 2 seconds
      router.push(`/modeling/CaseModeler/StepEditor?idStep=${data.insertedId}`)
    }
  }

  return (
    <>
      <Head>
        <title>Task Editor</title>
      </Head>
      <Header env="modeling"> </Header>
      <main className="container my-4">
        <h2>Task Editor</h2>
        {task && (
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
                <Link href={`/modeling/CaseModeler/${task.tactic.idCaseModel}`}>
                  <a>Case Model: {task.caseModel.name} </a>
                </Link>
              </li>
              <li class="breadcrumb-item">
                <Link href={`/modeling/CaseModeler/TacticEditor?idTactic=${task.tactic._id}`}>
                  <a>Tactic: {task.tactic.name} </a>
                </Link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Task: {taskName}
              </li>
            </ol>
          </nav>
        )}
        <div className="card mb-4">
          <div className="card-body">
            <div className="form-group mb-4">
              <label>Name of the task:</label>
              <input
                className="form-control"
                placeholder="Name of the Task"
                value={taskName}
                onChange={(e) => {
                  setTaskName(e.target.value)
                  dispatchChangesToApi({
                    _id: idTask,
                    name: e.target.value,
                    description: taskDescription,
                  })
                }}
              ></input>
            </div>
            <div className="form-group mb-4">
              <label>Description:</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Description of the Task"
                value={taskDescription}
                onChange={(e) => {
                  setTaskDescription(e.target.value)
                  dispatchChangesToApi({
                    _id: idTask,
                    name: taskName,
                    description: e.target.value,
                  })
                }}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="h5">List of Steps of the Task</span>
          </div>
          <div className="card-body">
            <div className={styles.lista}>
              {
                // if listSteps is empty, show message
                listSteps && listSteps.length === 0 && (
                  <div className="alert alert-warning" role="alert">
                    No steps found
                  </div>
                )
              }
              {listSteps &&
                listSteps.map((step) => (
                  <>
                    <div>
                      <p>{step.description}</p>
                      <div className={styles.actions}>
                        <div>
                          <FiEdit size={20} color="#ffb800"></FiEdit>
                          <span>
                            <Link href={'/modeling/CaseModeler/StepEditor?idStep=' + step._id}>
                              edit
                            </Link>
                          </span>
                        </div>

                        <div onClick={(e) => deleteStepById(step._id)}>
                          <FiTrash size={20} color="#ff3636"></FiTrash>
                          <span>delete</span>
                        </div>
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </div>

          <div className="card-footer">
            <button type="submit" className="btn btn-primary" onClick={addNewStep}>
              Add Step
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
