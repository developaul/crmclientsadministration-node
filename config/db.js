require('dotenv').config({ path: '.env' })
const mongoose = require('mongoose')

const connectDB = async () => {
  try{
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    console.info('DB conectada')
  } catch(error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = connectDB