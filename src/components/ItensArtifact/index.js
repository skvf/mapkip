import { createContext, useContext, useMemo, useState } from 'react'
import { FiTrash } from 'react-icons/fi'
import useSWR, { mutate } from 'swr'

import AttributesItem from '../AttributesItem'
import Loading from '../Loading'
import { addNewItem, deleteItemById, getItemsByArtifactId, updateItem } from './api'

const ItensContext = createContext(null)

// function to delete item

function DeleteItemButton({ idItem }) {
  const { swrKey } = useContext(ItensContext)
  const [isDisabled, setDisabled] = useState(false)
  return (
    <button
      className="btn btn-outline-danger btn-sm"
      onClick={async (e) => {
        setDisabled(true)
        e.preventDefault()
        mutate(
          swrKey,
          async (items) => {
            // call para api apagar
            deleteItemById(idItem)
            const filteredItems = items.filter((i) => i._id != idItem)
            return filteredItems
          },
          { revalidate: false }
        )
      }}
      disabled={isDisabled}
    >
      {isDisabled ? (
        <Loading size={5} message={false} />
      ) : (
        <div className="d-flex align-items-center gap-2">
          <FiTrash></FiTrash>
          <span>delete item</span>
        </div>
      )}
    </button>
  )
}

// fuction to  add a new item

function AddNewItemButton() {
  //variables do item
  const [isClickedToCreateNewItem, setIsCreatingNewItem] = useState(false)
  const { swrKey, idArtifact } = useContext(ItensContext)

  /**
   * Click listener to create new item of an artifact
   *
   * @param {EventListener} e
   */
  async function addNewItemHandler(e) {
    e.preventDefault()
    setIsCreatingNewItem(true)

    mutate(
      swrKey,
      async (items) => {
        await addNewItem(idArtifact)
      },
      { revalidate: true }
    )

    setIsCreatingNewItem(false)
  }

  return (
    <button
      className="btn btn-primary"
      type="submit"
      onClick={addNewItemHandler}
      disabled={isClickedToCreateNewItem}
      data-testid="btn-add-new-item"
    >
      {isClickedToCreateNewItem ? <Loading /> : 'Add a new Item'}
    </button>
  )
}

// item interface

export function Item({ item }) {
  const [attributeList, setAttributeList] = useState([])
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description)
  const [isSaved, setIsSaved] = useState(true)

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
  // event that sends updates after 750ms
  //useMemo save in cache the results of calculation
  const dispatchChangesToApi = useMemo(() => {
    return debounce((editItem) => {
      updateItem(editItem)
      setIsSaved(true)
    }, 750)
  }, [])

  return (
    <>
      <section>
        <div className="d-flex justify-content-between mb-4">
          <div>
            <p className="h5">
              Item ref <code>#{item._id}</code>
            </p>
          </div>
          <div>
            <DeleteItemButton idItem={item._id} />
          </div>
        </div>
        <div>
          <div className="form-group mb-4">
            <label>Name of the item:</label>
            <input
              className="form-control"
              placeholder="Name of the item"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                dispatchChangesToApi({
                  _id: item._id,
                  name: e.target.value,
                  description: description,
                })
              }}
            ></input>
          </div>
          <div className="form-group mb-4">
            <label>Description of the item:</label>
            <textarea
              className="form-control"
              placeholder="Description of the item"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                dispatchChangesToApi({
                  _id: item._id,
                  name: name,
                  description: e.target.value,
                })
              }}
            ></textarea>
          </div>
        </div>

        <AttributesItem idItem={item._id}></AttributesItem>
      </section>
    </>
  )
}

// to get the items
function ItensList({ itemList }) {
  return (
    <>
      {itemList.map((i) => (
        <Item key={i._id} item={i} />
      ))}
    </>
  )
}

// main function
export default function ItensArtifact({ idArtifact }) {
  const swrKey = '/api/item/' + idArtifact
  const {
    data: itemList,
    error,
    isLoading,
    mutate,
  } = useSWR(swrKey, (url) => getItemsByArtifactId(idArtifact))

  if (!itemList && !error) {
    return <Loading />
  }

  return (
    <ItensContext.Provider
      value={{
        swrKey,
        idArtifact,
      }}
    >
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Itens of the Artifact</span>
        </div>
        <div className="card-body">
          <ItensList itemList={itemList} />
        </div>
        <div className="card-footer">
          <AddNewItemButton />
        </div>
      </div>
    </ItensContext.Provider>
  )
}
