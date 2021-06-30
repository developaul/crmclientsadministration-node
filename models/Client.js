const { Schema, model } = require('mongoose')

const ClientSchema = Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  seller: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

module.exports = model('Client', ClientSchema) 