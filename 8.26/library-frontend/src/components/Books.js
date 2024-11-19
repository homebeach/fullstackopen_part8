import React, { useState, useEffect } from 'react';

const extractGenres = (books) => {
  if (!books) {
    console.error("Books data is undefined or null.");
    return []; // Return an empty array or handle the error as appropriate
  }

  const genresSet = new Set();

  books.forEach((book) => {
    if (book && book.genres && Array.isArray(book.genres)) {
      book.genres.forEach((genre) => {
        genresSet.add(genre);
      });
    }
  });

  return Array.from(genresSet);
};

const Books = ({ books, show }) => {
  const [selectedGenre, setSelectedGenre] = useState("all genres");
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    // Assuming you have a function to extract genres from the list of books
    const extractedGenres = extractGenres(books);
    setGenres(["all genres", ...extractedGenres]);
  }, [books]);

  if (!show) {
    return null;
  }

  const handleGenreChange = async (e) => {
    const selectedGenre = e.target.value;
    setSelectedGenre(selectedGenre);
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
          {books.map((book, index) => (
            <tr key={index}>
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
