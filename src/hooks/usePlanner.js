import useSWR from 'swr'

/**
 * Fetches data from the given URL using a POST request with the provided planner ID.
 *
 * @param {string} url - The URL to send the request to.
 * @param {string} idPlanner - The ID of the planner to include in the request body.
 * @returns {Promise<Object>} A promise that resolves to the response data.
 */
async function fetcher(url, idPlanner) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ _id: idPlanner }),
  })
  const data = await response.json()
  return data
}

/**
 * Custom hook to retrieve planner data using SWR (stale-while-revalidate).
 *
 * @param {string} idPlanner - The ID of the planner to retrieve.
 * @returns {Object} An object containing the planner data, loading state, error state, and a mutate function.
 * @returns {Object} return.planner - The retrieved planner data.
 * @returns {boolean} return.isLoading - Indicates if the data is currently being loaded.
 * @returns {Error} return.isError - The error object if an error occurred during data fetching.
 * @returns {Function} return.mutatePlanner - Function to manually trigger a revalidation of the planner data.
 */
function usePlanner(idPlanner, { isRealTime = false } = {}) {
  const options = {
    refreshInterval: isRealTime ? 1000 : 0,
  }

  const { data, error, mutate } = useSWR(
    idPlanner ? [`/api/planner/retrieve`, idPlanner] : null,
    fetcher,
    options
  )

  return {
    planner: data,
    isLoading: !error && !data,
    isError: error,
    isFinished: data && ['completed', 'error'].includes(data.status),
    mutatePlanner: mutate,
  }
}

export default usePlanner
