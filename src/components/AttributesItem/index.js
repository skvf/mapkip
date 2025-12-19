import { createContext, useContext, useEffect, useState } from 'react'
import { FiEdit, FiSave, FiTrash } from 'react-icons/fi'

import { ToastContext } from './../Toast'
import { addNewAttribute, deleteAttributeById, getAttributesByItemId } from './api'

const AttributesContext = createContext(null)

// function to delete attribute

function DeleteAttributeButton({ idAttribute }) {
  const { setAttributeList } = useContext(AttributesContext)
  const { dispatchToast } = useContext(ToastContext)
  return (
    <button
      title="Delete"
      className="btn btn-outline-danger btn-sm"
      onClick={async (e) => {
        e.preventDefault()

        // call para api deletar
        const res = await deleteAttributeById(idAttribute)

        if (res.acknowledged) {
          setAttributeList((prev) => {
            const newList = prev.filter((attribute) => attribute._id !== idAttribute)
            return newList
          })
          dispatchToast('success', 'Attribute deleted')
        } else {
          dispatchToast('danger', 'Error deleting attribute')
        }
      }}
    >
      <FiTrash></FiTrash>
    </button>
  )
}

// function to  add a new item

function AddNewAttributeButton() {
  //variables of the attribute
  const [isClickedToCreateNewAttribute, setIsCreatingNewAttribute] = useState(false)
  const { dispatchToast } = useContext(ToastContext)
  const { setAttributeList, idItem } = useContext(AttributesContext)

  /**
   * Click listener to create new attribute in an item
   *
   * @param {EventListener} e
   */
  async function addNewAttributeHandler(e) {
    e.preventDefault()
    setIsCreatingNewAttribute(true)

    // call para api criar
    const newAttribute = await addNewAttribute(idItem)

    if (newAttribute.acknowledged) {
      setAttributeList((prev) => [...prev, { ...newAttribute }])
      dispatchToast('success', 'New attribute created')
    } else {
      dispatchToast('danger', 'Error creating new attribute')
    }

    setIsCreatingNewAttribute(false)
  }

  return (
    <div
      className="btn btn-primary"
      onClick={addNewAttributeHandler}
      disabled={isClickedToCreateNewAttribute}
      data-testid="btn-add-new-attribute"
    >
      {isClickedToCreateNewAttribute ? 'creating...' : 'Add a new Attribute'}
    </div>
  )
}

// attribute interface

function ShowAttribute({ attribute, callbackEdit }) {
  return (
    <tr>
      <td>{attribute.name}</td>
      <td>{attribute.code}</td>
      <td>{attribute.type}</td>
      <td>{['integer', 'decimal'].includes(attribute.type) ? attribute.unit : '--'}</td>
      <td>
        {['integer', 'decimal'].includes(attribute.type) &&
          `[${attribute.rangeOfValues[0]}..
          ${attribute.rangeOfValues[1]}]`}
        {attribute.type === 'boolean' && '[true, false]'}
      </td>
      <td>
        {['integer', 'decimal'].includes(attribute.type) &&
          `[${attribute.normalRangeOfValues[0]}..
          ${attribute.normalRangeOfValues[1]}]`}

        {attribute.type === 'boolean' &&
          '[' +
            Boolean(attribute.normalRangeOfValues[0]) +
            ', ' +
            Boolean(attribute.normalRangeOfValues[1]) +
            ']'}
      </td>
      <td>
        <div className="flex">
          <button
            title="edit"
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => {
              e.preventDefault()
              callbackEdit(attribute._id)
            }}
            data-testid="btn-edit-attribute"
          >
            <FiEdit></FiEdit>
          </button>
          <DeleteAttributeButton idAttribute={attribute._id} />
        </div>
      </td>
    </tr>
  )
}

