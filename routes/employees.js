require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const uuidv1 = require('uuid/v1');
const slug = require('slugify');
const { employees } = require('../events');
const moment = require('moment');


const pool = new Pool();

router.post('/create', (req, res) => { //for react-select
  const cb = (err, resu) => {
    req.app.io.sockets.emit(employees);

    res.send({
      status: 200,
    })
  };

  const query = 'INSERT INTO employees(employeeid, jobid, firstname, middlename, lastname, clusterid, key, role, officeid, slug) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';

  const data = [
    parseInt(req.body.employeeId),
    req.body.jobId,
    req.body.firstName,
    req.body.middleName,
    req.body.lastName,
    req.body.clusterId,
    uuidv1(),
    req.body.role,
    req.body.office,
    slug((req.body.firstName + ' ' + req.body.lastName + ' ' + (Math.floor(Math.random() * 10000)).toString()).toLowerCase())
  ];

  pool.query(query, data, cb);
});

router.post('/avatar', (req, res) => {
  const fileName = moment().format('YYYYMMDDHHmmss') + '.jpg';

  req.files.image.mv('public/images/' + fileName, err => {
    if(err) {
      return res.send({status: 500})
    } else {
      const cb = (err, resu) => {
        if(err) {
          console.log(err);
          return res.send({
            status: 500
          })
        } else {
          res.send({
            status: 200,
            imagePath: '/images/' + fileName
          })
        }
      };
      pool.query('UPDATE accounts SET imagepath = $1 WHERE employeeid = $2', [fileName, req.body.employeeId], cb);
    }
  })
});

router.get('/avatar/:id', (req, res) => {
  const cb = (err, resu) => {
    if(resu.rows.length > 0) {
      res.send({
        status: 200,
        data: resu.rows[0].imagepath
      })
    } else {
      res.send({
        status: 200,
        data: null
      })
    }
  };

  pool.query('SELECT imagepath FROM accounts WHERE employeeid = $1', [req.params.id], cb);
});

router.get('/registration-progress/:id', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows[0].registrationprogress
    })
  };


  pool.query('SELECT registrationprogress FROM accounts WHERE employeeid = $1', [req.params.id], cb);
});

router.post('/registration-progress/:id', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
    })
  };

  pool.query('UPDATE accounts SET registrationprogress = $1 WHERE employeeid = $2', [req.body.value, req.params.id], cb);
});

router.post('/complete-registration/:id', (req, res) => {
  const cb = (err, resu) => {
    res.send({status: 200})
  };

  pool.query('UPDATE accounts SET personaldatasheet = $1, registrationcomplete = TRUE WHERE employeeid = $2',
    [req.body.personalDataSheet, req.params.id], cb);
});

router.get('/', (req, res) => {
  const query = 'SELECT employees.employeeid, employees.firstname, ' +
    'employees.middlename, employees.lastname, ' +
    'employees.key, count(accounts.employeeid) as registered, ' +
    'accounts.registrationcomplete, ' +
    'accounts.verified, ' +
    'employees.slug ' +
    'FROM employees ' +
    'LEFT OUTER JOIN accounts on employees.employeeid = accounts.employeeid ' +
    'GROUP BY employees.employeeid, accounts.verified, accounts.registrationcomplete ' +
    'ORDER BY employees.lastname';

  cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query(query, [], cb);
});

module.exports = router;