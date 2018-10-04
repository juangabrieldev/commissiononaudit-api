require('dotenv').config();
const express = require('express');
const router = express.Router();
const randtoken = require('rand-token');
const { Pool } = require('pg');
const _ = require('lodash');

const pool = new Pool();

//create an evaluation
router.post('/', (req, res) => {
  const { jobOpportunityId, jobId } = req.body;

  const cb2 = (err, resu) => {
    res.send({
      status: 200
    })
  };

  const cb = (err, resu) => {
    const applicants = {
      applicants: resu.rows
    };

    pool.query(`INSERT INTO evaluations(jobopportunityid, jobid, applicants)
      VALUES ($1, $2, $3)`, [jobOpportunityId, jobId, applicants], cb2);
  };

  pool.query(`SELECT applicantId FROM applications WHERE jobopportunityid = $1 AND jobid = $2`, [jobOpportunityId, jobId], cb);
});

//get the applicants files and pds using jobId and jobOpportunityId
router.get('/:jobId/:jobOpportunityId', (req, res) => {
  const { jobId, jobOpportunityId} = req.params;

  let applicants;

  const cb2 = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  const cb = (err, resu) => {
    applicants = resu.rows[0].applicants.applicants;

    //transform the array
    applicants = applicants.map(app => app.applicantid);

    //parameter will be used in query;
    let params = [];

    applicants.forEach((app, i) => {
      params.push(`$${i + 1}`);
    });

    pool.query(`SELECT details, applicantid, lastname, firstname, LEFT(middlename, 1) as middleinitial 
    FROM applications JOIN employees ON employeeid = applicantid WHERE applicantid IN (${params.join(',')})`, applicants, cb2);
  };

  pool.query('SELECT applicants FROM evaluations WHERE jobopportunityid = $1 AND jobid = $2',
    [jobOpportunityId, jobId], cb);
});

module.exports = router;