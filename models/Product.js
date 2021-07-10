const { Schema, model } = require('mongoose')

const ProductSchema = Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

// Permite crear un indice
ProductSchema.index({ name: 'text' })

module.exports = model('Product', ProductSchema)