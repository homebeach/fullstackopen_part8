import React from 'react';
import { gql, useQuery } from '@apollo/client';

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) { 
      title 
      author {
        name
      }
      published 
    }
  }
`;

const Recommendations = (props) => {
  const favoriteGenre = localStorage.getItem('favoriteGenre');
  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre }
  });

  if (!props.show) {
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const books = data.allBooks;

  return (
    <div>
      <h2>Books</h2>
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
