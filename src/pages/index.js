import Link from 'next/link'

import styles from '../../styles/Home.module.scss'
import Header from '../components/Header'

export default function Home() {
  return (
    <div>
      <Header env="home"> </Header>

      <main className="container">
        <h1 className={styles.title}>
          Modeling, Analyzing, and Planning Knowledge-intensive Process (MAPKIP)
        </h1>

        <p className={styles.description}>
          This tool was developed to model Knowledge-Intensive Processes (KiPs) using a data-driven
          approach. It offers a comprehensive modeling environment that supports both the creation
          of case models and the planning of case instances.
        </p>
        <p className={styles.description}>
          The solution is structured into two modeling environments: a design-time modeling
          environment for building case models and a runtime modeling environment for instantiating
          and managing case instances. The runtime modeling environment helps to coordinate the the
          course of action of case instances based on their unique and evolving contexts.
        </p>

        <p className={styles.description}>
          To support decision-making, the tool leverages Markov Decision Processes (MDPs) to
          generate strategic plans aimed at achieving specific goals. These plans assist knowledge
          workers by providing guidance tailored to the current situation, and by helping them
          anticipate and assess the risks associated with their decisions.
        </p>

        <div className="row my-5">
          <div className="col">
            <Link href="/modeling">
              <a>
                <div className="card" style={{ padding: '1.5rem 0' }}>
                  <div className="card-body">
                    <h3 className="card-title">Design-time Modeling Environment &rarr;</h3>
                    <p className="card-text">
                      Define case models based on the METAKIP metamodel specification.
                    </p>
                  </div>
                </div>
              </a>
            </Link>
          </div>

          <div className="col">
            <Link href="/runTime">
              <a>
                <div className="card" style={{ padding: '1.5rem 0' }}>
                  <div className="card-body">
                    <h3 className="card-title">Runtime Environment &rarr;</h3>
                    <p className="card-text">
                      Instantiate, monitor, analyze, and plan the course of action for case
                      instances.
                    </p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
