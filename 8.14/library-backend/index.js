const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author') // Assuming you have Author model defined in './models/author'
const Book = require('./models/book') // Assuming you have Book model defined in './models/book'

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
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
    born: Int,
    bookCount: Int
  }
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
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
`

const resolvers = {
  Query: {
    bookCount: async () => await Book.countDocuments(),
    authorCount: async () => await Author.countDocuments(),
    allBooks: async (parent, args) => {
      let filter = {};
      if (args.author) {
        // Find the author by their name
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id; // Use the author's ObjectId to filter books
        } 
        else {
          // If author is not found, return an empty array of books
          return [];
        }
      }
      if (args.genre) {
        filter.genres = args.genre;
      }
      return await Book.find(filter).populate('author');
    },
    allAuthors: async () => await Author.find()
  },
  Author: {
    bookCount: async (parent) => await Book.countDocuments({ author: parent._id })
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });
    
      if (!author) {
        // If the author doesn't exist, create a new one
        author = new Author({ name: args.author });
        await author.save();
      }
    
      // Create the book using the found or newly created author's ID
      const book = new Book({ ...args, author });
      await book.save();
      
      return book;
    },    
    addAuthor: async (root, args) => {
      const authorExists = await Author.findOne({ name: args.name });
      if (authorExists) {
        throw new Error('Author already exists');
      }
      const newAuthor = new Author({ ...args });
      return await newAuthor.save();
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOneAndUpdate({ name: args.name }, { born: args.setBornTo }, { new: true });
      if (!author) {
        throw new Error('Author not found');
      }
      return author;
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
