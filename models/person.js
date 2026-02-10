const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url, { family: 4 })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },

  number: {
    _type: String,
    get type() {
      return this._type
    },
    set type(value) {
      this._type = value
    },
    validate: {
      validator: function(v) {
        return /^(\d{2}-\d{6,}|\d{3}-\d{5,})$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    minLength: 8,
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)