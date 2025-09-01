require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')
const errorHandler = require('./errorHandler')

morgan.token('reqBody', function getBody(req) {
  return JSON.stringify(req.body)
})

app.use(express.json()) // Middleware to parse JSON bodies
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :reqBody'
  )
)
app.use(express.static('dist'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    persons.forEach((person) => console.log(`${person.name} ${person.number}`))
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then((count) => {
    response.send(
      'Phonebook has info for ' + count + ' people<br>' + new Date()
    )
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(next)
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        return response.status(400).json({
          error: 'name must be unique',
        })
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      })

      person
        .save()
        .then((savedPerson) => {
          response.json(savedPerson)
        })
        .catch(next)
    })
    .catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  Person.findByIdAndUpdate(
    request.params.id,
    { name: body.name, number: body.number },
    { new: true, runValidators: true }
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).json({ error: 'person not found' })
      }
    })
    .catch(next)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