function EditAttribute({ attribute, callbackClose, callbackOnUpdate }) {
  const [name, setName] = useState(attribute.name)
  const [code, setCode] = useState(attribute.code)
  const [attributeType, setAttributeType] = useState(attribute.type)
  const [unit, setUnit] = useState(attribute.unit)
  const [rangeOfValues, setRangeOfValues] = useState(attribute.rangeOfValues)
  const [normalRangeOfValues, setNormalRangeOfValues] = useState(attribute.normalRangeOfValues)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveButton = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    const data = {
      ...attribute,
      name,
      code,
      type: attributeType,
      unit,
      rangeOfValues,
      normalRangeOfValues,
    }

    const response = await fetch('/api/attribute/edit', {
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
      callbackClose()
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
            Attribute id <code>#{attribute._id}</code>
          </span>
        </div>

        <div>
          <div className="row mb-4">
            <div className="col">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name of the metric"
                value={name}
                autoFocus={true}
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
                data-testid="select-attribute-type"
                value={attributeType}
                onChange={(e) => {
                  e.preventDefault()
                  setAttributeType(e.target.value)
                  // if boolean, set range of values to [0,1], normal range of values to [0,1], and unit to boolean
                  if (e.target.value === 'boolean') {
                    setRangeOfValues([0, 1])
                    setNormalRangeOfValues([0, 1])
                    setUnit('boolean')
                  }

                  if (e.target.value === 'integer') {
                    // round values
                    setRangeOfValues([Math.round(rangeOfValues[0]), Math.round(rangeOfValues[1])])
                    setNormalRangeOfValues([
                      Math.round(normalRangeOfValues[0]),
                      Math.round(normalRangeOfValues[1]),
                    ])
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
          {['integer', 'decimal'].includes(attributeType) ? (
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
        {['integer', 'decimal', 'boolean'].includes(attributeType) ? (
          <div className="row mb-4 gap-4">
            {attributeType !== 'boolean' && (
              <div className="col">
                <div>
                  <h4> Range of Values </h4>
                </div>
                <div className="row">
                  <div className="col">
                    <label className="form-label">Min</label>
                    <input
                      className="form-control"
                      step={attributeType == 'decimal' ? 0.01 : 1}
                      value={rangeOfValues[0]}
                      data-testid="input-min-range"
                      type="number"
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
                      data-testid="input-max-range"
                      step={attributeType == 'decimal' ? 0.01 : 1}
                      type="number"
                      value={rangeOfValues[1]}
                      onChange={(e) => {
                        const min = rangeOfValues[0]
                        setRangeOfValues([min, Number(e.target.value)])
                      }}
                    ></input>
                  </div>
                </div>
              </div>
            )}
            <div className="col">
              <div>
                <h4>{attributeType !== 'boolean' ? 'Normal range of Values' : 'Normal Value'}</h4>
              </div>
              {attributeType === 'boolean' && (
                <div className="row">
                  <div className="col">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="radioDefault"
                        id="radioDefault1"
                        checked={normalRangeOfValues[0] === 1}
                        onChange={(e) => {
                          setNormalRangeOfValues([1, 1])
                        }}
                      />
                      <label className="form-check-label" for="radioDefault1">
                        True
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="radioDefault"
                        id="radioDefault2"
                        checked={normalRangeOfValues[0] === 0}
                        onChange={(e) => {
                          setNormalRangeOfValues([0, 0])
                        }}
                      />
                      <label className="form-check-label" for="radioDefault2">
                        False
                      </label>
                    </div>
                  </div>
                </div>
              )}
              {attributeType !== 'boolean' && (
                <div className="row">
                  <div className="col">
                    <label className="form-label">Min</label>
                    <input
                      className="form-control"
                      data-testid="input-min-normal-range"
                      step={attributeType == 'decimal' ? 0.01 : 1}
                      type="number"
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
                      data-testid="input-max-normal-range"
                      step={attributeType == 'decimal' ? 0.01 : 1}
                      type="number"
                      value={normalRangeOfValues[1]}
                      onChange={(e) => {
                        const min = normalRangeOfValues[0]
                        setNormalRangeOfValues([min, Number(e.target.value)])
                      }}
                    ></input>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <button
          className="btn btn-primary"
          onClick={(e) => {
            handleSaveButton(e)
          }}
          disabled={isLoading}
          data-testid="btn-save-attribute"
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
              <span>Save Attribute</span>
            </>
          )}
        </button>
      </div>
    </>
  )
}

// to get the attribute
function AttributesList({ attributeList, setAttributeList }) {
  const [editId, setEdit] = useState(0)
  const [attribute, setAttribute] = useState(null)

  const { dispatchToast } = useContext(ToastContext)

  useEffect(() => {
    if (editId !== 0) {
      setAttribute(attributeList.filter((a) => a._id == editId)[0])
    } else {
      setAttribute(null)
    }
  }, [editId, attributeList])

  return (
    <>
      <div className="card-header">
        <span className="card-title">Attributes of the Item</span>
      </div>
      <div className="card-body">
        <table className="table table-sm">
          <thead>
            <th>Name</th>
            <th>Code</th>
            <th>Type</th>
            <th>Unit</th>
            <th>Range Of Values</th>
            <th>Normal Range Of Values</th>
            <th>Actions</th>
          </thead>
          <tbody>
            {attributeList &&
              attributeList.map((i) => (
                <ShowAttribute key={i._id} attribute={i} callbackEdit={(id) => setEdit(id)} />
              ))}
          </tbody>
        </table>
        {editId !== 0 && !!attribute ? (
          <EditAttribute
            attribute={attribute}
            callbackClose={(_) => setEdit(0)}
            callbackOnUpdate={(success, newData) => {
              if (success) {
                // update the attribute list
                const newAttributeList = attributeList.map((attr) => {
                  if (attr._id === newData._id) {
                    return newData
                  }
                  return attr
                })
                setAttributeList(newAttributeList)
                dispatchToast('success', 'Attribute updated successfully!')
              }
            }}
          />
        ) : null}
      </div>
    </>
  )
}

// main function
export default function AttributesItem({ idItem }) {
  const [attributeList, setAttributeList] = useState([])

  // get the attributes of the item
  useEffect(() => {
    if (idItem) {
      getAttributesByItemId(idItem).then((res) => {
        setAttributeList(res)
      })
    }
  }, [idItem])

  return (
    <AttributesContext.Provider
      value={{
        idItem,
        setAttributeList,
      }}
    >
      <div className="card mb-4">
        <AttributesList attributeList={attributeList} setAttributeList={setAttributeList} />
        <div className="card-footer">
          <AddNewAttributeButton />
        </div>
      </div>
    </AttributesContext.Provider>
  )
}
