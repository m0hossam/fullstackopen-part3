require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('../models/person')
const PORT = process.env.PORT || 3001
const app = express()

// Initial Middleware:

app.use(express.static('dist')) // IMPORTANT: This uses middleware to show static content (HTML & JS in dist)

let corsOptions = {
    origin: 'http://localhost:5173'
}
app.use(cors(corsOptions)) // allow requests from frontend dev origin

app.use(express.json()) // IMPORTANT: This uses middleware to parse JSON request payloads, otherwise 'req.body' is underfined

morgan.token('data', (req) => JSON.stringify(req.body)) // create custom token 'data' to be used in logs
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data')) // middleware that logs requests

// Function Definitions:

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') { // ID in request does not conform to Mongoose standards (e.g. shorter than minimum)
        return res.status(400).send({ error: 'Malformatted ID' })
    }
    if (error.name === 'ValidationError') {
        return res.status(400).send({ error: error.message })
    }

    next(error) // forwards error to bult-in error handler i.e. 404 or 500 etc
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown Endpoint' })
}

// Routes:

app.get('/info', (req, res, next) => {
    const date = new Date().toUTCString()
    Person.countDocuments({})
        .then(count => {
            res.send(`<p>Phonebook has info for ${count} people</p><p>As of ${date}</p>`)
        })
        .catch(error => {
            next(error)
        })
})

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(people => {
            res.json(people)
        })
        .catch(error => {
            next(error)
        })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            res.json(savedPerson)
        })
        .catch(error => {
            next(error)
        })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = { // IMPORTANT: this is a regular JS object, not a Mongoose model like in POST
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' }) // display updated doc, run update validators, use query context not global object
        .then(updatedPerson => {
            if (updatedPerson) {
                res.json(updatedPerson)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(deletedPerson => {
            if (deletedPerson) {
                res.status(204).end() // No content
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

// Last Middleware:

app.use(unknownEndpoint)
app.use(errorHandler)

// Port Listener

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})

