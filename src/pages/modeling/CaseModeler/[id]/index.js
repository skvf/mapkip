import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { FiEdit, FiInfo, FiTrash } from 'react-icons/fi'
import useSWR from 'swr'

import Header from '../../../../components/Header'
import Loading from '../../../../components/Loading'

// To get the case Model
async function getCaseModelById(url, id) {
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

// To get artifacts of a case model
async function getArtifactsByCaseModelId(url, idCaseModel) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idCaseModel,
    }),
  })

  return await request.json()
}

// To get tactic of a case model
async function getTacticsByCaseModelId(url, idCaseModel) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idCaseModel,
    }),
  })

  return await request.json()
}

// To get Roles of a case model
async function getRolesByCaseModelId(url, idCaseModel) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idCaseModel,
    }),
  })

  return await request.json()
}

// To get Events of a case model
async function getEventsByCaseModelId(url, idCaseModel) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idCaseModel,
    }),
  })
  return await request.json()
}

// function that call a function after some time(delay) =>function to update
const debounce = (fn, delay) => {
  let timeout = -1

  return (...args) => {
    if (timeout !== -1) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(fn, delay, ...args)
  }
}

function ArtifactItem({ artifact, onDelete }) {
  return (
    <div className="row justify-content-between border-bottom mb-2">
      <div className="col">
        <p>{artifact.name}</p>
      </div>
      <div className="col col-auto">
        <Link href={'/modeling/CaseModeler/ArtifactEditor?idArtifact=' + artifact._id}>
          <div className="btn btn-outline-primary btn-sm me-2">
            <FiEdit></FiEdit>
            <span>edit</span>
          </div>
        </Link>

        <div className="btn btn-outline-danger btn-sm" onClick={(e) => onDelete(artifact._id)}>
          <FiTrash></FiTrash>
          <span>delete</span>
        </div>
      </div>
    </div>
  )
}

