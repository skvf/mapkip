import Link from 'next/link'
import { useState } from 'react'
import { FiArrowRightCircle, FiExternalLink, FiPlay, FiPlus } from 'react-icons/fi'
import useSWR from 'swr'
import { Pagination } from '../DataTable'
import Loading from '../Loading'

const Filters = ({ statusFilter, setStatusFilter, setSkip, instanceId }) => (
  <div>
    <div className="mb-3 row align-items-end">
      <div className="col">
        <label>Status: </label>
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setSkip(0) // reset to first page
          }}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="error">Error</option>
          <option value="on_queue">On Queue</option>
        </select>
      </div>
      <div className="col-auto">
        <Link href="/runTime/Planner/new">
          <a className="btn btn-primary d-flex align-items-center gap-1">
            <FiPlus size={22} /> Create a New Plan
          </a>
        </Link>
      </div>
    </div>
    {instanceId && <p className="mt-2">Instance ID: {instanceId}</p>}
  </div>
)

const PlannerRow = ({ planner, mapper }) => {
  const executePlanner = async () => {
    await fetch(`/api/planner/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: planner._id }),
    })
  }

  return (
    <tr>
      <td>
        <Link href={`/runTime/Planner/${planner._id}`}>
          <a className="btn btn-sm mx-1">P-{planner._id}</a>
        </Link>
      </td>

      <td>
        <Link href={`/runTime/Instance/${planner.idInstance}/view`}>
          <a className="btn btn-sm" target="_blank">
            I-{planner.idInstance} <FiExternalLink />
          </a>
        </Link>
      </td>

      <td>
        <span
          className="badge badge-pill badge-info"
          style={{
            backgroundColor: mapper[planner.status],
          }}
        >
          {planner.status.replace('_', ' ').toUpperCase()}
        </span>
      </td>

      <td>
        <button
          className="btn btn-primary btn-sm mx-1"
          disabled={planner.status !== 'not_started'}
          onClick={executePlanner}
        >
          Execute Planner <FiPlay />
        </button>

        <Link href={`/runTime/Planner/${planner._id}`}>
          <a className="btn btn-outline-secondary btn-sm mx-1">
            Details <FiArrowRightCircle />
          </a>
        </Link>
      </td>

      <td>{new Date(planner.createdAt).toLocaleString()}</td>
    </tr>
  )
}

const PlannersTable = ({ planners, mapper }) => (
  <table className="table table-sm table-striped">
    <thead>
      <tr>
        <th>Plan Id</th>
        <th>Case Instance</th>
        <th>Status</th>
        <th>Actions</th>
        <th>Created At</th>
      </tr>
    </thead>
    <tbody>
      {planners.map((planner) => (
        <PlannerRow key={planner._id} planner={planner} mapper={mapper} />
      ))}
    </tbody>
  </table>
)

export default function Planners({ instanceId }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [casesFilter, setCasesFilter] = useState(null)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)

  const fetcher = (url) => fetch(url).then((res) => res.json())

  const buildUrl = () => {
    const params = new URLSearchParams()
    if (statusFilter != null) params.append('status', statusFilter)
    if (casesFilter != null) params.append('caseType', casesFilter)
    if (instanceId != null) params.append('instanceId', instanceId)
    params.append('skip', skip)
    params.append('limit', limit)
    const qs = params.toString()
    return `/api/planner/all${qs ? `?${qs}` : ''}`
  }

  const { data: planners, error } = useSWR(buildUrl(), fetcher)

  const isLoading = !error && !planners
  const isError = error

  const mapper = {
    CREATED: 'var(--bs-warning)',
    on_queue: 'var(--bs-info)',
    error: 'var(--bs-danger)',
    completed: 'var(--bs-success)',
    not_started: 'var(--bs-secondary)',
  }

  return (
    <div className="container mt-4">
      {/* title and a button to create a new planner */}
      <h1 className="h2">Planner List</h1>

      <Filters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setSkip={setSkip}
        instanceId={instanceId}
      />

      {isLoading && (
        <div className="my-5">
          <Loading message="Loading planners..." />
        </div>
      )}

      {isError && <div>Error loading data</div>}

      {planners && planners.length === 0 && <div>No planners found</div>}

      {planners && planners.length > 0 && <PlannersTable planners={planners} mapper={mapper} />}

      {planners && planners.length > 0 && (
        <Pagination
          skip={skip}
          setSkip={setSkip}
          limit={limit}
          setLimit={setLimit}
          numberOfItems={planners.length}
        />
      )}
    </div>
  )
}
