import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Header from '../../../../components/Header'
import Step from '../../../../components/Step'

export default function StepEditor(props) {
  const [data, setData] = useState(null)
  const router = useRouter()
  const { idStep } = router.query

  // get step data from API
  useEffect(() => {
    if (idStep) {
      const fetchData = async () => {
        const response = await fetch(`/api/step/retrieve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: idStep }),
        })

        const data = await response.json()
        setData(data)
      }

      fetchData()
    }
  }, [idStep])

  return (
    <>
      <Head>
        <title>Step Editor</title>
      </Head>
      <Header env="modeling"> </Header>
      <main className="container my-4">
        <h2>Step Editor</h2>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <Link href="/">
                <a>Home</a>
              </Link>
            </li>
            <li class="breadcrumb-item">
              <Link href="/modeling">
                <a>Modeling</a>
              </Link>
            </li>
            <li class="breadcrumb-item">
              <Link href={`/modeling/CaseModeler/${data?.caseModel?._id}`}>
                <a>Case Model: {data?.caseModel?.name}</a>
              </Link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              <Link href={`/modeling/CaseModeler/TacticEditor?idTactic=${data?.tactic?._id}`}>
                <a>Tactic: {data?.tactic?.name}</a>
              </Link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Step: {data?.description}
            </li>
          </ol>
        </nav>
        <Step idStep={idStep}></Step>
      </main>
    </>
  )
}
