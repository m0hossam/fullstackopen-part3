const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const PORT = 3001;

const app = express();

app.use(express.json()); // IMPORTANT: This uses middleware to parse JSON request payloads, otherwise 'req.body' is underfined

morgan.token('data', (req, res) => JSON.stringify(req.body)) // create custom token 'data' to be used in logs
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

let corsOptions = {
    origin: 'http://localhost:5173'
}
app.use(cors(corsOptions));


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
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`);
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    const person = persons.find(p => p.id === id);

    if (person) {
        res.json(person);
    }
    else {
        res.status(404).end(); // Resource not found
    }
});

const generateId = () => {
    const minCeiled = Math.ceil(1);
    const maxFloored = Math.floor(1000000);
    let id = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
    while (persons.find(p => p.id === id)) { // generate random IDs until we get one that is not used
        id = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
    }
    return id;
}

app.post('/api/persons', (req, res) => {
    const body = req.body;
    

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name/Body is missing.' }); // Bad request
    }

    if (persons.find(p => p.name === body.name)) {
        return res.status(400).json({ error: 'Name must be unique.' });
    }

    const person = {
        id: generateId().toString(),
        name: body.name,
        number: body.number
    };

    persons = persons.concat(person);
    res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    persons = persons.filter(p => p.id !== id);
    res.status(204).end(); // No content
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
