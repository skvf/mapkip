import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { BsDot } from 'react-icons/bs'
import { FiSave } from 'react-icons/fi'
import Header from '../../../../components/Header'
import Loading from '../../../../components/Loading'
import { ToastContext } from '../../../../components/Toast'

export default function InstancePage(props) {
  const [selectedArtifactId, setSelectedArtifactId] = useState(null)
  const [values, setValues] = useState({})
  const [detail, setDetail] = useState({})
  const [status, setStatus] = useState('CREATED')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const router = useRouter()

  const { dispatchToast } = useContext(ToastContext)

  const { id } = router.query

  useEffect(() => {
    if (id) {
      setLoading(true)
      setError(false)

      // call api to get the form
      fetch(`/api/runningInstance/form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setDetail(data)
          setValues(data.values)
          setSelectedArtifactId(data.caseModel.artifacts.context[0]._id)
          setStatus(data.status)
          setLoading(false)
        })
        .catch((err) => {
          console.log(err)
          setError(true)
          setLoading(false)
        })
    }
  }, [id])

  const handleChangeValues = (e) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  const handleSubmitButton = () => {
    const artifacts = [
      ...detail.caseModel.artifacts.context,
      ...detail.caseModel.artifacts.environment,
    ]
    const items = []

    for (const artifact of artifacts) {
      for (const item of artifact.items) {
        for (const attribute of item.attributes) {
          items.push({ _id: attribute._id, mandatory: artifact.mandatory || false })
        }
      }
    }

    // transformar array items em um objeto com os atributos obrigatórios
    const mandatoryAttributes = {}
    items.forEach((item) => {
      if (item.mandatory) {
        mandatoryAttributes[item._id] = true
      }
    })

    // transformar o object mandatoryAttributes em um array de chaves
    const mandatoryAttributesIds = Object.keys(mandatoryAttributes)

    // check if all mandatory attributes are filled
    for (const attrId of mandatoryAttributesIds) {
      if (
        values[attrId] === undefined ||
        values[attrId] === '' ||
        values[attrId] === null ||
        values[attrId] === 0
      ) {
        dispatchToast('danger', 'Please fill all mandatory attributes before submitting the form.')
        return
      }
    }

    // call api to submit the form
    fetch(`/api/runningInstance/updateValues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: id, values, alias: detail.alias }),
    })
      .then((res) => res.json())
      .then((data) => {
        dispatchToast('success', 'Values updated successfully. Flying to Analizr...')
        router.push(`/runTime/Analyzer/${id}`)
      })
      .catch((err) => {
        dispatchToast('danger', 'Error updating values')
        console.log(err)
      })
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return 'error'
  }

  const mapper = {
    CREATED: 'var(--bs-warning)',
    ACTIVE: 'var(--bs-success)',
    SUSPENDED: 'var(--bs-danger)',
    COMPLETED: 'var(--bs-primary)',
    ARCHIVED: 'var(--bs-secondary)',
  }

  return (
    <>
      <Header env="runtime"> </Header>
      <div className="container">
        <div className="mt-4">
          <span className="h1">Case Instance Manager</span>
        </div>
        <div className="mt-4">
          <span>
            {detail.caseModel.name} Instance: <code>i-{id}</code>{' '}
            <div
              className="badge"
              style={{
                backgroundColor: mapper[status],
              }}
            >
              {status}
            </div>
          </span>
        </div>

        <div className="mt-4 row gap-4">
          <div className="col-3">
            <label className="form-label">
              Alias <BsDot />
              <small className="text-muted">Optional instance name</small>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Alias"
              value={detail.alias}
              onChange={(e) => {
                setDetail({ ...detail, alias: e.target.value })
              }}
            />

            <label className="form-label mt-4">Instance Status</label>
            <select
              className="form-select mb-4"
              aria-label="Default select example"
              onChange={(e) => {
                // call api to update status
                fetch(`/api/runningInstance/updateStatus`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ _id: id, status: e.target.value }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    dispatchToast('success', 'Status updated successfully')
                    setStatus(e.target.value)
                  })
                  .catch((err) => {
                    dispatchToast('danger', 'Error updating status')
                    console.log(err)
                  })
              }}
            >
              <option value="CREATED" selected={'CREATED' === status}>
                Created
              </option>
              <option value="ACTIVE" selected={'ACTIVE' === status}>
                Active
              </option>
              <option value="SUSPENDED" selected={'SUSPENDED' === status}>
                Suspended
              </option>
              <option value="COMPLETED" selected={'COMPLETED' === status}>
                Completed
              </option>
              <option value="ARCHIVED" selected={'ARCHIVED' === status}>
                Archived
              </option>
            </select>

            {detail && detail.caseModel.artifacts.context?.length > 0 && (
              <>
                <label className="form-label">Context Artifacts</label>
                <ol className="list-group list-group-numbered mb-4">
                  {detail.caseModel.artifacts.context?.map((artifact) => (
                    <li
                      className={
                        'list-group-item list-group-item-action  ' +
                        (selectedArtifactId === artifact._id ? 'active' : '')
                      }
                      role="button"
                      aria-current="true"
                      key={artifact._id}
                      onClick={() => setSelectedArtifactId(artifact._id)}
                    >
                      {artifact.name} {artifact.mandatory ? '(mandatory)' : ''}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {detail && detail.caseModel.artifacts.environment?.length > 0 && (
              <>
                <label className="form-label">Environment Artifacts</label>
                <ol className="list-group list-group-numbered mb-4">
                  {detail.caseModel.artifacts.environment?.map((artifact) => (
                    <li
                      className={
                        'list-group-item list-group-item-action  ' +
                        (selectedArtifactId === artifact._id ? 'active' : '')
                      }
                      role="button"
                      aria-current="true"
                      key={artifact._id}
                      onClick={() => setSelectedArtifactId(artifact._id)}
                    >
                      {artifact.name} {artifact.mandatory ? '(mandatory)' : ''}
                    </li>
                  ))}
                </ol>
              </>
            )}

            <div className="d-grid gap-2">
              <div role="button" className="btn btn-primary" onClick={() => handleSubmitButton()}>
                <FiSave /> Save
              </div>
            </div>
          </div>
          <div className="col">
            {detail &&
              detail.caseModel.artifacts.context?.map((artifact) => (
                <div
                  className={`${selectedArtifactId === artifact._id ? 'd-block' : 'd-none'}`}
                  key={artifact._id}
                >
                  <Artifact {...artifact} handleChangeValues={handleChangeValues} values={values} />
                </div>
              ))}
            {detail &&
              detail.caseModel.artifacts.environment?.map((artifact) => (
                <div
                  className={`${selectedArtifactId === artifact._id ? 'd-block' : 'd-none'}`}
                  key={artifact._id}
                >
                  <Artifact {...artifact} handleChangeValues={handleChangeValues} values={values} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

function Artifact(props) {
  const { items = [], name = '', handleChangeValues, values = {} } = props

  return (
    <div className="">
      {items.map((item) => (
        <div className="card mb-4" key={item._id}>
          <div className="card-header">
            <h5 className="card-title">
              {item.name} {props.mandatory ? '(mandatory)' : ''}
            </h5>
            <h6 className="card-subtitle mb-2 text-muted">{item.description}</h6>
          </div>
          <div className="card-body">
            {item.attributes.map((attribute) => (
              <div className="mb-4" key={attribute._id}>
                <label htmlFor={attribute._id} className="form-label">
                  {attribute.name} {attribute.type !== 'string' && ` (unit: ${attribute.unit})`}{' '}
                  {/* {`(${attribute.mandatory ? "mandatory" : "optional"})`} */}
                </label>

                {/* IF BOOLEAN SHOW TRUE OR FALSE RADIOBOX */}
                {attribute.type === 'boolean' && (
                  <div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={attribute._id}
                        id={`${attribute._id}-true`}
                        value={1}
                        onChange={(e) => {
                          handleChangeValues({
                            target: { name: attribute._id, value: 1 },
                          })
                        }}
                        checked={values?.[attribute._id] === 1}
                      />
                      <label className="form-check-label" htmlFor={`${attribute._id}-true`}>
                        True
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={attribute._id}
                        id={`${attribute._id}-false`}
                        value={0}
                        onChange={(e) => {
                          handleChangeValues({
                            target: { name: attribute._id, value: 0 },
                          })
                        }}
                        checked={values?.[attribute._id] === 0}
                      />
                      <label className="form-check-label" htmlFor={`${attribute._id}-false`}>
                        False
                      </label>
                    </div>
                  </div>
                )}

                {/* ELSE SHOW INPUT BASED ON TYPE */}
                {attribute.type !== 'boolean' && (
                  <input
                    type={
                      attribute.type === 'string'
                        ? 'text'
                        : attribute.type == 'datetime'
                          ? 'datetime-local'
                          : 'number'
                    }
                    className="form-control"
                    id={attribute._id}
                    name={attribute._id}
                    placeholder=""
                    onChange={(e) => {
                      let newValue = e.target.value
                      if (attribute.type === 'integer' || attribute.type === 'decimal') {
                        newValue = Number(e.target.value)
                      }
                      handleChangeValues({
                        target: { name: attribute._id, value: newValue },
                      })
                    }}
                    value={values?.[attribute._id] ?? ''}
                    required={attribute.mandatory}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
