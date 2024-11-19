const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }
  
  type Token {
    token: String!
    favoriteGenre: String!
  }  
  
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  input AuthorInput {
    name: String!
  }
  
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allGenres: [String!]!
    allAuthors: [Author!]!
  }
  
  type Mutation {
    createUser(
      username: String!
      favoriteGenre: String
    ): User

    login(
      username: String!
      password: String!
    ): Token

    addBook(
      title: String!
      author: AuthorInput!
      published: Int!
      genres: [String!]!
    ): Book!

    addAuthor(
      name: String!
    ): Author

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
  
  type Subscription {
    bookAdded: Book!
  }
`
module.exports = typeDefs