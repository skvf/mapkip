import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import logo from './../../../public/images/MapKiP.png'
import styles from './styles.module.scss'

export default function Header(props) {
  const { data: session } = useSession()

  const router = useRouter()

  const environment = props.env

  let itemList = []

  if (environment == 'home') {
    itemList = [
      {
        url: '/',
        name: 'Home',
      },
      {
        url: '/modeling',
        name: 'Modeling Enviroment',
      },
      {
        url: '/runTime',
        name: 'RunTime Enviroment',
      },
    ]
  }
  if (environment == 'modeling') {
    itemList = [
      {
        url: '/modeling',
        name: 'Home',
      },
    ]
  }
  if (environment == 'runtime') {
    itemList = [
      {
        url: '/runTime',
        name: 'Instance Manager',
      },
      {
        url: '/runTime/Monitor',
        name: 'Monitor',
      },
      {
        url: '/runTime/Analyzer',
        name: 'Analyzer',
      },
      {
        url: '/runTime/Planner',
        name: 'Planner',
      },
      {
        url: '/runTime/Executor/list',
        name: 'Executor',
      },
    ]
  }
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link href="/">
            <a className="navbar-brand d-flex align-items-center gap-1">
              <Image
                className="d-inline-block align-text-top"
                src={logo}
                alt="Logo do sistema"
                width={32}
                height={32}
              />
              MAPKIP
            </a>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {itemList.map((i) => {
                return (
                  <li className="nav-item" key={i.url}>
                    <Link href={i.url}>
                      <a className="nav-link">{i.name}</a>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
          {/* Botão para alternar ambiente */}
          {environment !== 'home' && (
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => {
                // push url
                router.push(environment === 'modeling' ? '/runTime' : '/modeling')
              }}
            >
              Switch to {environment === 'modeling' ? 'Runtime' : 'Modeling'}{' '}
              <i className="bi bi-arrow-down-up"></i>
            </button>
          )}
          <button className={styles.signInButton}>
            {!session ? (
              <Link href="/auth">
                <a className="nav-link">Sign in / Sign up</a>
              </Link>
            ) : (
              <Link href="/profile">
                <a className="nav-link">{session.user.email}</a>
              </Link>
            )}
          </button>
        </div>
      </nav>
    </>
  )
}
