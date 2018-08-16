require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const upload = require('express-fileupload');

const announcements = require('./routes/announcements');
const applications = require('./routes/applications');
const office = require('./routes/office');
const login = require('./routes/login');
const employees = require('./routes/employees');
const documents = require('./routes/documents');
const qualificationStandards = require('./routes/qualificationStandards');

app.use(cors());
app.use(upload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/login', login);
app.use('/office', office);
app.use('/documents', documents);
app.use('/qualification-standards', qualificationStandards);

const server = app.listen(4000, port => {
  console.log('listening at 4000')
});

const io = require('socket.io').listen(server);

app.io = io;