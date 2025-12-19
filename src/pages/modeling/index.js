import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiPlus, FiSearch, FiTrash } from 'react-icons/fi'
import useSWR from 'swr'

import Header from '../../components/Header'

export default function Modeling(props) {
  const [isClickedToCreateNewCaseModel, setIsCreatingNewCaseModel] = useState(false)
  const router = useRouter()

  // To fetch url
  async function caseModelFetcher(url) {
    const request = await fetch(url, {
      method: 'POST', // htto metodo
      headers: {
        Accept: 'application/json', //standard interchange format  (JSON,XML) that it accepts
        'Content-Type': 'application/json', // return a JSON
      },
    })

    return await request.json()
  }

  //To configure the event of requesting all case from api(database) defining the time of requesting

  const { data: cases } = useSWR('/api/caseModel/all', caseModelFetcher, {
    refreshInterval: 1000 * 10,
  })
  const errorGetCaseModel = cases?.error

  /**
   * delete case by Id
   *
   * @param {String} idCaseModel
   * @returns
   */
  async function deleteCaseModelById(idCaseModel) {
    const request = await fetch(`/api/caseModel/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: idCaseModel,
      }),
    })

    await request.json()

    router.reload()
  }

  // create a new case model
  async function createNewCaseModel(e) {
    e.preventDefault()

    setIsCreatingNewCaseModel(true)

    // get the res from the API
    const data = await fetch('/api/caseModel/create', {
      method: 'POST',
    })

    // retuns the id of the case
    const newCaseModel = await data.json()
    // acknowledged is confirmation of success
    if (newCaseModel.acknowledged) {
      // redirect
      router.push('/modeling/CaseModeler/' + newCaseModel.insertedId)
    }
  }

  return (
    <>
      <Head>
        <title>Modeling Editor</title>
      </Head>

      <Header env="modeling"> </Header>

      <div className="container">
        <div className="row" style={{ padding: '2rem 0' }}>
          <div className="col-8">
            <input
              className="form-control"
              type="text"
              placeholder="write the name of the Case model that you are searching"
            ></input>
          </div>
          <div className="col-4 d-flex justify-content-end gap-2">
            <div className="btn btn-primary d-flex align-items-center gap-1">
              <FiSearch /> Search
            </div>
            <div
              className="btn btn-primary d-flex align-items-center gap-1"
              onClick={createNewCaseModel}
              disabled={isClickedToCreateNewCaseModel}
              data-testid="btn-create-new-case-model"
            >
              <FiPlus />
              {isClickedToCreateNewCaseModel ? 'Creating...' : 'Create a new Case Model'}{' '}
            </div>
          </div>
        </div>
      </div>
      <section className="container">
        {errorGetCaseModel && (
          <div className="alert alert-danger" role="alert">
            {errorGetCaseModel}
          </div>
        )}

        <div className="row">
          {!errorGetCaseModel &&
            cases &&
            cases.map((c) => (
              <div key={c._id} className="card m-2" style={{ maxWidth: '25rem' }}>
                <div className="card-body">
                  <h3
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push('/modeling/CaseModeler/' + c._id)}
                  >
                    {c.name} &rarr;
                  </h3>
                  <p>{c.description}</p>

                  <icondelete>
                    <FiTrash
                      style={{ cursor: 'pointer' }}
                      size={20}
                      color="#ff3636"
                      onClick={(e) => deleteCaseModelById(c._id)}
                    ></FiTrash>
                  </icondelete>
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  )
}
