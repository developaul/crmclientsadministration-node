const { ApolloServer } = require('apollo-server')
const jwt = require('jsonwebtoken')
const connectDB = require('./config/db')
const resolvers = require('./db/resolvers')
const typeDefs = require('./db/schema')

// Conectar a la Base de datos
connectDB()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    try{
      const token = req.headers['authorization'] || ''
      if(token) {
        const user = jwt.verify(token, process.env.SECRET_WORD)
        return {
          user
        }
      }
    } catch(error) {
      console.log("🚀 ~ error", error)
      throw error
    }
  }
})

server.listen().then(({url}) => {
  console.log(`Servidor listo en ${url}`)
})