const { ApolloServer } = require('apollo-server')
const connectDB = require('./config/db')
const resolvers = require('./db/resolvers')
const typeDefs = require('./db/schema')

// Conectar a la Base de datos
connectDB()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const micontext = 'hi'
    return {
      micontext
    }
  }
})

server.listen().then(({url}) => {
  console.log(`Servidor listo en ${url}`)
})