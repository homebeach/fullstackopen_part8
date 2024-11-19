const { GraphQLError } = require('graphql');
const Author = require('./models/author'); // Assuming you have Author model defined in './models/author'
const Book = require('./models/book'); // Assuming you have Book model defined in './models/book'
const User = require('./models/user'); // Assuming you have Book model defined in './models/book'
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const jwt = require('jsonwebtoken')

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
          console.log("addBook")
          console.log("addBook1")
          const currentUser = context.currentUser
          console.log("addBook2")
      
          if (!currentUser) {
            throw new GraphQLError('not authenticated', {
              extensions: {
                code: 'BAD_USER_INPUT',
              }
            })
          }
          console.log(3)
      
          let author = await Author.findOne({ name: args.author.name });
          console.log("author")
          console.log(author)
      
          if (!author) {
            author = new Author({ name: args.author.name });
            console.log("new author")
            console.log(author)
            await author.save();
          }
      
          console.log(5)
          console.log("author of the new book")
          console.log(author)
      
          const book = new Book({ ...args, author: author._id });
          console.log("about to save")
          await book.save();
          console.log(6)
      
          pubsub.publish('BOOK_ADDED', { bookAdded: book })
          console.log(7)
          console.log(book)
      
          // Ensure that the author object returned includes the 'name' field
          return { ...book.toObject(), author: { ...author.toObject(), name: args.author.name } };
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
    },
    Subscription: {
        bookAdded: {
          subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        },
    }
  }

  module.exports = resolvers