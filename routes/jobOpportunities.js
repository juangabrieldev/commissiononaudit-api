require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../authentication/auth');
const moment = require('moment');
const { Pool } = require('pg');
const fs = require('fs');
const cheerio = require('cheerio');
const cfe = require('check-file-extension');
const request = require('request');
const uuidv1 = require('uuid/v1');

const pool = new Pool();

router.get('/jobs/:id', (req, res) => {
  const cb2 = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  const cb = (err, resu) => {
    const office = {
      office: [{value: resu.rows[0].officeid}]
    };

    pool.query(`SELECT jobtitle AS label, jobid AS value FROM jobs WHERE office @> $1`, [office], cb2);
  };



  pool.query('SELECT officeid FROM employees WHERE employeeid = $1', [req.params.id], cb);

});

router.get('/:id', (req, res) => {
  const cb = (err, resu) => {

  };

  pool.query('SELECT officeid FROM employees WHERE employeeid = $1', [req.params.id], cb);
});

router.post('/', (req, res) => {
  const cb2 = (err, resu) => {
    res.send({status: 200})
  };

  const cb = (err, resu) => {
    pool.query('INSERT INTO jobopportunities(deadline, content, key, officeid) VALUES ($1, $2, $3, $4)', [req.body.deadline, req.body.content, uuidv1(), resu.rows[0].officeid], cb2)
  };

  pool.query('SELECT officeid FROM employees WHERE employeeid = $1', [req.body.employeeId], cb);
});

module.exports = router;