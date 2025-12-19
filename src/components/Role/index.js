import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { FiTrash } from 'react-icons/fi'
import useSWR from 'swr'

// To get the case Model
async function getRoleById(url, id) {
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
async function getCapabilitiesByRoleId(url, idRole) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idRole: idRole,
    }),
  })

  return await request.json()
}

// To get permission of the role
async function getPermissionsByRoleId(url, idRole) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idRole: idRole,
    }),
  })

  return await request.json()
}

// To get artifacts of a case model
async function getResponsabilitiesByRoleId(url, idRole) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idRole: idRole,
    }),
  })

  return await request.json()
}

/**
 * delete capability by Id
 *
 * @param {String} idCapability
 * @returns
 */
async function deleteCapabilityById(idCapability) {
  const request = await fetch(`/api/capability/delete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idCapability,
    }),
  })

  return await request.json()
}

/**
 * delete Permission by Id
 *
 * @param {String} idPermission
 * @returns
 */
async function deletePermissionById(idPermission) {
  const request = await fetch(`/api/permission/delete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idPermission,
    }),
  })

  return await request.json()
}

/**
 * delete Resonsability by Id
 *
 * @param {String} idResonsability
 * @returns
 */
async function deleteResponsabilityById(idReponsability) {
  const request = await fetch(`/api/responsability/delete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idReponsability,
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

export default function Role({ idRole }) {
  //variables of the Role
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [lastUpdated, setLastUpdated] = useState(0)
  const [isSaved, setIsSaved] = useState(true)

  //useRouter returns the router, an object that contains
  const router = useRouter()

  // get the role information (name, description) or an error
  const { data: role, error } = useSWR(['/api/role/retrieve', idRole], getRoleById)

  const { data: listCapabilities, mutate: mutateCapabilities } = useSWR(
    ['/api/capability/all', idRole],
    getCapabilitiesByRoleId
  )

  const { data: listPermissions, mutate: mutatePermissions } = useSWR(
    ['/api/permission/all', idRole],
    getPermissionsByRoleId
  )

  const { data: listResponsabilities, mutate: mutateResponsabilities } = useSWR(
    ['/api/responsability/all', idRole],
    getResponsabilitiesByRoleId
  )

  // set in the interface the artifact information
  useEffect(() => {
    if (role) {
      setRoleName(role.name)
      setRoleDescription(role.description)
      setLastUpdated(role.updatedAt)
      setIsSaved(true)
    }
  }, [role])

  // send the update data to the API for saving changes
  async function updateRole(role) {
    const request = await fetch('/api/role/edit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(role),
    })

    return await request.json()
  }

  // event that sends updates after 750ms
  //useMemo save in cache the results of calculation
  const dispatchChangesToApi = useMemo(() => {
    return debounce((editRole) => {
      updateRole(editRole)
      setIsSaved(true)
    }, 750)
  }, [])

  //add new capability
  const [capability, setCapability] = useState('')

  async function onClickAddCapability(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/capability/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idRole, name: capability }),
    })

    // retuns the id of the artifact
    const newCapability = await data.json()
    // acknowledged is confirmation of success
    if (newCapability.acknowledged) {
      mutateCapabilities([
        ...listCapabilities,
        {
          _id: newCapability.insertedId,
          idRole,
          name: capability,
        },
      ])

      // clean the input
      setCapability('')
    }
  }

  //add new permission
  const [permission, setPermission] = useState('')

  async function onClickAddPermission(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/permission/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idRole, name: permission }),
    })

    // retuns the id of the artifact
    const newPermission = await data.json()
    // acknowledged is confirmation of success
    if (newPermission.acknowledged) {
      mutatePermissions([
        ...listPermissions,
        {
          _id: newPermission.insertedId,
          idRole,
          name: permission,
        },
      ])

      // clean the input
      setPermission('')
    }
  }

  //add new permission
  const [responsability, setResponsability] = useState('')

  async function onClickAddResponsability(e) {
    e.preventDefault()

    // get the res from the API
    const data = await fetch('/api/responsability/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idRole, name: responsability }),
    })

    // retuns the id of the artifact
    const responseData = await data.json()
    // acknowledged is confirmation of success
    if (responseData.acknowledged) {
      mutateResponsabilities([
        ...listResponsabilities,
        {
          _id: responseData.insertedId,
          idRole,
          name: responsability,
        },
      ])

      // clean the input
      setResponsability('')
    }
  }

  return (
    <>
      <div className="card mb-4">
        <div className="card-body">
          <div className="form-group mb-4">
            <label>Name:</label>
            <input
              className="form-control"
              placeholder="Name of the Role"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value)
                dispatchChangesToApi({
                  _id: idRole,
                  name: e.target.value,
                  description: roleDescription,
                })
              }}
            ></input>
          </div>
          <div className="form-group mb-4">
            <label>Description of the role:</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Description of the Role"
              value={roleDescription}
              onChange={(e) => {
                setRoleDescription(e.target.value)
                dispatchChangesToApi({
                  _id: idRole,
                  name: roleName,
                  description: e.target.value,
                })
              }}
            ></textarea>
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header">
          <span className="h5">Capability</span>
        </div>
        <div className="card-body">
          <div className="d-flex gap-2 mb-4">
            <div className="col">
              <input
                className="form-control"
                value={capability}
                placeholder="Capability"
                onChange={(e) => {
                  setCapability(e.target.value)
                }}
              ></input>
            </div>
            <button className="btn btn-primary btn-sm col-3" onClick={onClickAddCapability}>
              Add Capability
            </button>
          </div>
          <h6>Capability List</h6>
          <div>
            {
              // if the list is empty, show a message
              !listCapabilities || listCapabilities.length === 0 ? (
                <div className="alert alert-warning">There are no capabilities in this role</div>
              ) : null
            }
            {listCapabilities &&
              listCapabilities.map((capability) => (
                <div
                  className="d-flex gap-2 justify-content-between align-items-center border-bottom py-2"
                  key={capability._id}
                >
                  <div>
                    <p>{capability.name}</p>
                  </div>
                  <div>
                    <button
                      title="Delete"
                      className="btn btn-outline-danger btn-sm"
                      onClick={async (e) => {
                        const deleteRequest = await deleteCapabilityById(capability._id)
                        if (deleteRequest.acknowledged) {
                          mutateCapabilities(
                            listCapabilities.filter((c) => c._id !== capability._id)
                          )
                        }
                      }}
                    >
                      <FiTrash></FiTrash>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header">
          <span className="h5">Permissions</span>
        </div>
        <div className="card-body">
          <div className="d-flex gap-2 mb-4">
            <div className="col">
              <input
                className="form-control"
                value={permission}
                placeholder="Permission"
                onChange={(e) => setPermission(e.target.value)}
              ></input>
            </div>
            <button className="btn btn-primary btn-sm col-3" onClick={onClickAddPermission}>
              Add Permission
            </button>
          </div>
          <h6>Permission List</h6>
          <div>
            {
              // if the list is empty, show a message
              !listPermissions || listPermissions.length === 0 ? (
                <div className="alert alert-warning">There are no permissions in this role</div>
              ) : null
            }
            {listPermissions &&
              listPermissions.map((permission) => (
                <div
                  className="d-flex gap-2 justify-content-between align-items-center border-bottom py-2"
                  key={permission._id}
                >
                  <div>
                    <p>{permission.name}</p>
                  </div>
                  <div>
                    <button
                      title="Delete"
                      className="btn btn-outline-danger btn-sm"
                      onClick={async (e) => {
                        const request = await deletePermissionById(permission._id)
                        if (request.acknowledge) {
                          mutatePermissions(listPermissions.filter((p) => p._id !== permission._id))
                        }
                      }}
                    >
                      <FiTrash></FiTrash>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header">
          <span className="h5">Responsabilities</span>
        </div>

        <div className="card-body">
          <div className="d-flex gap-2 mb-4">
            <div className="col">
              <input
                className="form-control"
                value={responsability}
                placeholder="Responsability"
                onChange={(e) => setResponsability(e.target.value)}
              ></input>
            </div>
            <button className="btn btn-primary btn-sm col-3" onClick={onClickAddResponsability}>
              Add Responsability
            </button>
          </div>
          <h6>Responsabilities List</h6>
          <div>
            {
              // if the list is empty, show a message
              !listResponsabilities || listResponsabilities.length === 0 ? (
                <div className="alert alert-warning">
                  There are no responsabilities in this role
                </div>
              ) : null
            }
            {listResponsabilities &&
              listResponsabilities.map((responsability) => (
                <div
                  className="d-flex gap-2 justify-content-between align-items-center border-bottom py-2"
                  key={responsability._id}
                >
                  <div>
                    <p>{responsability.name}</p>
                  </div>
                  <div>
                    <button
                      title="Delete"
                      className="btn btn-outline-danger btn-sm"
                      onClick={(e) => {
                        deleteResponsabilityById(responsability._id)
                        mutateResponsabilities(
                          listResponsabilities.filter((r) => r._id !== responsability._id)
                        )
                      }}
                    >
                      <FiTrash></FiTrash>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
