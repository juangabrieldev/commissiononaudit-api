require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const announcements = require('./routes/announcements');
const applications = require('./routes/applications');
const messages = require('./routes/messages');
const login = require('./routes/login');
const employees = require('./routes/employees');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/login', login);

const server = app.listen(4000, () => {
  console.log('listening at 4000')
});

const io = require('socket.io').listen(server);

let counter = 1;

io.on('connection', socket => {
  console.log('a user has connected!', counter);
  counter++;
});