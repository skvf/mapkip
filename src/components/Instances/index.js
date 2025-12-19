import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { Pagination } from '../DataTable'
import Loading from '../Loading'
import PageTitle from '../PageTitle'

const fetcher = (url) => fetch(url).then((res) => res.json())

const removeEmptyFilters = (filters) => {
  const newFilters = { ...filters }
  Object.keys(newFilters).forEach((key) => {
    if (newFilters[key] === '') {
      delete newFilters[key]
    }
  })
  return newFilters
}

function createQueryString(key, value) {
  const searchParams = new URLSearchParams(window.location.search)
  if (value) {
    searchParams.set(key, value)
  } else {
    searchParams.delete(key)
  }
  return searchParams.toString()
}

function Filters({ filters, setFilters, caseTypes, router, createQueryString }) {
  return (
    <div className="row my-4">
      <div className="col">
        <label className="form-label" htmlFor="caseType">
          Case Type
        </label>
        <select
          id="caseType"
          name="caseType"
          className="form-select"
          value={filters.caseType}
          onChange={(e) => {
            setFilters({
              ...filters,
              caseType: e.target.value,
            })
            router.push({
              pathname: router.pathname,
              search: createQueryString('caseType', e.target.value),
            })
          }}
        >
          <option value="">All</option>
          {caseTypes?.map((caseType) => {
            return (
              <option key={caseType._id} value={caseType._id}>
                {caseType.name}
              </option>
            )
          })}
        </select>
      </div>
      <div className="col">
        <label className="form-label" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="form-select"
          value={filters.status}
          onChange={(e) => {
            setFilters({
              ...filters,
              status: e.target.value,
            })
            router.push({
              pathname: router.pathname,
              search: createQueryString('status', e.target.value),
            })
          }}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="completed">Completed</option>
          <option value="created">Created</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <div className="col">
        <label className="form-label" htmlFor="alias">
          Alias
        </label>
        <input
          type="text"
          id="alias"
          name="alias"
          className="form-control"
          value={filters.alias}
          onChange={(e) => {
            setFilters({
              ...filters,
              alias: e.target.value,
            })
            router.push({
              pathname: router.pathname,
              search: createQueryString('alias', e.target.value),
            })
          }}
        />
      </div>
      <div className="col">
        <label className="form-label" htmlFor="orderBy">
          Order by
        </label>
        <select
          id="orderBy"
          name="orderBy"
          className="form-select"
          value={filters.orderBy || ''}
          onChange={(e) => {
            setFilters({
              ...filters,
              orderBy: e.target.value,
            })
            router.push({
              pathname: router.pathname,
              search: createQueryString('orderBy', e.target.value),
            })
          }}
        >
          <option value="">Select</option>
          <option value="caseModel.name">Case Type</option>
          <option value="alias">Alias</option>
          <option value="status">Status</option>
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
        </select>
      </div>
      <div className="col">
        <label className="form-label" htmlFor="orderDirection">
          Order Direction
        </label>
        <select
          id="orderDirection"
          name="orderDirection"
          className="form-select"
          value={filters.orderDirection || ''}
          onChange={(e) => {
            setFilters({
              ...filters,
              orderDirection: e.target.value,
            })
            router.push({
              pathname: router.pathname,
              search: createQueryString('orderDirection', e.target.value),
            })
          }}
        >
          <option value="">Select</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  )
}

function InstanceRow({ instance, actions }) {
  return (
    <tr>
      <td>i-{instance._id}</td>
      <td>{instance.caseModel.name}</td>
      <td>{instance.alias || '--'}</td>
      <td>
        <small className="code">{instance.status}</small>
      </td>
      <td>{instance.updatedAt}</td>
      <td>
        {actions.map((action) => {
          const ActionIcon = action.icon
          return (
            <Link key={action.key} href={action.href(instance)}>
              <a className="btn btn-outline-primary btn-sm me-1">
                <ActionIcon /> {action.title}
              </a>
            </Link>
          )
        })}
      </td>
    </tr>
  )
}

function InstancesTable({ instances, actions }) {
  return (
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th>Instance Id</th>
          <th>Case Type</th>
          <th>Alias</th>
          <th>Status</th>
          <th>Changed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {instances?.map((instance) => {
          return <InstanceRow key={instance._id} instance={instance} actions={actions} />
        })}
      </tbody>
    </table>
  )
}

export default function Instances({ title, subtitle, router, actions = [] }) {
  const [filters, setFilters] = useState({
    caseType: '',
    status: '',
    alias: '',
    search: '',
    orderBy: 'updatedAt',
    orderDirection: 'desc',
  })
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)

  const { data: instances, error } = useSWR(
    `/api/runningInstance/all?${new URLSearchParams(removeEmptyFilters({ ...filters, skip, limit })).toString()}`,
    fetcher
  )
  const { data: caseTypes } = useSWR(`/api/caseModel/all`, fetcher)

  if (error) {
    return <div>Failed to load</div>
  }

  return (
    <div className="mt-4">
      <PageTitle title={title} subtitle={subtitle} />

      <Filters
        filters={filters}
        setFilters={setFilters}
        caseTypes={caseTypes}
        router={router}
        createQueryString={createQueryString}
      />

      {!instances && !error && (
        <div className="">
          <Loading />
        </div>
      )}

      {instances && instances.length === 0 && (
        <div className="alert alert-primary d-flex align-items-center" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          <div>No instances found</div>
        </div>
      )}

      {instances && instances.length > 0 && (
        <InstancesTable instances={instances} actions={actions} />
      )}

      {/* Navigation buttons */}
      {instances && instances.length > 0 && (
        <Pagination
          skip={skip}
          setSkip={setSkip}
          limit={limit}
          setLimit={setLimit}
          numberOfItems={instances.length}
        />
      )}
    </div>
  )
}
