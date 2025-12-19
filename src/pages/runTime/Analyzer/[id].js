import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import Header from '../../../components/Header'
import Loading from '../../../components/Loading'

export default function Page(props) {
  const [analysis, setAnalysis] = useState([])
  const [detail, setDetail] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      setLoading(true)
      setError(false)

      // call api to get the form
      fetch(`/api/runningInstance/form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setDetail(data)
          setLoading(false)
        })
        .catch((err) => {
          console.log(err)
          setError(true)
          setLoading(false)
        })

      // call api to get the analysis
      fetch(`/api/runningInstance/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setAnalysis(data.analysis)
          setLoading(false)
        })
        .catch((err) => {
          console.log(err)
          setError(true)
          setLoading(false)
        })
    }
  }, [id])

  function isAnalyzeble(type) {
    const mapper = {
      string: false,
      boolean: false,
      integer: true,
      decimal: true,
      datetime: false,
    }
    return mapper[type]
  }

  if (loading) {
    return (
      <>
        <Header env="runtime"> </Header>
        <div className="container mt-5">
          <h1 className="h2">Instance Analysis</h1>
          <Loading message="Loading instance analysis..." />
        </div>
      </>
    )
  }

  return (
    <>
      <Header env="runtime"> </Header>
      <div className="container mt-4 mb-4">
        <h1>Instance Analysis</h1>
        <div className="card mb-4" style={{ margin: 0, height: 'auto', padding: 0 }}>
          <div className="card-header">Instance metadata</div>
          <div className="card-body">
            <Text>Instance Id: i-{id}</Text>
            <Text>Alias: {detail.alias || '*****'}</Text>
            <Text>Status: {detail.status || 'N/D'}</Text>
          </div>
        </div>
        <div className="card mb-4" style={{ margin: 0, height: 'auto', padding: 0 }}>
          <div className="card-header">Case Model metadata</div>
          <div className="card-body">
            <Text>Case Id: c-{detail.caseModel?._id}</Text>
            <Text>Case Name: {detail.caseModel?.name || 'N/D'}</Text>
            <Text>Case Description: {detail.caseModel?.description || 'N/D'}</Text>
            <Text>Case Updated: {detail.caseModel?.updatedAt || 'N/D'}</Text>
          </div>
        </div>
        {detail.caseModel?.artifacts?.context?.map((artifact) => {
          return (
            <>
              <div className="card mb-4" style={{ margin: 0, height: 'auto', padding: 0 }}>
                <div className="card-header">{artifact.name}</div>
                <div className="card-body">
                  <Text>Artifact Id: a-{artifact._id}</Text>
                  <Text>Artifact Name: {artifact.name || 'N/D'}</Text>
                  <Text>Artifact Type: {artifact.type || 'N/D'}</Text>
                  <Text>Artifact Description: {artifact.description || 'N/D'}</Text>
                  <Text>Artifact Updated: {artifact.updatedAt || 'N/D'}</Text>

                  <div class="accordion" id="accordionExample">
                    {artifact.items?.map((item, index) => {
                      return (
                        <>
                          <div class="accordion-item">
                            <h2 class="accordion-header">
                              <button
                                class="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={'#collapse' + index + artifact._id}
                                aria-expanded="true"
                                aria-controls={'collapse' + index + artifact._id}
                              >
                                {item.name || 'N/D'} (i-{item._id})
                              </button>
                            </h2>
                            <div
                              id={'collapse' + index + artifact._id}
                              class="accordion-collapse collapse show"
                              data-bs-parent="#accordionExample"
                            >
                              <div class="accordion-body">
                                <strong>
                                  <Text>{item.description || 'N/D'}</Text>
                                  <br />
                                </strong>{' '}
                                {item.attributes?.map((attribute) => {
                                  const analyzebleAvailable = isAnalyzeble(attribute.type)
                                  const attributeAnalysis = analysis?.filter(
                                    (a) => a._id == attribute._id
                                  )[0]
                                  return (
                                    <>
                                      <Text>
                                        {attribute.name || 'N/D'}
                                        {analyzebleAvailable ? ` (${attribute.code})` : ''}:{' '}
                                        {detail.values[attribute._id]}{' '}
                                        {analyzebleAvailable ? attribute.unit : ''}
                                      </Text>

                                      {analyzebleAvailable && (
                                        <>
                                          <Text>
                                            *Normal range of values: between{' '}
                                            {attributeAnalysis?.analysis.normalRangeOfValues.min}{' '}
                                            {' and '}
                                            {
                                              attributeAnalysis?.analysis.normalRangeOfValues.max
                                            }{' '}
                                            {attribute.unit || ''}
                                          </Text>
                                          <Text>
                                            *Analyze:{' '}
                                            {attributeAnalysis?.analysis.result == 'normal' ? (
                                              <span className="text-success">
                                                {attributeAnalysis?.analysis.result}
                                              </span>
                                            ) : (
                                              <span className="text-bg-warning text-light-emphasis px-2">
                                                {attributeAnalysis?.analysis.result}
                                              </span>
                                            )}
                                          </Text>
                                          {attributeAnalysis?.analysis.result != 'normal' && (
                                            <>
                                              <Text>
                                                *Tactics:
                                                {attributeAnalysis?.tactics.length == 0 && ' ---'}
                                              </Text>
                                              {attributeAnalysis?.tactics.map((tactic, index) => (
                                                <Text key={tactic._id}>
                                                  {index + 1}. {tactic.name}
                                                </Text>
                                              ))}
                                            </>
                                          )}
                                        </>
                                      )}

                                      <Text>---------------------</Text>
                                    </>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {/* <Text>
                            {item.name.toUpperCase() || "N/D"} (i-{item._id})
                          </Text> */}
                          {/* <Text>{item.description || "N/D"}</Text> */}
                        </>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )
        })}
        <div class="d-grid gap-2">
          <Link href={`/runTime/Planner/new?idInstance=${id}`}>
            <a class="btn btn-primary btn-lg" role="button">
              Make a Strategic Plan <i class="bi bi-arrow-right"></i>
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}

function Text({ children }) {
  return (
    <div
      style={{
        fontFamily: 'var(--bs-font-monospace)',
      }}
    >
      {children}
    </div>
  )
}
