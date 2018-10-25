require('dotenv').config();
const express = require('express');
const router = express.Router();
const randtoken = require('rand-token');
const { Pool } = require('pg');
const _ = require('lodash');
const format = require('pg-format');
const moment = require('moment');

const pool = new Pool();

const { notifications } = require('../events');

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

//update an evaluation
router.post('/update/', (req, res) => {
  const { jobId, jobOpportunityId, approved, rejected, rankingListRaw} = req.body;

  const rankingList = { rankingList: _.orderBy(rankingListRaw, 'details.ratings.average', 'desc') };
  const newRejected = { rejected };
  const newApproved = { contenders: approved };

  const cb4 = (err, resu) => {
    req.app.io.emit(notifications);

    res.send({
      status: 200
    })
  };

  //insert to notifications
  const cb3 = (err, resu) => {
    const row = [ ...resu.rows ];
    let values = [];

    row.forEach(r => {
      values.push([r.applicantid, {
        date: moment().format(),
        text: 'Your application has been evaluated.',
        link: `/applications/${r.token}`
      }])
    });


    pool.query(format('INSERT INTO notifications (employeeid, content) VALUES %L', values), [], cb4);
  };

  const cb2 = (err, resu) => {
    pool.query('SELECT applicantid, token FROM applications WHERE jobopportunityid = $1 AND jobid = $2', [jobOpportunityId, jobId], cb3);
  };

  const cb = (err, resu) => {
    pool.query('UPDATE applications SET dateofevaluation = $1 WHERE jobopportunityid = $2 AND jobid = $3', [moment().format(), jobOpportunityId, jobId], cb2);
  };

  pool.query(`UPDATE evaluations SET contenders = $1, rankinglist = $2, rejected = $3
    WHERE jobopportunityid = $4 AND jobid = $5`,
    [newApproved, rankingList, newRejected, jobOpportunityId, jobId], cb);
});

//get evaluations sent to division chief
router.get('/division-chief/', (req, res) => {
  let current, past;

  const cb2 = (err, resu) => {
    past = resu.rows;

    res.send({
      status: 200,
      current,
      past
    })
  };

  const cb = (err, resu) => {
    current = resu.rows;

    pool.query(`SELECT id, (SELECT jobtitle FROM jobs 
      WHERE jobopportunityid = evaluations.jobopportunityid AND jobid = evaluations.jobid) AS jobtitle,
      (SELECT COUNT(*) FROM applications a WHERE a.jobopportunityid = evaluations.jobopportunityid AND a.jobid = evaluations.jobid)
      FROM evaluations WHERE hrevaluatorid IS NOT NULL`, [], cb2);
  };

  pool.query(`SELECT id, (SELECT jobtitle FROM jobs WHERE jobopportunityid = evaluations.jobopportunityid AND jobid = evaluations.jobid) AS jobtitle,
    (SELECT COUNT(*) FROM applications a WHERE a.jobopportunityid = evaluations.jobopportunityid AND a.jobid = evaluations.jobid)
    FROM evaluations WHERE hrevaluatorid IS NULL`, [], cb);
});

//get evaluations sent to hr evaluator
router.get('/hr-evaluator/:id', (req, res) => {
  let current, past;

  const cb2 = (err, resu) => {
    past = resu.rows;

    res.send({
      status: 200,
      past,
      current
    })
  };

  const cb = (err, resu) => {
    current = resu.rows;

    pool.query(`SELECT id, 
      (SELECT COUNT(*) FROM applications WHERE applications.jobopportunityid = evaluations.jobopportunityid AND applications.jobid = evaluations.jobid),
      (SELECT jobtitle from jobs WHERE jobid = evaluations.jobid AND jobopportunityid = evaluations.jobopportunityid) FROM evaluations
      WHERE hrevaluatorid = $1 AND hrrankinglist IS NOT NULL`, [req.params.id], cb2);
  };

  pool.query(`SELECT id,
    (SELECT COUNT(*) FROM applications WHERE applications.jobopportunityid = evaluations.jobopportunityid AND applications.jobid = evaluations.jobid),
    (SELECT jobtitle from jobs WHERE jobid = evaluations.jobid AND jobopportunityid = evaluations.jobopportunityid) FROM evaluations
    WHERE hrevaluatorid = $1 AND hrrankinglist IS NULL`, [req.params.id], cb);
});

router.get('/hr-evaluator/view/:evaluationId/:hrEvaluatorId', (req, res) => {
  const { evaluationId, hrEvaluatorId } = req.params;

  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query(`SELECT *, (SELECT jobtitle FROM jobs 
    WHERE jobs.jobid = evaluations.jobid) 
    FROM evaluations WHERE id = $1 AND hrevaluatorid = $2`, [evaluationId, hrEvaluatorId], cb);
});

//get hr evaluators
router.get('/get-hr-evaluators/', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query(`SELECT concat(firstname, ' ', lastname) AS label, employeeid AS value FROM employees WHERE role = 5`, [], cb);
});

//send to hr evaluators
router.post('/send-to-hr-evaluators/', (req, res) => {
  const { evaluationId, selectedHrEvaluator } = req.body;

  const cb2 = (err, resu) => {
    const jobId = resu.rows[0].jobid;
    const jobOpportunity = resu.rows[0].jobopportunityid;

    pool.query('UPDATE applications SET hrevaluatorid = $1 WHERE jobid = $2 AND jobopportunityid = $3', [selectedHrEvaluator, jobId, jobOpportunity], () => {
      res.send({
        status: 200
      })
    });
  };

  const cb = (err, resu) => {
    pool.query('SELECT jobopportunityid, jobid FROM evaluations WHERE hrevaluatorid = $1', [selectedHrEvaluator], cb2);

  };

  pool.query(`UPDATE evaluations SET hrevaluatorid = $1 WHERE id = $2`, [selectedHrEvaluator, evaluationId], cb);
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

    pool.query(`SELECT details, applicantid, lastname, firstname, LEFT(middlename, 1) as middleinitial, a.personaldatasheet
      FROM applications JOIN employees ON employeeid = applicantid JOIN accounts a on employees.employeeid = a.employeeid 
      WHERE applicantid IN (${params.join(',')})`, applicants, cb2);
  };

  pool.query('SELECT applicants, contenders, rankinglist, rejected FROM evaluations WHERE jobopportunityid = $1 AND jobid = $2',
    [jobOpportunityId, jobId], cb);
});

module.exports = router;