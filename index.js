const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const EntryModel = require('./models/EntryModel');
const Entry = require('./models/EntryModel');

const app = express();

app.use(cors());

//Middleware para servir contenido estatico
app.use(express.static('build'));

//Middleware para leer el json en el body de la solicitud en req.body
app.use(express.json());

//Middleware logger Morgan
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      JSON.stringify(req.body),
    ].join(' ');
  })
);

app.get('/api/persons', (req, res) => {
  EntryModel.find().then((allEntries) => res.send(allEntries));
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  EntryModel.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).send();
      }
    })
    .catch((error) => next(error));
});

app.get('/info', (req, res) => {
  EntryModel.countDocuments({}).then((count) => {
    const htmlFragment = `
    <html>
        <body>
            <p>Phonebook has info for ${count} people</p>
            <p>${new Date().toUTCString()}</p>
        </body>
    </html>`;
    res.send(htmlFragment);
  });
});

app.post('/api/persons', (req, res, next) => {
  const entryToSave = req.body;

  EntryModel.findOne({ name: entryToSave.name }).then((person) => {
    if (person) {
      return res.status(409).send({ error: 'name must be unique' });
    } else {
      const entry = new EntryModel({
        name: entryToSave.name,
        number: entryToSave.number,
      });

      entry
        .save(entry)
        .then((savedEntry) => {
          res.status(201).json(savedEntry);
        })
        .catch((error) => next(error));
    }
  });
});

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Entry.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const entryData = req.body;
  const id = req.params.id;

  Entry.findByIdAndUpdate(id, entryData, { new: true, runValidators: true, context: 'query' })
    .then((updatedEntry) => {
      res.json(updatedEntry);
    })
    .catch((error) => {
      next(error);
    });
});

app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
});

const errorHandler = (error, req, res, next) => {
  console.log('..:Error Handler Middleware:..');
  console.log(error.name);

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Unkown id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('La aplicacion se esta ejecutando en el puerto 3001');
});
