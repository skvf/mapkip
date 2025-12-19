import useSWR from 'swr'

const fetcher = (url) =>
  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())

function usePlanners({ isRealTime = false, instanceId } = {}) {
  const options = {
    refreshInterval: isRealTime ? 1000 : 0,
  }

  const { data, error } = useSWR('/api/planner/all', fetcher, options)

  return {
    planners: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export default usePlanners
