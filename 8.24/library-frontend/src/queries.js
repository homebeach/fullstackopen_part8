import { gql } from '@apollo/client'

export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author {
      name
    }
    published
    genres
  }
`;

export const CREATE_BOOK = gql`
  mutation AddBook($title: String!, $author: AuthorInput!, $published: Int!, $genres: [String!]!) {
    addBook(title: $title, author: $author, published: $published, genres: $genres) {
      title
      published
      author {
        name
      }
      genres
    }
  }
`;


export const ALL_BOOKS = gql`
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

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

export const ALL_GENRES = gql`
  query {
    allGenres
  }
`;


export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`