import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { FiExternalLink, FiPlay } from 'react-icons/fi'

import useSWR from 'swr'
import Comments from '../../../../components/Comments'
import Header from '../../../../components/Header'
import Loading from '../../../../components/Loading'
import PageTitle from '../../../../components/PageTitle'
import usePlanner from '../../../../hooks/usePlanner'

const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false })

export default function Page() {
  const [defaults, setDefaults] = useState(null)

  const {
    query: { id: idPlanner },
  } = useRouter()

  const { planner, isFinished, isLoading, isError, mutatePlanner } = usePlanner(idPlanner, {
    isRealTime: true,
  })

  const {
    data: comments,
    error: commentsError,
    mutate: mutateComments,
  } = useSWR(
    idPlanner ? ['/api/comment/all', { idPlanner }] : null,
    async (url, body) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      return data
    },
    { refreshInterval: 1000 }
  )

  const isLoadingComments = !comments && !commentsError

  const handleSendComment = useCallback(
    (text) => {
      const data = {
        idPlanner,
        text,
      }
      mutateComments(
        [
          ...comments,
          {
            ...data,
            // format date 2025-11-09 23:08:09
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            _id: Math.random().toString(36).substr(2, 9),
          },
        ],
        false
      ) // Optimistic update
      fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          mutateComments([...comments, data])
        })
        .catch((error) => {
          console.error('Error creating comment:', error)
          alert('Error creating comment: ' + error.message)
        })
    },
    [idPlanner, comments, mutateComments]
  )

  useEffect(() => {
    const { innerWidth, innerHeight } = window

    const defs = {
      height: Math.floor(innerHeight * 1),
      width: Math.floor(innerWidth * 0.75),
      scale: 1,
      tweenPrecision: 1,
      engine: 'dot',
      keyMode: 'title',
      convertEqualSidedPolygons: false,
      fade: false,
      growEnteringEdges: false,
      fit: true,
      tweenPaths: false,
      tweenShapes: false,
      useWorker: false,
      zoom: true,
    }

    setDefaults(defs)
  }, [])

  const mapper = {
    CREATED: 'var(--bs-warning)',
    on_queue: 'var(--bs-info)',
    error: 'var(--bs-danger)',
    completed: 'var(--bs-success)',
    not_started: 'var(--bs-secondary)',
  }

  if (isLoading || isLoadingComments) {
    return <Loading message="Loading planner data..." />
  }

  return (
    <Suspense fallback={<div>carregando...</div>}>
      <Header env="runtime" />
      <div className="container mt-4 mb-4">
        {isFinished ? (
          <PageTitle title={`Plan Id: E-${idPlanner}`} subtitle="Planner Execution Details" />
        ) : (
          <PageTitle
            title="Synthesize a Plan"
            subtitle="Here you can execute the created MDP Planning Model on PRISM which produce an optimal planbased on the selected criteria."
          />
        )}

        {isError && (
          <div className="alert alert-danger" role="alert">
            An error occurred while fetching the planner data.
          </div>
        )}

        <div className="row">
          <div className="col-8">
            {planner && (
              <div className="card mt-4 mb-4">
                <div className="card-header">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title">Plan</h5>
                    <div>
                      {planner.status === 'not_started' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            mutatePlanner({ ...planner, status: 'on_queue' })
                            async function executePlanner() {
                              const response = await fetch(`/api/planner/execute`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ _id: planner._id }),
                              })
                              const data = await response.json()
                              mutatePlanner({ ...data })
                            }
                            executePlanner()
                          }}
                        >
                          Synthesize a Plan
                          <FiPlay />
                        </button>
                      )}
                      {planner.status === 'on_queue' && (
                        <div class="spinner-border spinner-border-sm" role="status"></div>
                      )}
                      {isFinished && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm mx-1"
                            data-bs-toggle="modal"
                            data-bs-target="#plannerGraphModal"
                          >
                            Open the generated plan (State Graph){' '}
                            <i className="bi bi-diagram-3"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#plannerLogModal"
                          >
                            Open Planner Log (PRISM Log) <i className="bi bi-file-earmark-text"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p>
                    Case Instance Id:
                    <Link href={`/runTime/Instance/${planner.idInstance}/view`}>
                      <a className="btn btn-sm">
                        I-{planner.idInstance} <FiExternalLink />
                      </a>
                    </Link>
                  </p>
                  <p>
                    Plan Id: <code className="fs-6">E-{planner._id}</code>
                  </p>
                  <p>
                    Plan Status{' '}
                    <span
                      className="badge badge-pill badge-info"
                      style={{
                        backgroundColor: mapper[planner.status],
                      }}
                    >
                      {planner.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  <p>
                    Created At:{' '}
                    {new Date(planner.createdAt).toLocaleString('pt-BR', {
                      timeZone: 'UTC',
                    })}
                  </p>
                </div>
              </div>
            )}

            {isFinished && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title">Execution Details</h5>
                </div>

                <div className="card-body">
                  <p>
                    Execution Time:{' '}
                    {planner.executionTime ? `${planner.executionTime} ms` : 'Not executed yet'}
                  </p>
                  <p>
                    <pre style={{ fontSize: 12 }}>{planner.mdpText}</pre>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="col-4  mt-4 mb-4">
            <Comments messages={comments} onSend={handleSendComment} title="Comments" />
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="plannerGraphModal"
        tabIndex="-1"
        aria-labelledby="plannerGraphModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="plannerGraphModalLabel">
                Planner Execution
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {planner && planner.output && planner.output.graph && (
                <div>
                  <Graphviz dot={planner.output.graph} options={defaults} />
                </div>
              )}
              {!planner || !planner.output || !planner.output.graph ? (
                <div className="alert alert-warning" role="alert">
                  No graph data available.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="plannerLogModal"
        tabIndex="-1"
        aria-labelledby="plannerLogModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="plannerLogModalLabel">
                Planner Execution Log
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {planner && planner.output && planner.output.log && (
                <pre
                  style={{
                    backgroundColor: 'var(--bs-dark)',
                    color: 'var(--bs-light)',
                    padding: '1rem',
                    borderRadius: '0.25rem',
                    overflow: 'auto',
                  }}
                >
                  {planner.output.log}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
