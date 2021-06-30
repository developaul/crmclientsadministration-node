const { Types } = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require("../models/User")
const Product = require("../models/Product")
const Client = require("../models/Client")

const { ObjectId } = Types

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
    },
    getProducts: async () => {
      try{
        const products = await Product.find({})
        console.log("🚀 ~ getProducts: ~ products", products)
        return products
      } catch(error) {
        console.log("🚀 ~ getProducts: ~ error", error)
        throw error
      }
    },
    getProduct: async (_, { id }) => {
      try{
        const productExists = await Product.findById(id)
        if(!productExists) throw new Error('Producto no encontrado')
        return productExists
      } catch(error) {
        console.log("🚀 ~ getProduct: ~ error", error)
        throw error
      }
    },
    getClients: async () => {
      try{
        return await Client.find({})
      } catch(error) {
        console.log("🚀 ~ getClients: ~ error", error)
        throw error
      }
    },
    getClientsBySeller: async (_, {}, ctx) => {
      try {
        const { user } = ctx
        return await Client.find({ seller: ObjectId(user?.id) })  
      } catch(error) {
        console.log("🚀 ~ getClientBySeller: ~ error", error)
        throw error
      }
    },
    getClient: async (_, { id }, ctx) => {
      try {
        const clientExists = await Client.findById(id)
        if(!clientExists) throw new Error('Cliente no encontrado') 

        const { user } = ctx
        if(String(clientExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        return clientExists
      } catch(error) {
        console.log("🚀 ~ getClient: ~ error", error)
        throw error
      }
    }
  },
  Mutation: {
    createUser: async (_, { input }) => {
      try{
        const { email, password } = input

        // Validar si ya esta registrado
        const userExists = await User.findOne({ email })
        if(userExists) throw new Error('El usuario ya esta registrado')
        
        // Hashear su password
        const salt = bcryptjs.genSaltSync(10)
        input.password = bcryptjs.hashSync(password, salt)   
        
        // Save 
        const user = new User(input)
        await user.save()

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
    },
    createProduct: async (_, { input }) => {
      try{
        const newProduct = new Product(input)
        return await newProduct.save()
      } catch(error) {
        console.log("🚀 ~ createProduct: ~ error", error)
        throw error
      }
    },
    updateProduct: async (_, { id, input }) => {
      try{
        let productExists = await Product.findById(id)
        if(!productExists) throw new Error('Producto no encontrado')        
        productExists = await Product.findOneAndUpdate({ _id: ObjectId(id) }, input, { new: true })
        return productExists
      } catch(error) {
        console.log("🚀 ~ updateProduct:async ~ error", error)
        throw error
      }
    },
    deleteProduct: async (_, { id }) => {
      try{
        const productExists = await Product.findById(id)
        if(!productExists) throw new Error('Producto no encontrado')
        await Product.findOneAndDelete({ _id: ObjectId(id) })
        return 'Producto eliminado'
      } catch(error) {
        console.log("🚀 ~ deleteProduct:async ~ error", error)
        throw error
      }
    },
    createClient: async (_, { input }, ctx) => {
      try {
        const { user } = ctx
        const { email } = input

        const clientExists = await Client.findOne({ email })
        if(clientExists) throw new Error('Ese cliente ya esta registrado')

        input.seller = ObjectId(user?.id)
        const client = new Client(input)

        return await client.save()
      } catch(error) {
        console.log("🚀 ~ createClient:async ~ error", error)
        throw error
      }
    },
    updateClient: async (_, { id, input }, ctx) => {
      try {
        let clientExists = await Client.findById(id)
        if(!clientExists) throw new Error('Cliente no encontrado')

        const { user } = ctx
        if(String(clientExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        clientExists = await Client.findOneAndUpdate({_id: ObjectId(id)}, input, { new: true })
        return clientExists
      } catch(error) {
        console.log("🚀 ~ updateClient: ~ error", error)
        throw error
      }
    },
    deleteClient: async (_, { id }, ctx) => {
      try {
        let clientExists = await Client.findById(id)
        if(!clientExists) throw new Error('Cliente no encontrado')

        const { user } = ctx
        if(String(clientExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        await Client.findOneAndDelete({ _id: ObjectId(id) })
        return 'Cliente eliminado'
      } catch (error) {
        console.log("🚀 ~ deleteClient: ~ error", error)
        throw error
      }
    }
  }
}

module.exports = resolvers