import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'


const App = () => {
  const [page, setPage] = useState('authors')
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  const handleLogout = () => {
    // Perform logout actions here, such as removing the token from localStorage
    localStorage.removeItem('token');
    setIsLoggedIn(false); // Update login status to false
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {isLoggedIn && <button onClick={() => setPage('add')}>add book</button>} {/* Render only if logged in */}
        {isLoggedIn ? (
          <button onClick={handleLogout}>logout</button>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      {isLoggedIn && <NewBook show={page === 'add'} />} {/* Render only if logged in */}
      
      <Login show={page === 'login'} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> {/* Pass login status and setter */}
    </div>
  )
}

export default App
