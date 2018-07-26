require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const announcements = require('./routes/announcements');
const applications = require('./routes/applications');
const departments = require('./routes/departments');
const login = require('./routes/login');
const employees = require('./routes/employees');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('images'));

app.use('/login', login);
app.use('/departments', departments);

const server = app.listen(4000, () => {
  console.log('listening at 4000')
});

const io = require('socket.io').listen(server);

app.io = io;