const mongoose = require('mongoose');
const dotEnv = require('dotenv');

dotEnv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conected to Database');
  })
  .catch((error) => {
    console.log(error.message);
  });

//Create Schema
const entrySchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate:{
      validator:(value)=>{
        const phoneRegex = /^(?:\d{2,3}-\d{7,}|(?:\d{2,3}-)?\d{7,})$/;
        return phoneRegex.test(value);
      },
      message: ({value})=>{return `${value} isn´t a valid phone number`}
    }
  }
});

//Change id to String and delete __v
entrySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

//Create model
const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
