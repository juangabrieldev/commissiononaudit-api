require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');
const { Pool, Client } = require('pg');
const slug = require('slugify');
const { jobs } = require('../events');

const pool = new Pool();

router.get('/', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      from: `/qualification-standards/`,
      message: 'Success.',
      data: resu.rows
    })
  };

  const query = 'SELECT jobtitle, jobs.key, slug, COUNT(employees.employeeid) ' +
    'FROM jobs LEFT OUTER JOIN employees ON employees.jobid = jobs.jobid ' +
    'GROUP BY jobs.jobid, jobs.jobtitle ' +
    'ORDER BY jobs.jobtitle';

  pool.query(query, [], cb);
});

router.post('/', (req, res) => {
  const end = e => {
    res.send({
      status: 500,
      e,
      from: `/qualification-standards/`,
      message: 'Something went wrong.'
    })
  };

  qualifications = {
    education: req.body.selectedEducation,
    eligibility: req.body.selectedEligibilities,
    yearsOfExperience: req.body.yearsOfExperience,
    hoursOfTraining: req.body.hoursOfTraining
  };

  const cb = (err, resu) => {
    if(err) {
      end(err)
    } else {
      req.app.io.emit(jobs);

      res.send({
        status: 200
      })
    }
  };

  pool.query('INSERT INTO jobs(office, jobtitle, jobdescription, qualifications, key, datecreated, slug) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [req.body.selectedOffice, req.body.jobName, req.body.jobDescription, qualifications, uuidv1(), moment().format(), slug(req.body.jobName.toLowerCase())],
    cb
  );
});

router.get('/view/:slug', (req, res) => {
  const cb = (err, resu) => {
    res.send(resu.rows);
  };

  pool.query('SELECT * FROM jobs WHERE slug = $1', [req.params.slug], cb)
});

router.post('/select', (req, res) => { //for react-select
  const query = 'SELECT jobtitle as label, jobid as value FROM jobs WHERE $1 = ANY(office)';

  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query(query, [req.body.selectedOffice], cb)
});

module.exports = router;