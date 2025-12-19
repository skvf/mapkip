export async function getMetricsFromApi(idTactic) {
  const request = await fetch(`/api/metric/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idTactic }),
  })
  const data = await request.json()
  return data
}

export async function createMetricFromApi(idTactic) {
  const createMetricResponse = await fetch(`/api/metric/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idTactic }),
  })
  const data = await createMetricResponse.json()
  return data
}

export async function deleteMetricFromApi(idMetric) {
  const deleteMetricResponse = await fetch(`/api/metric/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ _id: idMetric }),
  })
  const data = await deleteMetricResponse.json()
  return data
}
