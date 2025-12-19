/**
 * delete item of the artifact from API
 *
 * @param {String} idItem
 * @returns
 */
export async function deleteItemById(idItem) {
  const request = await fetch(`/api/item/delete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idItem,
    }),
  })

  return await request.json()
}

/**
 * Get itens of the artifact from API
 *
 * @param {String} idArtifact
 * @returns {Array} list of itens
 */
export async function getItemsByArtifactId(idArtifact) {
  const request = await fetch(`/api/item/all`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idArtifact,
    }),
  })

  return await request.json()
}

/**
 * Add a new item into the artifact from API
 *
 * @param {String} idArtifact
 * @returns {Object} an item
 */
export async function addNewItem(idArtifact) {
  // get the res from the API
  const data = await fetch(`/api/item/create`, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idArtifact,
    }),
  })

  // retuns the id of the item
  return await data.json()
}

/**
 * get a item from API
 *
 * @param {String} url
 * @param {String} idItem
 * @returns {JSON} an item
 */
export async function getItem(url, idItem) {
  // get the res from the API
  const data = await fetch(`${url}/retrieve`, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idItem,
    }),
  })

  // retuns the id of the item
  return await data.json()
}

export async function updateItem(item) {
  const request = await fetch('/api/item/edit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })

  return await request.json()
}
