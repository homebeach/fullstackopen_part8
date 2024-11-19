import React, { useState, useEffect } from 'react';
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

const ALL_GENRES = gql`
  query {
    allGenres
  }
`;

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState("all genres");
  const { loading: genreLoading, error: genreError, data: genreData } = useQuery(ALL_GENRES);
  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre === "all genres" ? null : selectedGenre },
  });

  useEffect(() => {
    if (genreData && genreData.allGenres) {
      // Update the genre dropdown options with the fetched genres
      setGenres(["all genres", ...genreData.allGenres]);
    }
  }, [genreData]);

  const [genres, setGenres] = useState([]);

  if (!props.show) {
    return null;
  }

  if (genreLoading) return <p>Loading genres...</p>;
  if (genreError) return <p>Error: {genreError.message}</p>;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const books = data.allBooks;

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  return (
    <div>
      <h2>Books</h2>
      <label htmlFor="genre">Choose a genre:</label>
      <select id="genre" value={selectedGenre} onChange={handleGenreChange}>
        {genres.map((genre, index) => (
          <option key={index} value={genre}>{genre}</option>
        ))}
      </select>
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

export default Books;
