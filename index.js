const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());

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

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (req, res) => {
  res.send(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).send('El id debe ser un numero');
  }

  const person = getPersonById(id);

  if (!person) {
    return res.status(404).send('No existe registro con ese id');
  }

  res.send(person);
});

app.get('/info', (req, res) => {
  const htmlFragment = `
    <html>
        <body>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date().toUTCString()}</p>
        </body>
    </html>`;

  res.send(htmlFragment);
});

app.post('/api/persons', (req, res) => {
  const personInReq = req.body;
  const randomId = Math.floor(Math.random() * 1000) + 1;

  if (
    !Object.prototype.hasOwnProperty.call(personInReq, 'name') ||
    !Object.prototype.hasOwnProperty.call(personInReq, 'number')
  ) {
    return res
      .status(400)
      .send({ error: 'Object must have a name and a number' });
  }
  const personToSave = {
    id: randomId,
    ...personInReq,
  };

  if (persons.find((person) => person.name === personToSave.name)) {
    return res.status(409).send({ error: 'name must be unique' });
  }

  persons.push(personToSave);
  res.status(201).send(personToSave);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).send('El id debe ser un numero');
  }

  const person = getPersonById(id);

  if (!person) {
    return res.status(404).send('No existe registro con ese id');
  }

  persons = persons.filter((p) => p.id != id);
  res.send(`Registro con id ${id} eliminado con exito`);
});

app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
});

const getPersonById = (id) => {
  return persons.find((person) => person.id === id);
};

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('La aplicacion se esta ejecutando en el puerto 3001');
});