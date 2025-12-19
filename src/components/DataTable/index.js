import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

export function Pagination({ skip, setSkip, limit, setLimit, numberOfItems }) {
  return (
    <div className="d-flex justify-content-between mb-4">
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={skip === 0}
        onClick={() => setSkip(Math.max(0, skip - limit))}
      >
        <FiArrowLeft /> Previous
      </button>

      <p className="align-self-center mb-0">
        Page {Math.floor(skip / limit) + 1}
        <select
          className="form-select d-inline-block w-auto mx-2 cursor-pointer"
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value))
            setSkip(0)
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </p>

      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={numberOfItems < limit}
        onClick={() => setSkip(skip + limit)}
      >
        Next <FiArrowRight />
      </button>
    </div>
  )
}
