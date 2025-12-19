import { AiOutlineLoading3Quarters } from 'react-icons/ai'

import styles from './index.module.css'

export default function Loading({ message = 'Loading...', size = 10 }) {
  return (
    <div className={styles.loaderContainer}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{message || 'Loading...'}</span>
      </div>
      {message ? <div>{message}</div> : null}
    </div>
  )
}
