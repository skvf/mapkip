import { useContext, useEffect, useState } from 'react'
import { FiEdit, FiTrash } from 'react-icons/fi'

import Loading from '../Loading'
import { ToastContext } from '../Toast'
import { createMetricFromApi, deleteMetricFromApi, getMetricsFromApi } from './api'
import MetricEditor from './MetricEditor'

export default function Metric({ idTactic }) {
  const [isLoading, setIsLoading] = useState(true)
  const [metricList, setMetricList] = useState([])
  const [editMetricModal, setEditMetricModal] = useState(null)
  const { dispatchToast } = useContext(ToastContext)

  // on mount, retrieve the metric list from api
  useEffect(() => {
    if (idTactic) {
      async function getMetricList() {
        const response = await getMetricsFromApi(idTactic)
        setMetricList(response)
        setIsLoading(false)
      }
      getMetricList()
    }
  }, [idTactic])

  const addMetricButtonHandler = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    const data = await createMetricFromApi(idTactic)

    if (data.acknowledged) {
      // retrieve the metric list from api
      const response = await getMetricsFromApi(idTactic)
      setMetricList(response)
      dispatchToast('success', 'Metric created')
      setIsLoading(false)
    }
  }

  const deleteMetricButtonHandler = async (e, idMetric) => {
    e.preventDefault()

    setIsLoading(true)

    const data = await deleteMetricFromApi(idMetric)

    if (data.acknowledged) {
      // retrieve the metric list from api
      const response = await getMetricsFromApi(idTactic)
      setMetricList(response)
      dispatchToast('success', 'Metric deleted')
      setIsLoading(false)
    }
  }

  const editMetricButtonHandler = async (e, idMetric) => {
    e.preventDefault()

    const metric = metricList.find((metric) => metric._id === idMetric)
    setEditMetricModal(metric)
    handleClickScroll()
  }

  const handleClickScroll = () => {
    const element = document.getElementById('edit-metric-modal')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return <Loading message="Loading metrics" />
  }

  return (
    <>
      <div className="card-header">
        <span className="h5">Metrics</span>
      </div>
      <div className="card-body">
        {metricList && metricList.length > 0 ? (
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Unit</th>
                <th>Range of Values</th>
                <th>normalRangeOfValues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {metricList.map((metric) => (
                <tr key={metric._id}>
                  <td>
                    <span>{metric.name}</span>
                  </td>
                  <td>
                    <span>{metric.code}</span>
                  </td>
                  <td>
                    <span>{metric.type}</span>
                  </td>
                  <td>{['integer', 'decimal'].includes(metric.type) ? metric.unit : '--'}</td>
                  <td>
                    {['integer', 'decimal'].includes(metric.type)
                      ? `[${metric.rangeOfValues[0]}..
                            ${metric.rangeOfValues[1]}]`
                      : '--'}
                  </td>
                  <td>
                    {['integer', 'decimal'].includes(metric.type)
                      ? `[${metric.normalRangeOfValues[0]}..
                            ${metric.normalRangeOfValues[1]}]`
                      : '--'}
                  </td>
                  <td>
                    <div className="d-flex gap">
                      <button
                        title="Edit"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => {
                          editMetricButtonHandler(e, metric._id)
                        }}
                      >
                        <FiEdit></FiEdit>
                      </button>

                      <button
                        title="Delete"
                        className="btn btn-outline-danger btn-sm"
                        onClick={(e) => {
                          deleteMetricButtonHandler(e, metric._id)
                        }}
                      >
                        <FiTrash></FiTrash>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            <p>No metrics</p>
          </div>
        )}
      </div>
      {
        // if editMetricModal is not null, then show the MetricEditor
        editMetricModal && (
          <div id="edit-metric-modal">
            <MetricEditor
              metric={editMetricModal}
              callbackClose={() => setEditMetricModal(null)}
              callbackOnUpdate={(success, newData) => {
                if (success) {
                  // update the metricList
                  const newAttributeList = metricList.map((metric) => {
                    if (metric._id === newData._id) {
                      return newData
                    }
                    return metric
                  })
                  setMetricList(newAttributeList)
                  dispatchToast('success', 'Metric updated successfully!')
                  setEditMetricModal(null)
                }
              }}
            />
          </div>
        )
      }
      <div className="card-footer">
        <button
          className="btn btn-primary"
          type="submit"
          onClick={(e) => addMetricButtonHandler(e)}
        >
          Add Metrics
        </button>
      </div>
    </>
  )
}
