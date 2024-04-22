const mongoose = require('mongoose');

//Capture arguments
const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

//Connection String
const url = `mongodb+srv://andresanni1985:${password}@cluster0.5vdenbx.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

//Connect to db
mongoose
  .connect(url)
  .then(() => console.log('::Database conected::'))
  .catch((error) => console.log(error));

//Create Schema
const entrySchema = new mongoose.Schema({
  name: String,
  number: String,
});

//Create model
const Entry = mongoose.model('Entry', entrySchema);

//Check arguments
if (process.argv.length === 3) {
  Entry.find({}).then((allEntries) => {
    allEntries.forEach((entry) => console.log(entry));
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  //Create instance
  const entry = new Entry({
    name,
    number,
  });

  //Save the instance in db
  entry
    .save()
    .then((savedEntry) => {
      console.log(`added ${savedEntry.name} ${savedEntry.number}`);
    })
    .catch((error) => console.log(error))
    .finally(() => {
      mongoose.connection.close();
    });
} else {
  console.log('Invalid number of arguments');
}
