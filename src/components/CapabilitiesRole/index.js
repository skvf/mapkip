import Loading from '@/components/Loading'
import { createContext, useContext, useState } from 'react'
import { FiTrash } from 'react-icons/fi'
import useSWR, { mutate } from 'swr'
import { addNewCapability, deleteCapabilityById, getCapabilitiesByRoleId } from './api'
import styles from './styles.module.scss'

const CapabilityContext = createContext(null)

// function to delete capability

function DeleteCapabilityButton({ idCapability }) {
  const [isDisabled, setDisabled] = useState(false)
  const { swrKey } = useContext(CapabilityContext)
  return (
    <button
      className="btn btn-error"
      onClick={async (e) => {
        setDisabled(true)
        e.preventDefault()
        mutate(
          swrKey,
          async (capabilities) => {
            // call para api apagar
            deleteCapabilityById(idCapability)
            const filteredCapabilities = capabilities.filter((i) => i._id != idCapability)
            return filteredCapabilities
          },
          { revalidate: false }
        )
      }}
      disabled={isDisabled}
    >
      {isDisabled ? (
        <Loading size={5} message={false} />
      ) : (
        <>
          <FiTrash size={20}></FiTrash>
          <span>delete capability</span>
        </>
      )}
    </button>
  )
}

// fuction to  add a new capability

function AddNewCapabilityButton(cabilityText) {
  //variables do item
  const [isClickedToCreateNewCapability, setIsCreatingNewCapability] = useState(false)
  const { swrKey, idRole } = useContext(CapabilityContext)

  /**
   * Click listener to create new item of an artifact
   *
   * @param {EventListener} e
   */
  async function addNewCapabilityHandler(e) {
    e.preventDefault()
    setIsCreatingNewCapability(true)

    mutate(
      swrKey,
      async () => {
        await addNewCapability(idRole, cabilityText)
      },
      { revalidate: true }
    )

    setIsCreatingNewCapability(false)
  }

  return (
    <button
      className="container"
      type="submit"
      onClick={addNewCapabilityHandler}
      disabled={isClickedToCreateNewCapability}
    >
      {isClickedToCreateNewCapability ? <Loading /> : 'Add a new Capability'}
    </button>
  )
}

function ShowCapability({ capability, callbackClose }) {
  return (
    <div>
      <div className="flex">
        {capability.name}
        <DeleteCapabilityButton idCapability={capability._id} />
      </div>
    </div>
  )
}

// to get the attribute
function CapabilityList({ capabilityList }) {
  const [deleteId, setDelete] = useState(0)

  if (deleteId != 0) {
    const capability = capabilityList.filter((a) => a._id == deleteId)[0]
    return (
      <DeleteCapabilityButton
        capability={capability}
        callbackClose={(_) => setDelete(0)}
      ></DeleteCapabilityButton>
    )
  }

  return (
    <>
      {capabilityList.map((i) => (
        <ShowCapability key={i._id} name={i} callbackClose={(id) => setDelete(id)} />
      ))}
    </>
  )
}

// main function
export default function CapabilitiesRole({ idRole }) {
  const [capability, setCapability] = useState('')
  const swrKey = '/api/capability/all' + idRole
  const {
    data: capabilityList = [],
    isLoading,
    mutate,
  } = useSWR(swrKey, (url) => getCapabilitiesByRoleId(idRole))

  if (isLoading) {
    return <p>Loading capabilities...</p>
  }

  return (
    <CapabilityContext.Provider
      value={{
        swrKey,
        idRole,
      }}
    >
      <input
        className={styles.listaInput}
        value={capability}
        onChange={(e) => setCapability(e.target.value)}
      ></input>

      <AddNewCapabilityButton />

      <CapabilityList capabilityList={capabilityList} />
    </CapabilityContext.Provider>
  )
}
