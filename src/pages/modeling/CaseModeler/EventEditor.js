import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Header from '../../../components/Header'
import Event from '../../../components/Event'

export default function EventEditor(props) {
  const [data, setData] = useState(null)
  const router = useRouter()
  const { idEvent } = router.query

  // get event data from API
  useEffect(() => {
    if (idEvent) {
      const fetchData = async () => {
        const response = await fetch(`/api/event/retrieve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: idEvent }),
        })

        const data = await response.json()
        setData(data)
      }

      fetchData()
    }
  }, [idEvent])

  return (
    <>
      <Head>
        <title>Event Editor</title>
      </Head>
      <Header env="modeling"> </Header>
      <main className="container my-4">
        <h2>Event Editor</h2>
        {data && (
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
                Event: {data?.description}
              </li>
            </ol>
          </nav>
        )}
        <Event idEvent={idEvent}></Event>
      </main>
    </>
  )
}
