const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');


const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author') // Assuming you have Author model defined in './models/author'
const Book = require('./models/book') // Assuming you have Book model defined in './models/book'
const User = require('./models/user') // Assuming you have Book model defined in './models/book'

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
    born: Int,
    bookCount: Int
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
    bookCount: async () => {
      try {
        return await Book.countDocuments();
      } catch (error) {
        throw new GraphQLError('An error occurred while fetching book count');
      }
    },
    authorCount: async () => {
      try {
        return await Author.countDocuments();
      } catch (error) {
        throw new GraphQLError('An error occurred while fetching author count');
      }
    },
    allBooks: async (parent, args) => {
      try {
        let filter = {};
        if (args.author) {
          const author = await Author.findOne({ name: args.author });
          if (author) {
            filter.author = author._id;
          } else {
            return [];
          }
        }
        if (args.genre) {
          filter.genres = args.genre;
        }
        return await Book.find(filter).populate('author');
      } catch (error) {
        throw new GraphQLError('An error occurred while fetching books');
      }
    },
    allGenres: async () => {
      try {
        const distinctGenres = await Book.distinct("genres");
        return distinctGenres;
      } catch (error) {
        throw new GraphQLError('An error occurred while fetching genres');
      }
    },
    allAuthors: async () => {
      try {
        return await Author.find();
      } catch (error) {
        throw new GraphQLError('An error occurred while fetching authors');
      }
    }
  },
  Author: {
    bookCount: async (parent) => {
      try {
        return await Book.countDocuments({ author: parent._id });
      } catch (error) {
        throw new GraphQLError('An error occurred while fetching book count for author');
      }
    }
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
  
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
        favoriteGenre: user.favoriteGenre // Include favoriteGenre
      };

      return { 
        token: jwt.sign(userForToken, process.env.SECRET),
        favoriteGenre: user.favoriteGenre // Include favoriteGenre
      };
    },
    addBook: async (root, args, context) => {
      try {
        const currentUser = context.currentUser

        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }

        let author = await Author.findOne({ name: args.author });
        if (!author) {
          author = new Author({ name: args.author });
          await author.save();
        }
        const book = new Book({ ...args, author });
        await book.save();
        return book;
      } catch (error) {
        throw new GraphQLError('An error occurred while adding a book');
      }
    },
    addAuthor: async (root, args) => {
      try {
        const authorExists = await Author.findOne({ name: args.name });
        if (authorExists) {
          throw new GraphQLError('Author already exists');
        }
        const newAuthor = new Author({ ...args });
        return await newAuthor.save();
      } catch (error) {
        throw new GraphQLError('An error occurred while adding an author');
      }
    },
    editAuthor:  async (root, args, context) => {
      try {
        const currentUser = context.currentUser

        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }

        const author = await Author.findOneAndUpdate({ name: args.name }, { born: args.setBornTo }, { new: true });
        if (!author) {
          throw new GraphQLError('Author not found');
        }

        return author;
      } catch (error) {
        throw new GraphQLError('An error occurred while editing an author');
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },

  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})