require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const upload = require('express-fileupload');

const announcements = require('./routes/announcements');
const applications = require('./routes/applications');
const jobs = require('./routes/jobs');
const jobOpportunities = require('./routes/jobOpportunities');
const office = require('./routes/office');
const login = require('./routes/login');
const employees = require('./routes/employees');
const documents = require('./routes/documents');
const notifications = require('./routes/notifications');
const qualificationStandards = require('./routes/qualificationStandards');
const roles = require('./routes/roles');

app.use(cors());
app.use(upload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/applications', applications);
app.use('/employees', employees);
app.use('/jobs', jobs);
app.use('/job-opportunities', jobOpportunities);
app.use('/login', login);
app.use('/office', office);
app.use('/documents', documents);
app.use('/notifications', notifications);
app.use('/qualification-standards', qualificationStandards);
app.use('/roles', roles);

const server = app.listen(4000, port => {
  console.log('listening at 4000')
});

const io = require('socket.io').listen(server);

app.io = io;