export default function CaseModeler(props) {
  const [caseModelName, setCaseModelName] = useState('')
  const [caseModelDescription, setCaseModelDescription] = useState('')
  const [lastUpdated, setLastUpdated] = useState(0)
  const [isSaved, setIsSaved] = useState(true)

  //useRouter returns the router, an object that contains
  const router = useRouter()

  // router.query returns the  dynamic route parameter
  // id: caseModelID rename the id
  const { id: idCaseModel } = router.query

  // get the case  information (name, description) or an error
  const { data: caseModel, error } = useSWR(
    ['/api/caseModel/retrieve', idCaseModel],
    getCaseModelById
  )

  // get case model context artifacts (names)

  const { data: contextArtifacts } = useSWR(
    ['/api/artifact/allContextArtifacts', idCaseModel],
    getArtifactsByCaseModelId
  )

  // get case model enviroment artifacts (names)

  const { data: environmentArtifacts } = useSWR(
    ['/api/artifact/allEnvironmentArtifacts', idCaseModel],
    getArtifactsByCaseModelId
  )

  // get Tactics of the case model (names)
  const { data: tactics } = useSWR(['/api/tactic/all', idCaseModel], getTacticsByCaseModelId)

  // get Roles of the case model (names)
  const { data: roles } = useSWR(['/api/role/all', idCaseModel], getRolesByCaseModelId)

  // get Events of the case model (names)
  const { data: events } = useSWR(['/api/event/all', idCaseModel], getEventsByCaseModelId)

  // onInit set states
  // useEffect monitors changes in the defined objects [caseModel] and if it changes execute some callback functions

  // set in the interface the case model information
  useEffect(() => {
    if (caseModel) {
      setCaseModelName(caseModel.name)
      setCaseModelDescription(caseModel.description)
      setLastUpdated(caseModel.updatedAt)
      setIsSaved(true)
    }
  }, [caseModel])

  // send the update data to the API for saving changes
  async function updateCaseModel(cm) {
    const request = await fetch('/api/caseModel/edit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cm),
    })

    return await request.json()
  }

  // event that sends updates after 750ms
  //useMemo save in cache the results of calculation
  const dispatchChangesToApi = useMemo(() => {
    return debounce((q) => {
      updateCaseModel(q)
      setIsSaved(true)
    }, 750)
  }, [])

  /**
   * delete artifact by Id
   *
   * @param {String} idArtifact
   * @returns
   */
  async function deleteArtifactById(idArtifact) {
    const request = await fetch(`/api/artifact/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idArtifact,
      }),
    })

    await request.json()

    router.reload()
  }

  /**
   * delete tactic by Id
   *
   * @param {String} idTactic
   * @returns
   */
  async function deleteTacticById(idTactic) {
    const request = await fetch(`/api/tactic/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idTactic,
      }),
    })

    await request.json()

    router.reload()
  }

  /**
   * delete role by Id
   *
   * @param {String} idRole
   * @returns
   */
  async function deleteRoleById(idRole) {
    const request = await fetch(`/api/role/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idRole,
      }),
    })

    await request.json()

    router.reload()
  }

  /**
   * delete event by Id
   *
   * @param {String} idEvent
   */
  async function deleteEventById(idEvent) {
    const request = await fetch(`/api/event/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idEvent,
      }),
    })

    await request.json()
    router.reload()
  }

  /**
   * create a new artifact
   *
   * @param {String} buttonClick
   * @returns redirecciona
   */
  async function createNewArtifact(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/artifact/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idCaseModel: idCaseModel }),
    })

    // retuns the id of the artifact
    const newArtifact = await data.json()
    // acknowledged is confirmation of success
    if (newArtifact.acknowledged) {
      // redirect
      router.push('/modeling/CaseModeler/ArtifactEditor?idArtifact=' + newArtifact.insertedId)
    }
  }

  // error from retrieving data from the data base
  if (error) return <div>failed to load</div>
  if (!caseModel && !error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loading />
      </div>
    )
  }

  // create a new tactic
  async function createNewTactic(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/tactic/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idCaseModel: idCaseModel }),
    })

    // retuns the id of the tactic
    const newTactic = await data.json()
    // acknowledged is confirmation of success
    if (newTactic.acknowledged) {
      // redirect
      router.push('/modeling/CaseModeler/TacticEditor?idTactic=' + newTactic.insertedId)
    }
  }

  // create a new role
  async function createNewRole(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/role/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idCaseModel: idCaseModel }),
    })

    // retuns the id of the artifact
    const newRole = await data.json()
    // acknowledged is confirmation of success
    if (newRole.acknowledged) {
      // redirect
      router.push('/modeling/CaseModeler/RoleEditor?idRole=' + newRole.insertedId)
    }
  }

  // create a new event
  async function createNewEvent(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/event/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idCaseModel: idCaseModel }),
    })

    // retuns the id of the event
    const newEvent = await data.json()
    // acknowledged is confirmation of success
    if (newEvent.acknowledged) {
      // redirect
      router.push('/modeling/CaseModeler/EventEditor?idEvent=' + newEvent.insertedId)
    }
  }

  return (
    <>
      <Head>
        <title>Case Model Editor</title>
      </Head>
      <Header env="modeling"> </Header>
      <div className="container my-4">
        <h2>Case Model Editor</h2>
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
            <li class="breadcrumb-item active" aria-current="page">
              Case Model Editor
            </li>
          </ol>
        </nav>
        <div className="card mb-4">
          <div className="card-body">
            <div class="form-group mb-4">
              <label>Name of the Case Model</label>
              <input
                type="text"
                placeholder="Name of Case model"
                className="form-control"
                value={caseModelName}
                onChange={(e) => {
                  setIsSaved(false)
                  setCaseModelName(e.target.value)
                  dispatchChangesToApi({
                    _id: idCaseModel,
                    name: e.target.value,
                    description: caseModelDescription,
                  })
                }}
              ></input>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={caseModelDescription}
                onChange={(e) => {
                  setIsSaved(false)
                  setCaseModelDescription(e.target.value)
                  dispatchChangesToApi({
                    _id: idCaseModel,
                    name: caseModelName,
                    description: e.target.value,
                  })
                }}
              ></textarea>
            </div>
            <div>
              <p>{isSaved ? 'Changes saved' : 'Draft'}</p>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div>
            <div className="alert alert-info" role="alert">
              <FiInfo />
              At a minimum, one artifact and one compleate tactic must be created to represent the
              process data and to plan the course of the case instance
            </div>
          </div>
          <div className="d-flex gap-2">
            <div className="btn btn-outline-primary" onClick={createNewRole}>
              Add Roles
            </div>
            <div
              className="btn btn-outline-primary"
              onClick={createNewArtifact}
              data-testid="btn-add-artifacts"
            >
              Add Artifacts
            </div>
            <div
              className="btn btn-outline-primary"
              onClick={createNewTactic}
              data-testid="btn-add-tactics"
            >
              Add Tactics
            </div>
            <div
              className="btn btn-outline-primary"
              onClick={createNewEvent}
              data-testid="btn-add-events"
            >
              Add Events
            </div>
            <Link href={idCaseModel + '/setAttributesStatus'}>
              <a className="btn btn-outline-primary">Set Critical Attributes</a>
            </Link>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title h5">Artifacts</span>
          </div>
          <div className="card-body">
            {/* another card inside */}

            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title h6">Case Context Artifacts</span>
              </div>
              <div className="card-body">
                {contextArtifacts &&
                  contextArtifacts.map((artifact) => (
                    <ArtifactItem
                      key={artifact._id}
                      artifact={artifact}
                      onDelete={deleteArtifactById}
                    />
                  ))}
                {contextArtifacts && contextArtifacts.length === 0 && (
                  <div className="alert alert-warning" role="alert">
                    No context artifacts yet
                  </div>
                )}
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title h6">Case Environment Artifacts</span>
              </div>
              <div className="card-body">
                {environmentArtifacts && (
                  <div>
                    {environmentArtifacts.map((artifact) => (
                      <ArtifactItem
                        key={artifact._id}
                        artifact={artifact}
                        onDelete={deleteArtifactById}
                      />
                    ))}
                  </div>
                )}

                {environmentArtifacts && environmentArtifacts.length === 0 && (
                  <div className="alert alert-warning" role="alert">
                    No environment artifacts yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title h5">Tactics</span>
          </div>
          <div className="card-body">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th scope="col">Tactic Name</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tactics &&
                  tactics.map((tactic) => (
                    <tr key={tactic._id}>
                      <td>{tactic.name}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={'/modeling/CaseModeler/TacticEditor?idTactic=' + tactic._id}>
                            <div className="btn btn-outline-primary btn-sm">
                              <FiEdit></FiEdit>
                              <span>edit</span>
                            </div>
                          </Link>

                          <div
                            className="btn btn-outline-danger btn-sm"
                            onClick={(e) => deleteTacticById(tactic._id)}
                          >
                            <FiTrash></FiTrash>
                            <span>delete </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title h5">Roles</span>
          </div>
          <div className="card-body">
            {
              // if not roles, show alert message
              (!roles || roles.length === 0) && (
                <div className="alert alert-warning" role="alert">
                  No roles yet
                </div>
              )
            }
            {roles && roles.length > 0 && (
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th scope="col">Role Name</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles &&
                    roles.map((role) => (
                      <tr key={role._id}>
                        <td>{role.name}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={'/modeling/CaseModeler/RoleEditor?idRole=' + role._id}>
                              <div className="btn btn-outline-primary btn-sm">
                                <FiEdit></FiEdit>
                                <span>edit</span>
                              </div>
                            </Link>

                            <div
                              className="btn btn-outline-danger btn-sm"
                              onClick={(e) => deleteRoleById(role._id)}
                            >
                              <FiTrash></FiTrash>
                              <span>delete </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="mb-4 card">
          <div className="card-header">
            <span className="card-title h5">Events</span>
          </div>
          <div className="card-body">
            {events && events.length === 0 && (
              <div className="alert alert-warning" role="alert">
                No events yet
              </div>
            )}
            {events && events.length > 0 && (
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th scope="col">Event</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events &&
                    events.map((event) => (
                      <tr key={event._id}>
                        <td>{event.description}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={'/modeling/CaseModeler/EventEditor?idEvent=' + event._id}>
                              <div className="btn btn-outline-primary btn-sm">
                                <FiEdit></FiEdit>
                                <span>edit</span>
                              </div>
                            </Link>

                            <div
                              className="btn btn-outline-danger btn-sm"
                              onClick={(e) => {
                                // confirmation message
                                if (window.confirm('Are you sure you want to delete this event?')) {
                                  deleteEventById(event._id)
                                }
                              }}
                            >
                              <FiTrash></FiTrash>
                              <span>delete </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
