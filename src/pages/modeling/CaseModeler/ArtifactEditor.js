import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

import Header from '../../../components/Header'
import ItensArtifact from '../../../components/ItensArtifact'

// To get the ID of the artifact
async function getArtifactById(url, id) {
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

export default function Artifact(props) {
  const [itemList, setItemList] = useState([])

  //variables of the artifact
  const [artifactName, setArtifactName] = useState('')
  const [artifactDescription, setArtifactDescription] = useState('')
  const [artifactType, setArtifactType] = useState('')
  const [lastUpdated, setLastUpdated] = useState(0)
  const [isSaved, setIsSaved] = useState(true)
  const [isMandatory, setIsMandatory] = useState(false)

  //useRouter returns the router, an object that contains
  const router = useRouter()

  // router.query returns the  dynamic route parameter of the idArtifact
  const { idArtifact } = router.query

  // get the artifact information (name, description) or an error
  const { data: artifact, error } = useSWR(['/api/artifact/retrieve', idArtifact], getArtifactById)

  // set in the interface the artifact information
  useEffect(() => {
    if (artifact) {
      setArtifactName(artifact.name)
      setArtifactDescription(artifact.description)
      setArtifactType(artifact.type)
      setLastUpdated(artifact.updatedAt)
      setIsSaved(true)
      setIsMandatory(artifact.mandatory || false)
    }
  }, [artifact])

  // send the update data to the API for saving changes
  async function updateArtifact(artifact) {
    const request = await fetch('/api/artifact/edit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artifact),
    })

    return await request.json()
  }

  // event that sends updates after 750ms
  //useMemo save in cache the results of calculation
  const dispatchChangesToApi = useMemo(() => {
    return debounce((editArtifact) => {
      updateArtifact(editArtifact)
      setIsSaved(true)
    }, 750)
  }, [])

  // função da interface

  return (
    <>
      <Head>
        <title>Artifact Editor</title>
      </Head>
      <Header env="modeling"> </Header>
      <main className="container mt-4 mb-4">
        <h2>Artifact Editor</h2>
        {artifact && (
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
                <Link href={`/modeling/CaseModeler/${artifact.caseModel._id}`}>
                  <a>Case Model: {artifact.caseModel.name}</a>
                </Link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Artifact: {artifactName}
              </li>
            </ol>
          </nav>
        )}

        <div className="card mb-4">
          <div className="card-body">
            <div class="form-group mb-4">
              <label>Name of the Artifact</label>
              <input
                placeholder="Name of the Artifact"
                class="form-control"
                value={artifactName}
                onChange={(e) => {
                  setIsSaved(false)
                  setArtifactName(e.target.value)
                  dispatchChangesToApi({
                    _id: idArtifact,
                    name: e.target.value,
                    description: artifactDescription,
                    type: artifactType,
                    mandatory: isMandatory,
                  })
                }}
              ></input>
            </div>
            <div className="form-group mb-4">
              <label>Description of the Artifact</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Description of the Artifact"
                value={artifactDescription}
                onChange={(e) => {
                  setIsSaved(false)
                  setArtifactDescription(e.target.value)
                  dispatchChangesToApi({
                    _id: idArtifact,
                    name: artifactName,
                    description: e.target.value,
                    type: artifactType,
                    mandatory: isMandatory,
                  })
                }}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Type of the Artifact</label>
              <select
                className="form-control form-select"
                id="Type"
                value={artifactType}
                onChange={(e) => {
                  setIsSaved(false)
                  setArtifactType(e.target.value)
                  dispatchChangesToApi({
                    _id: idArtifact,
                    name: artifactName,
                    description: artifactDescription,
                    type: e.target.value,
                    mandatory: isMandatory,
                  })
                }}
              >
                <option value="environment">Environment</option>
                <option value="context">Context</option>
              </select>
            </div>
            <div className="d-flex justify-content-between mt-4 mb-4">
              <div className="form-check cursor-pointer">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={isMandatory}
                  id="checkChecked"
                  checked={isMandatory}
                  onChange={(e) => {
                    setIsSaved(false)
                    setIsMandatory(e.target.checked)
                    dispatchChangesToApi({
                      _id: idArtifact,
                      name: artifactName,
                      description: artifactDescription,
                      type: artifactType,
                      mandatory: e.target.checked,
                    })
                  }}
                />
                <label className="form-check-label" htmlFor="checkChecked">
                  Mandatory Artifact. It means that all attributes of this artifact must be filled
                  before completing the case.
                </label>
              </div>
            </div>
            <div>
              <p>{isSaved ? 'Changes saved' : 'Draft'}</p>
            </div>
          </div>
        </div>
        <ItensArtifact idArtifact={idArtifact} />
      </main>
    </>
  )
}
