/**
 * delete attribute of the item from API
 *
 * @param {String} idAttribute
 * @returns
 */
export async function deleteAttributeById(idAttribute) {
  const request = await fetch(`/api/attribute/delete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idAttribute,
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
export async function getAttributesByItemId(idItem) {
  const request = await fetch(`/api/attribute/all`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idItem,
    }),
  })

  return await request.json()
}

/**
 * Add a new attribute into the item from API
 *
 * @param {String} idItem
 * @returns {Object} id of the attribute
 */
export async function addNewAttribute(idItem) {
  // get the res from the API
  const data = await fetch(`/api/attribute/create`, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idItem,
    }),
  })

  // retuns the id of the attribute
  return await data.json()
}

/**
 * get an attribute from API
 *
 * @param {String} url
 * @param {String} idAttribute
 * @returns {JSON} an item
 */
export async function getAttribute(url, idAttribute) {
  // get the res from the API
  const data = await fetch(`${url}/retrieve`, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idAttribute,
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

export async function updateAttribute(attribute) {
  const request = await fetch('/api/attribute/edit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attribute),
  })

  return await request.json()
}
