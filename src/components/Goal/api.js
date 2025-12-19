/**
 * Api call to get all attributes from a case model
 * @param {String} idCaseModel
 * @returns
 */
export async function getAttributesFromApi(idCaseModel) {
  const response = await fetch(`/api/attribute/allByCaseModel`, {
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
 * Api call to get all goals from a tactic
 * @param {String} idTactic tactic id
 * @returns list of goals
 */
export async function getGoalsFromApi(idTactic) {
  const response = await fetch(`/api/goal/all`, {
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
 * Api call to get all metrics from a tactic
 * @param {String} idTactic tactic id
 * @returns list of metrics
 */
export async function getMetricsFromApi(idTactic) {
  const response = await fetch(`/api/metric/all`, {
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
  // adicionar tipo 'Metric'
  return data
}

/**
 * Api call to create a new goal
 * @param {String} idTactic tactic id
 * @param {String} idAttribute attribute id
 * @param {String} operator operator
 * @param {String} value value
 * @returns new goal
 */
export async function createGoalFromApi({ idTactic, idAttribute, idMetric, operator, value }) {
  const response = await fetch(`/api/goal/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idTactic: idTactic,
      idAttribute: idAttribute,
      idMetric: idMetric,
      operator: operator,
      value: value,
    }),
  })
  const data = await response.json()
  return data
}

/**
 * Api call to delete a goal
 * @param {String} idGoal goal id
 * @returns
 */
export async function deleteGoalFromApi(idGoal) {
  const response = await fetch(`/api/goal/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: idGoal,
    }),
  })
  const data = await response.json()
  return data
}
