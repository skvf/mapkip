/**
 * Add a new attribute into the item from API
 *
 * @param {String} idRole
 * @returns {Object} id of the attribute
 */
export async function addNewCapability(idRole, capability) {
  // get the res from the API
  const data = await fetch(`/api/capability/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idRole,
      name: capability,
    }),
  })

  // retuns the id of the attribute
  return await data.json()
}

/**
 * get an attribute from API
 *
 * @param {String} url
 * @param {String} idCapability
 * @returns {JSON} an item
 */
export async function getCapability(url, idCapability) {
  // get the res from the API
  const data = await fetch(`${url}/retrieve`, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idCapability,
    }),
  })

  // retuns the id of the item
  return await data.json()
}

/**
 * update attribute from API
 *
 * @param {String} url
 * @param {String} idAttribute
 * @returns {JSON} an attribute
 */

export async function updateCapability(capability) {
  const request = await fetch('/api/capability/edit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(capability),
  })

  return await request.json()
}

/**
 * delete attribute of the item from API
 *
 * @param {String} idCapability
 * @returns
 */
export async function deleteCapabilityById(idCapability) {
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
 * Get attributes of the item from API
 *
 * @param {String} idItem
 * @returns {Array} list of attributes
 */
export async function getCapabilitiesByRoleId(idRole) {
  const request = await fetch(`/api/capability/all`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idRole,
    }),
  })

  return await request.json()
}
