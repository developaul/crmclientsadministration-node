const { Types } = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require("../models/User")
const Product = require("../models/Product")
const Client = require("../models/Client")
const Order = require('../models/Order')

const { ObjectId } = Types

const generateToken = (user, secretWord, expiresIn) => {
  const { id, email, name, lastName } = user
  return jwt.sign({ id, email, name, lastName }, secretWord, { expiresIn })
}

const resolvers = {
  Query: {
    getUser: async (_, { }, ctx) => {
      try {
        const { user } = ctx
        return user
      } catch (error) {
        console.log("🚀 ~ getUser: ~ error", error)
        throw error
      }
    },
    getProducts: async () => {
      try {
        const products = await Product.find({})
        return products
      } catch (error) {
        console.log("🚀 ~ getProducts: ~ error", error)
        throw error
      }
    },
    getProduct: async (_, { id }) => {
      try {
        const productExists = await Product.findById(id)
        if (!productExists) throw new Error('Producto no encontrado')
        return productExists
      } catch (error) {
        console.log("🚀 ~ getProduct: ~ error", error)
        throw error
      }
    },
    getClients: async () => {
      try {
        return await Client.find({})
      } catch (error) {
        console.log("🚀 ~ getClients: ~ error", error)
        throw error
      }
    },
    getClientsBySeller: async (_, { }, ctx) => {
      try {
        const { user } = ctx
        return await Client.find({ seller: ObjectId(user?.id) })
      } catch (error) {
        console.log("🚀 ~ getClientBySeller: ~ error", error)
        throw error
      }
    },
    getClient: async (_, { id }, ctx) => {
      try {
        const clientExists = await Client.findById(id)
        if (!clientExists) throw new Error('Cliente no encontrado')

        const { user } = ctx
        if (String(clientExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        return clientExists
      } catch (error) {
        console.log("🚀 ~ getClient: ~ error", error)
        throw error
      }
    },
    getOrders: async () => {
      try {
        const orders = await Order.find({})
        return orders
      } catch (error) {
        console.log("🚀 ~ getOrders: ~ error", error)
        throw error
      }
    },
    getOrdersBySeller: async (_, { }, ctx) => {
      try {
        const { user } = ctx
        const orders = await Order.find({ seller: ObjectId(user?.id) }).populate('client')
        return orders
      } catch (error) {
        console.log("🚀 ~ getOrdersBySeller: ~ error", error)
        throw error
      }
    },
    getOrder: async (_, { id }, ctx) => {
      try {
        const orderExists = await Order.findById(id)
        if (!orderExists) throw new Error('Pedido no encontrado')

        const { user } = ctx
        if (String(orderExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        return orderExists
      } catch (error) {
        console.log("🚀 ~ getOrder: ~ error", error)
        throw error
      }
    },
    getOrderByStatus: async (_, { status }, ctx) => {
      try {
        const { user } = ctx
        const orders = await Order.find({
          seller: ObjectId(user?.id),
          status
        })

        return orders
      } catch (error) {
        console.log("🚀 ~ getOrderByStatus: ~ error", error)
        throw error
      }
    },
    getBestClients: async () => {
      try {
        const clients = await Order.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: "$client",
              total: { $sum: '$total' }
            }
          },
          {
            $lookup: {
              from: 'clients',
              localField: '_id',
              foreignField: '_id',
              as: 'client'
            }
          },
          { $unwind: '$client' },
          { $limit: 10 },
          { $sort: { total: -1 } }
        ])

        return clients
      } catch (error) {
        console.log("🚀 ~ getBestClients: ~ error", error)
        throw error
      }
    },
    getBestSellers: async () => {
      try {

        const sellers = await Order.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: '$seller',
              total: { $sum: '$total' }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'seller'
            }
          },
          { $unwind: '$seller' },
          { $limit: 3 },
          { $sort: { total: -1 } }
        ])

        return sellers
      } catch (error) {
        console.log("🚀 ~ getBestSellers: ~ error", error)
        throw error
      }
    },
    searchProduct: async (_, { text }) => {
      try {
        const products = await Product.find({ $text: { $search: text } }).limit(10)
        return products
      } catch (error) {
        console.log("🚀 ~ searchProduct: ~ error", error)
        throw error
      }
    }
  },
  Mutation: {
    createUser: async (_, { input }) => {
      try {
        const { email, password } = input

        // Validar si ya esta registrado
        const userExists = await User.findOne({ email })
        if (userExists) throw new Error('El usuario ya esta registrado')

        // Hashear su password
        const salt = bcryptjs.genSaltSync(10)
        input.password = bcryptjs.hashSync(password, salt)

        // Save 
        const user = new User(input)
        await user.save()

        return user
      } catch (error) {
        console.log("🚀 ~ createUser: ~ error", error)
        throw error
      }
    },
    authenticateUser: async (_, { input }) => {
      try {
        // Verificar que el usuario exista
        const { email, password } = input
        const userExists = await User
          .findOne({ email })
        if (!userExists) throw new Error('Email o password incorrecto')

        // Verificar el password
        const isCorrectPassword = bcryptjs.compareSync(password, userExists.password)
        if (!isCorrectPassword) throw new Error('Email o password incorrecto')

        // Generar token
        return {
          token: generateToken(userExists, process.env.SECRET_WORD, '24h')
        }

      } catch (error) {
        console.log("🚀 ~ authenticateUser: ~ error", error)
        throw error
      }
    },
    createProduct: async (_, { input }) => {
      try {
        const newProduct = new Product(input)
        return await newProduct.save()
      } catch (error) {
        console.log("🚀 ~ createProduct: ~ error", error)
        throw error
      }
    },
    updateProduct: async (_, { id, input }) => {
      try {
        let productExists = await Product.findById(id)
        if (!productExists) throw new Error('Producto no encontrado')
        productExists = await Product.findOneAndUpdate({ _id: ObjectId(id) }, input, { new: true })
        return productExists
      } catch (error) {
        console.log("🚀 ~ updateProduct:async ~ error", error)
        throw error
      }
    },
    deleteProduct: async (_, { id }) => {
      try {
        const productExists = await Product.findById(id)
        if (!productExists) throw new Error('Producto no encontrado')
        await Product.findOneAndDelete({ _id: ObjectId(id) })
        return 'Producto eliminado'
      } catch (error) {
        console.log("🚀 ~ deleteProduct:async ~ error", error)
        throw error
      }
    },
    createClient: async (_, { input }, ctx) => {
      try {
        const { user } = ctx
        const { email } = input

        const clientExists = await Client.findOne({ email })
        if (clientExists) throw new Error('Ese cliente ya esta registrado')

        input.seller = ObjectId(user?.id)
        const client = new Client(input)

        return await client.save()
      } catch (error) {
        console.log("🚀 ~ createClient:async ~ error", error)
        throw error
      }
    },
    updateClient: async (_, { id, input }, ctx) => {
      try {
        let clientExists = await Client.findById(id)
        if (!clientExists) throw new Error('Cliente no encontrado')

        const { user } = ctx
        if (String(clientExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        clientExists = await Client.findOneAndUpdate({ _id: ObjectId(id) }, input, { new: true })
        return clientExists
      } catch (error) {
        console.log("🚀 ~ updateClient: ~ error", error)
        throw error
      }
    },
    deleteClient: async (_, { id }, ctx) => {
      try {
        let clientExists = await Client.findById(id)
        if (!clientExists) throw new Error('Cliente no encontrado')

        const { user } = ctx
        if (String(clientExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        await Client.findOneAndDelete({ _id: ObjectId(id) })
        return 'Cliente eliminado'
      } catch (error) {
        console.log("🚀 ~ deleteClient: ~ error", error)
        throw error
      }
    },
    createOrder: async (_, { input }, ctx) => {
      try {
        const { client, order } = input

        // Verificar cliente
        let clientExists = await Client.findById(client)
        if (!clientExists) throw new Error('Cliente no encontrado')

        // Verificar si el cliente es del vendedor
        const { user } = ctx
        if (String(clientExists.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        // Verificar si tenemos stock disponible        
        for await (const article of order) {
          const { id, quantity } = article
          const product = await Product.findById(id)

          if (quantity > product.stock)
            throw new Error(`El articulo: ${product.name} excede la cantidad disponible`)

          product.stock -= quantity
          await product.save()
        }

        // Crear pedido
        input.seller = user?.id
        const newOrder = new Order(input)
        return await newOrder.save()
      } catch (error) {
        console.log("🚀 ~ createOrder: ~ error", error)
        throw error
      }
    },
    updateOrder: async (_, { id, input }, ctx) => {
      try {
        const orderExists = await Order.findById(id)
        if (!orderExists) throw new Error('Pedido no encontrado')

        const { client, order } = input
        const clientExists = await Client.findById(client)
        if (!clientExists) throw new Error('Cliente no encontrado')

        const { user } = ctx
        if ((String(clientExists.seller) !== String(user?.id)) || (String(orderExists.seller) !== String(user?.id)))
          throw new Error('No tienes las credenciales')

        // Revisar el stock
        for await (const article of order) {
          const { id, quantity } = article
          const product = await Product.findById(id)

          if (quantity > product.stock)
            throw new Error(`El articulo: ${product.name} excede la cantidad disponible`)

          product.stock -= quantity
          await product.save()
        }

        // Save Order
        return await Order.findOneAndUpdate({ _id: ObjectId(id) }, input, { new: true })
      } catch (error) {
        console.log("🚀 ~ updateOrder: ~ error", error)
        throw error
      }
    },
    deleteOrder: async (_, { id }, ctx) => {
      try {
        const orderExists = await Order.findById(id)
        if (!orderExists) throw new Error('Pedido no encontrado')

        const { user } = ctx
        if (String(order.seller) !== String(user?.id)) throw new Error('No tienes las credenciales')

        await Order.findOneAndDelete({ _id: ObjectId(id) })
        return 'Pedido eliminado'
      } catch (error) {
        console.log("🚀 ~ deleteOrder: ~ error", error)
        throw error
      }
    }
  }
}

module.exports = resolvers