import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import useSWR from 'swr'
import Header from '../../components/Header'
import Loading from '../../components/Loading'

export default function Runtime(props) {
  const [caseModels, setCaseModels] = useState([])
  const [caseModelId, setCaseModelId] = useState(null)
  const [headers, setHeaders] = useState(['Case Name', 'Running instances'])

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState(null)

  const router = useRouter()
  const fetcher = (url) => fetch(url).then((res) => res.json())

  // call api to get case model using useSWR
  const { data: caseModelsData, error: caseModelsError } = useSWR('/api/caseModel/all', fetcher)

  useEffect(() => {
    if (caseModelsData) {
      setCaseModels(caseModelsData)
      setCaseModelId(caseModelsData[0]?._id || null)
    }
    if (caseModelsError) {
      console.error(caseModelsError)
    }
  }, [caseModelsData, caseModelsError])

  // call api to get running instances

  const { data, error } = useSWR('/api/caseModel/runningInstances', fetcher)

  useEffect(() => {
    setLoading(!data && !error)
    if (data) {
      const rows = data.map((row) => ({
        id: row.caseModel?._id || row._id || row.caseModel?.id || row.caseModel?.name,
        name: row.caseModel?.name,
        count: row.count,
      }))
      setRows(rows)
    }
    if (error) {
      console.error(error)
    }
  }, [data, error])

  function searchCaseModel() {
    const rowsFiltered = caseModelsData.filter((r) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setRows(rowsFiltered)
  }

  return (
    <>
      <Header env="runtime"> </Header>
      <div className="container">
        <div className="mt-4">
          <h1 className="h2">Instance Manager </h1>
          <div className="row py-3">
            <div className="col">
              <input
                className="form-control"
                type="text"
                placeholder="write the name of the Case model that you are searching"
                value={searchQuery}
                onChange={(e) => {
                  e.preventDefault()
                  setSearchQuery(e.target.value)
                }}
              ></input>
            </div>
            <div className="col-auto d-flex justify-content-between gap-4">
              <div
                className="btn btn-outline-primary d-flex align-items-center gap-1"
                onClick={(e) => searchCaseModel()}
              >
                <FiSearch size={18} /> Search
              </div>
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-1"
                data-bs-toggle="modal"
                data-bs-target="#createInstanceModal"
              >
                <FiPlus size={18} />
                Create a new Instance
              </button>
            </div>
          </div>

          <div
            className="modal fade"
            id="createInstanceModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    Create New Instance
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <h6>Which case model you would like to instanciate?</h6>
                  {caseModels &&
                    caseModels.map((caseModel) => {
                      return (
                        <div key={caseModel._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="flexRadioDefault"
                            id={'flexRadioDefault' + caseModel._id}
                            onChange={() => setCaseModelId(caseModel._id)}
                            checked={caseModelId === caseModel._id}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={'flexRadioDefault' + caseModel._id}
                          >
                            {caseModel.name}
                          </label>
                        </div>
                      )
                    })}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#createInstanceModal"
                    onClick={() => {
                      fetch('/api/runningInstance/create', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ idCaseModel: caseModelId }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          console.log(data)
                          router.push('/runTime/Instance/' + data.insertedId + '/update')
                        })
                        .catch((err) => {
                          console.log(err)
                        })
                    }}
                  >
                    Create instance of{" '"}
                    {caseModels?.filter((c) => c._id === caseModelId)[0]?.name}
                    {"'"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <Loading message="Loading running instances..." />
        ) : (
          <>
            <p>
              {rows.reduce((acc, row) => acc + row.count, 0)} running instances found in{' '}
              {rows.length} case models
            </p>
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  rows &&
                  rows.map((row) => {
                    return (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.count}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  )
}
