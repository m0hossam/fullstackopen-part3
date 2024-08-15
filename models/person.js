const mongoose = require('mongoose');

mongoose.set('strictQuery', false); // schema option
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(result => { console.log('Successfully connected to MongoDB') })
    .catch(error => { console.log(`Error connecting to MongoDB: ${error.message}`) });

const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

personSchema.set('toJSON', { // customize MongoDB format for the models
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString(); // add attribute called 'id', note that '_id' is an object
      delete returnedObject._id; 
      delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Person', personSchema); // export the Person object