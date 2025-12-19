/**
 * Api call to get all attributes from a case model
 * @param {String} idCaseModel
 * @returns
 */
export async function getAttributesFromApi(idCaseModel) {
  const response = await fetch(`/api/attribute/allByCaseModel?prec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idCaseModel: idCaseModel,
    }),
  })
  const data = await response.json()
  return data
}

/**
 * Api call to get all metrics from a tactic
 * @param {String} idTactic tactic id
 * @returns list of metrics
 */
export async function getMetricsFromApi(idTactic) {
  const response = await fetch(`/api/metric/all?prec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idTactic: idTactic,
      params: {
        filter: {
          type: {
            $in: ['boolean', 'integer', 'decimal'],
          },
        },
      },
    }),
  })
  const data = await response.json()
  return data
}

/**
 * Api call to get all preconditions from a tactic
 * @param {String} idTactic tactic id
 * @returns list of preconditions
 */
export async function getPreconditionsFromApiByTactic(idTactic) {
  if (idTactic == null) {
    throw new Error('idTactic must not be null')
  }

  const response = await fetch(`/api/precondition/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idTactic: idTactic,
    }),
  })
  const data = await response.json()
  return data
}

/**
 * Api call to get all preconditions from a step
 * @param {String} idStep step id
 * @returns list of preconditions
 */
export async function getPreconditionsFromApiByStep(idStep) {
  const response = await fetch(`/api/precondition/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idStep: idStep,
    }),
  })
  const data = await response.json()
  return data
}

export async function getPreconditionsFromApiByEvent(idEvent) {
  const response = await fetch(`/api/precondition/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idEvent,
    }),
  })
  const data = await response.json()
  return data
}

/**
 * Api call to create a new precondition
 * @param {String} idTactic tactic id
 * @param {String} idAttribute attribute id
 * @param {String} operator operator
 * @param {String} value value
 * @returns new precondition
 */
export async function createPreconditionFromApi({
  idTactic,
  idStep,
  idAttribute,
  idMetric,
  idEvent,
  operator,
  value,
}) {
  const response = await fetch(`/api/precondition/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idTactic: idTactic,
      idStep: idStep,
      idAttribute: idAttribute,
      idMetric: idMetric,
      idEvent,
      operator: operator,
      value: value,
    }),
  })
  const data = await response.json()
  return data
}

/**
 * Api call to delete a precondition
 * @param {String} idPrecondition precondition id
 * @returns
 */
export async function deletePreconditionFromApi(idPrecondition) {
  const response = await fetch(`/api/precondition/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idPrecondition,
    }),
  })
  const data = await response.json()
  return data
}
