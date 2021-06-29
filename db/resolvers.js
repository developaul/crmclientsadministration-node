const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require("../models/User")


const generateToken = (user, secretWord, expiresIn) => {
  const { id, email, name, lastName } = user
  return jwt.sign({ id, email, name, lastName }, secretWord, { expiresIn })
}


// ctx es un objeto que se comparte con todos los resolvers

const resolvers = {
  Query: {
    getUser: async (_, { token }) => {
      try{
        const user = jwt.verify(token, process.env.SECRET_WORD)
        return user
      } catch(error) {
        console.log("🚀 ~ getUser: ~ error", error)
        throw error
      }
    }
  },
  Mutation: {
    createUser: async (_, { input }) => {
      try{
        const { email, password } = input

        // Validar si ya esta registrado
        const userExists = await User.findOne({ email }).lean()
        if(userExists) throw new Error('El usuario ya esta registrado')
        
        // Hashear su password
        const salt = bcryptjs.genSaltSync(10)
        input.password = bcryptjs.hashSync(password, salt)   
        
        // Save 
        const user = new User(input)
        user.save()

        return user
      } catch(error) {
        console.log("🚀 ~ createUser: ~ error", error)
        throw error
      }
    },
    authenticateUser: async (_, { input }) => {
      try{
        // Verificar que el usuario exista
        const { email, password } = input
        const userExists = await User
        .findOne({ email })
        // .lean()
        if(!userExists) throw new Error('Email o password incorrecto')

        // Verificar el password
        const isCorrectPassword = bcryptjs.compareSync(password, userExists.password)
        if(!isCorrectPassword) throw new Error('Email o password incorrecto')

        // Generar token
        return {
          token: generateToken(userExists, process.env.SECRET_WORD, '24h')
        }

      } catch(error) {
        console.log("🚀 ~ authenticateUser: ~ error", error)
        throw error
      }
    }
  }
}

module.exports = resolvers