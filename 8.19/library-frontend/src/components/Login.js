import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      value
    }
  }
`

const Login = ({ show, isLoggedIn, setIsLoggedIn }) => { // Receive isLoggedIn and setIsLoggedIn as props
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const [login] = useMutation(LOGIN);

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    try {
      const { data } = await login({ variables: { username, password } })

      if (data && data.login && data.login.value) {
        localStorage.setItem('token', data.login.value);
        setIsLoggedIn(true); // Set login status to true
        setUsername('')
        setPassword('')
        setError(null)
      }
    } catch (error) {
      setError('Wrong username or password. Please try again.');
    }
  }

  return (
    <div>
      {isLoggedIn ? (
        <div>
          Logged in. {/* Display a message indicating the user is logged in */}
        </div>
      ) : (
        <div>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <form onSubmit={submit}>
            <div>
              username
              <input
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </div>
            <div>
              password
              <input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
            
            <button type="submit">login</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Login
