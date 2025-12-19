import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { FiAlertTriangle, FiCheck, FiFrown, FiInfo } from 'react-icons/fi'

export const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toastes, setToast] = useState([])

  const dispatchToast = (type, message) => {
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }
    const id =
      (Math.random() + 1).toString(36).substring(7) + (Math.random() + 1).toString(36).substring(7)

    const title = capitalizeFirstLetter(type)
    setToast([...toastes, { id, title, type, message }])
  }

  return (
    <ToastContext.Provider value={{ toastes, setToast, dispatchToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const Toast = () => {
  const { toastes, setToast } = useContext(ToastContext)
  const timersRef = useRef({})

  useEffect(() => {
    const currentIds = new Set(toastes.map((t) => t.id))

    // create timers only for newly added toasts
    toastes.forEach((toast) => {
      if (!timersRef.current[toast.id]) {
        timersRef.current[toast.id] = setTimeout(() => {
          setToast((prev) => prev.filter((t) => t.id !== toast.id))
          delete timersRef.current[toast.id]
        }, 5000)
      }
    })

    // clear timers for toasts that were removed
    Object.keys(timersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timersRef.current[id])
        delete timersRef.current[id]
      }
    })

    // cleanup all timers on unmount
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer))
      timersRef.current = {}
    }
  }, [toastes, setToast])

  return (
    <div className="toast-container position-fixed top-0 end-0 p-5">
      {toastes &&
        toastes.length > 0 &&
        toastes.map((toast) => (
          <div
            key={toast.id}
            style={{ backgroundColor: 'white' }}
            className="toast show"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className={`toast-header bg-${toast.type} text-white`}>
              <div style={{ marginRight: '.5rem' }}>
                {toast.type === 'success' && <FiCheck size={20} />}
                {toast.type === 'danger' && <FiFrown size={20} />}
                {toast.type === 'warning' && <FiAlertTriangle size={20} />}
                {toast.type === 'info' && <FiInfo size={20} />}
              </div>
              <strong className="me-auto text-capitalize">{toast.type}</strong>
              <small></small>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="toast"
                aria-label="Close"
                onClick={(e) => {
                  e.preventDefault()
                  setToast(toastes.filter((t) => t.id !== toast.id))
                }}
              ></button>
            </div>
            <div className="toast-body">{toast.message}</div>
          </div>
        ))}
    </div>
  )
}
