import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

async function createUser(email, password) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong!')
  }

  return data
}

function AuthForm() {
  const emailInputRef = useRef()
  const passwordInputRef = useRef()

  const [isLogin, setIsLogin] = useState(true)
  const [errors, setErrors] = useState([])
  const router = useRouter()

  function switchAuthModeHandler() {
    setIsLogin((prevState) => !prevState)
  }

  async function submitHandler(event) {
    event.preventDefault()

    const enteredEmail = emailInputRef.current.value
    const enteredPassword = passwordInputRef.current.value

    // optional: Add validation

    if (isLogin) {
      const result = await signIn('credentials', {
        redirect: false,
        email: enteredEmail,
        password: enteredPassword,
      })

      if (!result.error) {
        // set some auth state
        router.replace('/')
      } else {
        const newError = [...errors]
        newError.push(result.error)
        setErrors(newError)
      }
    } else {
      try {
        const result = await createUser(enteredEmail, enteredPassword)
        console.log(result)
      } catch (error) {
        const newErrors = [...errors]
        newErrors.push(error.message)
        setErrors(newErrors)

        console.log(error)
      }
    }
  }

  return (
    <section className="container">
      <div class="row align-items-center">
        <div class="col-md-4 offset-md-4">
          <h1 className="text-center">{isLogin ? 'Login' : 'Sign Up'}</h1>
          <form onSubmit={submitHandler} style={{ padding: '2rem' }}>
            <div className="input-group input-group-md mb-3">
              <span className="input-group-text" id="inputGroup-sizing-md">
                E-mail
              </span>
              <input
                type="email"
                id="email"
                required
                ref={emailInputRef}
                className="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-md"
              />
            </div>
            <div className="input-group input-group-md mb-3">
              <span className="input-group-text" id="inputGroup-sizing-md">
                Password
              </span>
              <input
                type="password"
                id="password"
                required
                ref={passwordInputRef}
                className="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-md"
              />
            </div>
            <div className="text-center">
              <button className="btn btn-primary">{isLogin ? 'Login' : 'Create Account'}</button>
            </div>
            <div className="text-center">
              <button className="btn btn-light" type="button" onClick={switchAuthModeHandler}>
                {isLogin ? 'Create new account' : 'Login with existing account'}
              </button>
            </div>
          </form>
          <div>
            {errors.map((e) => (
              <div key={e} className="alert alert-danger" role="alert">
                {e}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthForm
