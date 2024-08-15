require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('../models/person')
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static('dist')) // IMPORTANT: This uses middleware to show static content (HTML & JS in dist)
app.use(express.json()); // IMPORTANT: This uses middleware to parse JSON request payloads, otherwise 'req.body' is underfined

morgan.token('data', (req, res) => JSON.stringify(req.body)) // create custom token 'data' to be used in logs
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data')); // middleware that logs requests

let corsOptions = {
    origin: 'http://localhost:5173'
}
app.use(cors(corsOptions)); // allow requests from frontend dev origin


let persons = [ // not const because we delete from it
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.get('/info', (req, res) => {
    const date = new Date().toUTCString();
    Person.countDocuments({})
        .then(count => {
            res.send(`<p>Phonebook has info for ${count} people</p><p>As of ${date}</p>`)
        })
});

app.get('/api/persons', (req, res) => {
    Person.find({})
        .then(people => {
            res.json(people);
        });
});

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id)
        .then(person => {
            res.json(person);
        })
        .catch(error => {
            res.status(404).end();
        })
});

app.post('/api/persons', (req, res) => {
    const body = req.body;
    
    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name/Body is missing.' }); // Bad request
    }

    const person = new Person({
        name: body.name,
        number: body.number
    });
    
    person.save().then(savedPerson => {
        res.json(savedPerson);
    });
});

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    persons = persons.filter(p => p.id !== id);
    res.status(204).end(); // No content
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

