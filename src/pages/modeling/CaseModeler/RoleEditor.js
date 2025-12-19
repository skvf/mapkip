import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import Header from '../../../components/Header'
import Role from '../../../components/Role'

export default function Roles(props) {
  //useRouter returns the router, an object that contains
  const router = useRouter()

  // router.query returns the  dynamic route parameter of the idRole
  const { idRole } = router.query

  // get the role information (name, description) or an error
  const { data: role, error } = useSWR(['/api/role/retrieve', idRole], getRoleById)

  // To get the case Model
  async function getRoleById(url, id) {
    const request = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: id,
      }),
    })

    return await request.json()
  }

  return (
    <>
      <Head>
        <title>Role Editor</title>
      </Head>
      <Header env="modeling"> </Header>
      <section className="container">
        <h2>Role Editor</h2>
        {role && (
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
                <Link href={`/modeling/CaseModeler/${role.idCaseModel}`}>
                  <a>Case Model: {role.caseModel.name} </a>
                </Link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Role: {role.name}
              </li>
            </ol>
          </nav>
        )}

        <Role idRole={idRole}></Role>
      </section>
    </>
  )
}
