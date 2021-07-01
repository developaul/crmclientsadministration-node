const { Schema, model } = require('mongoose')

const OrderSchema = Schema({
  order: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Client'
  },
  seller: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

module.exports = model('Order', OrderSchema) 