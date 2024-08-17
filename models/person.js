const mongoose = require('mongoose')

mongoose.set('strictQuery', false) // schema option
console.log('Connecting to MongoDB...')
mongoose.connect(process.env.MONGODB_URI)
    .then(() => { console.log('Successfully connected to MongoDB') })
    .catch(error => { console.log(`Error connecting to MongoDB: ${error.message}`) })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, 'Name must be atleast 3 characters long'],
        required: [true, 'Name required.']
    },
    number: {
        type: String,
        minLength: [8, 'Phone number must be atleast 8 characters long'],
        validate: {
            validator: (num) => {
                return /^\d{2,3}-\d+$/.test(num) // TODO: Test this more, I don't fully udnerstand RegEx yet lol
            },
            message: 'Phone number must consist of 2 or 3 digits followed by a dash followed by digits'
        },
        required: [true, 'Phone number required.']
    }
})

personSchema.set('toJSON', { // customize MongoDB format for the models
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString() // add attribute called 'id', note that '_id' is an object
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema) // export the Person object