import { useId, useState } from 'react'
import { FiSave } from 'react-icons/fi'

export default function MetricEditor({ metric, callbackClose, callbackOnUpdate }) {
  const [name, setName] = useState(metric.name)
  const [code, setCode] = useState(metric.code)
  const [type, setType] = useState(metric.type)
  const [unit, setUnit] = useState(metric.unit)
  const [rangeOfValues, setRangeOfValues] = useState(metric.rangeOfValues)
  const [normalRangeOfValues, setNormalRangeOfValues] = useState(metric.normalRangeOfValues)
  const [isLoading, setIsLoading] = useState(false)

  const metricNameId = useId()

  const handleSaveButton = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    const data = {
      ...metric,
      name,
      code,
      type,
      unit,
      rangeOfValues,
      normalRangeOfValues,
    }

    const response = await fetch('/api/metric/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const dataResponse = await response.json()

    if (dataResponse.ok) {
      setIsLoading(false)
      callbackOnUpdate(dataResponse.ok > 0, dataResponse.value)
    }
  }

  return (
    <>
      <div className="bg-light border border-light-subtle shadow-sm p-4 rounded mb-4">
        <div className="d-flex flex-row-reverse">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={(e) => {
              e.preventDefault()
              callbackClose()
            }}
          ></button>
        </div>
        <div>
          <span>
            Metric id <code>#{metric._id}</code>
          </span>
        </div>

        <div>
          <div className="row mb-4">
            <div className="col">
              <label for={metricNameId} className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id={metricNameId}
                placeholder="Name of the metric"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
            </div>
            <div className="col">
              <label className="form-label" htmlFor="code">
                Code (max 5 characters)
              </label>
              <input
                id="code"
                type="text"
                className="form-control"
                placeholder="Code of the metric"
                value={code}
                onChange={(e) => {
                  let ncode = e.target.value

                  if (ncode.length > 5) {
                    ncode = ncode.substring(0, 5)
                  }
                  setCode(ncode)
                }}
              />
            </div>
            <div className="col">
              <label className="form-label">Type</label>
              <select
                className="form-control form-select"
                name="type"
                id="Type"
                value={type}
                onChange={(e) => {
                  e.preventDefault()
                  setType(e.target.value)
                  // if boolean, set range of values to [0,1], normal range of values to [0,1], and unit to boolean
                  if (e.target.value == 'boolean') {
                    setRangeOfValues([0, 1])
                    setNormalRangeOfValues([0, 1])
                    setUnit('boolean')
                  }
                }}
              >
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
                <option value="integer">Integer</option>
                <option value="decimal">Decimal</option>
                <option value="datetime">Datetime</option>
              </select>
            </div>
          </div>
          {['integer', 'decimal'].includes(type) ? (
            <div className="row mb-4">
              <div className="col">
                <label className="form-label">Unit</label>
                <input
                  className="form-control"
                  placeholder="Units of measurement"
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value)
                  }}
                ></input>
              </div>
            </div>
          ) : null}
        </div>
        {['integer', 'decimal'].includes(type) ? (
          <div className="row mb-4 gap-4">
            <div className="col">
              <div>
                <h4> Range of Values </h4>
              </div>
              <div className="row">
                <div className="col">
                  <label className="form-label">Min</label>
                  <input
                    className="form-control"
                    step={type == 'decimal' ? 0.01 : 1}
                    value={rangeOfValues[0]}
                    onChange={(e) => {
                      const max = rangeOfValues[1]
                      setRangeOfValues([Number(e.target.value), max])
                    }}
                  ></input>
                </div>
                <div className="col">
                  <label className="form-label">Max</label>
                  <input
                    className="form-control"
                    step={type == 'decimal' ? 0.01 : 1}
                    value={rangeOfValues[1]}
                    onChange={(e) => {
                      const min = rangeOfValues[0]
                      setRangeOfValues([min, Number(e.target.value)])
                    }}
                  ></input>
                </div>
              </div>
            </div>
            <div className="col">
              <div>
                <h4> Normal range of Values</h4>
              </div>
              <div className="row">
                <div className="col">
                  <label className="form-label">Min</label>
                  <input
                    className="form-control"
                    step={type == 'decimal' ? 0.01 : 1}
                    value={normalRangeOfValues[0]}
                    onChange={(e) => {
                      const max = normalRangeOfValues[1]
                      setNormalRangeOfValues([Number(e.target.value), max])
                    }}
                  ></input>
                </div>
                <div className="col">
                  <label className="form-label">Max</label>
                  <input
                    className="form-control"
                    step={type == 'decimal' ? 0.01 : 1}
                    value={normalRangeOfValues[1]}
                    onChange={(e) => {
                      const min = normalRangeOfValues[0]
                      setNormalRangeOfValues([min, Number(e.target.value)])
                    }}
                  ></input>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <button
          className="btn btn-primary"
          onClick={(e) => {
            handleSaveButton(e)
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <>
              <FiSave />
              <span>Save Metric</span>
            </>
          )}
        </button>
      </div>
    </>
  )
}
