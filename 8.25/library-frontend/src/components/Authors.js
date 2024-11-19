import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Select from 'react-select';

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`;

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [born, setBorn] = useState('');
  const [isLoggedIn] = useState(!!localStorage.getItem('token')); // Check if user is logged in

  const submit = async (event) => {
    event.preventDefault();

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      // Include the token in the request headers
      const headers = {
        authorization: token ? `Bearer ${token}` : '',
      };

      const response = await editAuthor({
        variables: { name: selectedAuthor.value, setBornTo: parseInt(born) },
        context: {
          headers,
        },
      });

      console.log('Edit author response:', response);
      setSelectedAuthor(null);
      setBorn('');
    } catch (error) {
      console.error('Edit author error:', error);
    }
  };

  if (!props.show) {
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const authors = data?.allAuthors || [];
  
  const authorOptions = authors.map(author => ({
    value: author.name,
    label: author.name
  }));

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
          {authors.map((author) => (
            <tr key={author.name}>
              <td>{author.name}</td>
              <td>{author.born}</td>
              <td>{author.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {isLoggedIn && ( // Render edit author form only if logged in
        <div>
          <form onSubmit={submit}>
            <div>
              <Select
                value={selectedAuthor}
                onChange={setSelectedAuthor}
                options={authorOptions}
                placeholder="Select author"
              />
            </div>
            <div>
              Born
              <input
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">Edit author</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Authors;