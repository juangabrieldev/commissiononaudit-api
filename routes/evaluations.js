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

  let applicants, isDone, hasStarted, contenders, rankingList, rejected;

  const cb2 = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows,
      isDone,
      hasStarted,
      contenders,
      rankingList,
      rejected
    })
  };

  const cb = (err, resu) => {
    if(resu.rows.length > 0) {
      applicants = resu.rows[0].applicants.applicants;
      isDone = resu.rows[0].contenders != null;
      hasStarted = resu.rows.length > 0;

      //set the evaluation results
      contenders = resu.rows[0].contenders != null ? resu.rows[0].contenders.contenders : [];
      rankingList = resu.rows[0].rankinglist != null ? resu.rows[0].rankinglist.rankingList : [];
      rejected = resu.rows[0].rejected != null ? resu.rows[0].rejected.rejected : [];
    }

    //transform the array
    applicants = applicants.map(app => app.applicantid);

    //parameter will be used in query;
    let params = [];

    applicants.forEach((app, i) => {
      params.push(`$${i + 1}`);
    });

    pool.query(`SELECT details, applicantid, lastname, firstname, LEFT(middlename, 1) as middleinitial, personaldatasheet
      FROM applications JOIN employees ON employeeid = applicantid JOIN accounts a on employees.employeeid = a.employeeid 
      WHERE applicantid IN (${params.join(',')})`, applicants, cb2);
  };

  pool.query('SELECT applicants, contenders, rankinglist, rejected FROM evaluations WHERE jobopportunityid = $1 AND jobid = $2',
    [jobOpportunityId, jobId], cb);
});

//update an evaluation
router.post('/update/', (req, res) => {
  console.log('hey');

  const { jobId, jobOpportunityId, approved, rejected} = req.body;

  const rankingList = { rankingList: _.orderBy(approved, 'details.ratings.average', 'desc') };
  const newRejected = { rejected };
  const newApproved = { contenders: approved };

  const cb = (err, resu) => {
    res.send({
      status: 200
    })
  };

  pool.query(`UPDATE evaluations SET contenders = $1, rankinglist = $2, rejected = $3
    WHERE jobopportunityid = $4 AND jobid = $5`,
    [newApproved, rankingList, newRejected, jobOpportunityId, jobId], cb);
});

module.exports = router;