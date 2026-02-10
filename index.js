// const http = require('http')
require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const morgan = require('morgan')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('type', function (req) {
  if (req.method === 'POST' && req.body) {
    return JSON.stringify({ name: req.body.name, number: req.body.number })
  }
  return '-'
})


const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}


app.use(requestLogger)


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))


// let persons = [
//   {
//     "id": "1",
//     "name": "Arto Hellas",
//     "number": "040-123456"
//   },
//   {
//     "id": "2",
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523"
//   },
//   {
//     "id": "3",
//     "name": "Dan Abramov",
//     "number": "12-43-234345"
//   },
//   {
//     "id": "4",
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122"
//   }
// ]

app.get('/', (request, response) => {
  response.send('Phonebook')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


app.get('/info', (request, response) => {
  response.send(`Phonebook has info for ${Person.length} people<br>${Date()}`)
})


app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id).
    then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).send(`No person with id:${request.params.id}`)
      }
    })
    .catch(error => next(error))
})

// const id = request.params.id
// const person = persons.find(person => person.id === id)

// if (person) {
//   response.json(person)
// }
// else {
//   response.status(404).send(`No person with id:${id}`)
// }


// app.delete('/api/persons/:id', (request, response) => {
//   const id = request.params.id
//   persons = persons.filter(person => person.id !== id)

//   response.status(204).end()
// })

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


// const generateId = () => {
//   const maxId = Math.floor(Math.random() * 100000000).toString()
//   return maxId
// }


app.post('/api/persons', (request, response,next) => {
  const body = request.body

  // if ((!body.name) || (body.name === "")) {
  //   return response.status(400).json({
  //     error: 'name missing'
  //   })
  // }

  // if ((!body.number) || (body.number === "")) {
  //   return response.status(400).json({
  //     error: 'number missing'
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  return person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})



app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = body.name
      person.number = body.number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})


//const name = persons.find(person => person.name === body.name)
// Person.name.find()

// Person.find(body.name).then(person => {

// if (name) {
//   return response.status(400).json({
//     error: 'name must be unique'
//   })
// }


// const person = {
//   id: generateId(),
//   name: body.name,
//   number: body.number
// }

// persons = persons.concat(person)
// response.json(person)





const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)