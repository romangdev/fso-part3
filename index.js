const express = require('express')
const app = express()
const morgan = require('morgan')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'uknown endpoint'})
}

app.use(unknownEndpoint)
app.use(requestLogger)
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`)
})

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `)
})

app.get('/api/persons/:id', (request, response) => {
  const requestID = Number(request.params.id)
  const person = persons.find(person => person.id === requestID)

  if (person === undefined) {
    return response.status(404).end()
  }

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const requestID = Number(request.params.id)
  persons = persons.filter(person => person.id !== requestID)
  response.status(204).end()
})

const checkExistingPerson = (body) => {
  const exists = persons.find(person => body.name === person.name)
  return exists
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(request.body)

  if (checkExistingPerson(body)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  } else if (body.name === '' || body.number === '') {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const newPerson = {
    id: Math.ceil(Math.random() * 100),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})