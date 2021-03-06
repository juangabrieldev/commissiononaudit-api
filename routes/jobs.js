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
    const end = e => {
      console.log(e);

      res.send({
        status: 500,
        e,
        from: `/qualification-standards/`,
        message: 'Something went wrong.'
      })
    };

    if(err) {
      return end(err)
    }
    res.send({
      status: 200,
      from: `/qualification-standards/`,
      message: 'Success.',
      data: resu.rows
    })
  };

  const query = 'SELECT jobtitle, jobs.key, jobs.slug, COUNT(employees.employeeid) ' +
    'FROM jobs LEFT OUTER JOIN employees ON employees.jobid = jobs.jobid ' +
    'GROUP BY jobs.jobid, jobs.jobtitle ' +
    'ORDER BY jobs.jobtitle';

  pool.query(query, [], cb);
});

router.post('/', (req, res) => {
  const end = e => {
    console.log(e);
    res.send({
      status: 500,
      e,
      from: `/qualification-standards/`,
      message: 'Something went wrong.'
    })
  };

  qualifications = {
    education: req.body.selectedEducation,
    eligibility: req.body.selectedEligibility,
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

  const selectedOffice = {
    office: req.body.selectedOffice
  };

  pool.query('INSERT INTO jobs(office, jobtitle, jobdescription, qualifications, key, datecreated, slug, salarygrade) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [selectedOffice, req.body.jobName, req.body.jobDescription, qualifications, uuidv1(), moment().format(), slug(req.body.jobName.toLowerCase()), req.body.salaryGrade],
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
  const selectedOffice = {
    office: [req.body.selectedOffice]
  };

  const query = 'SELECT jobtitle AS label, jobid AS value FROM jobs WHERE office @> $1';

  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query(query, [selectedOffice], cb)
});

//get education type of job based on job id
router.get('/education-type/:id', (req, res) => {
  const cb2 = (err, resu) => {
    const types = resu.rows.map(row => row.type);

    res.send({
      status: 200,
      data: types
    })
  };

  const cb = (err, resu) => {
    const education = resu.rows[0].education;
    const educationId = education.map(edu => edu.value);

    //create the parameter
    let params = [];

    educationId.forEach((datum, i) => {
      params.push(`$${i + 1}`);
    });

    pool.query(`SELECT type FROM education WHERE id IN (${params.join(',')})`, educationId, cb2);
  };
  pool.query(`SELECT qualifications -> 'education' as education FROM jobs WHERE jobid = $1`, [req.params.id], cb);
});

router.get('/:id', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows[0]
    })
  };

  pool.query('SELECT jobtitle, jobid, qualifications, salarygrade FROM jobs WHERE jobid = $1', [req.params.id], cb);
});

module.exports = router;