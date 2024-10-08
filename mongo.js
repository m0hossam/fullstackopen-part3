const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !== 5) {
    console.log('You must enter a password or a password, name and number')
    process.exit(1)
}

const password = process.argv[2]
const connectionString = `mongodb+srv://the-mongoose:${password}@fullstackopen-cluster.cuq8kjt.mongodb.net/?retryWrites=true&w=majority&appName=fullstackopen-cluster`

mongoose.set('strictQuery', false)
mongoose.connect(connectionString)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})
const Person = mongoose.model('Person', personSchema) // mongoose will name the collection 'people'

if (process.argv.length === 3) {
    Person.find({}).then(people => {
        console.log('Phonebook:')
        people.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    person.save().then(result => {
        console.log(`Added ${result.name}, number: ${result.number} to phonebook`)
        mongoose.connection.close()
    })
}