require('dotenv').config();
const express = require('express');
const router = express.Router();
const randtoken = require('rand-token');
const { Pool } = require('pg');
const _ = require('lodash');

const pool = new Pool();

//view applications by employeeId (getter is applicant)
router.get('/overview/:id', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query(`SELECT token, j.jobtitle FROM applications a JOIN jobs j ON a.jobid = j.jobid WHERE applicantid = $1`, [req.params.id], cb);
});

//create an application
router.post('/', (req, res) => {
  const token = randtoken.generate(10).toLowerCase();

  const { applicantId, jobId, jobOpportunityId, evaluatorEmployeeId, officeId } = req.body;

  const details = {
    files: {
      applicationLetter: {
        localFilePath: null,
        remoteFilePath: null
      },
      diploma: {
        localFilePath: null,
        remoteFilePath: null
      },
      memorandumOfRecommendation: {
        localFilePath: null,
        remoteFilePath: null
      },
      performanceRatings1: {
        localFilePath: null,
        remoteFilePath: null
      },
      performanceRatings2: {
        localFilePath: null,
        remoteFilePath: null
      },
      positionDescriptionForm: {
        localFilePath: null,
        remoteFilePath: null
      },
      swornStatement: {
        localFilePath: null,
        remoteFilePath: null
      },
      trainingCertificate: {
        localFilePath: null,
        remoteFilePath: null
      },
      workExperience: {
        localFilePath: null,
        remoteFilePath: null
      },
      workAssignmentHistory: {
        localFilePath: null,
        remoteFilePath: null
      },
    },
    ratings: {
      first: null,
      second: null,
      average: null
    }
  };

  const cb = (err, resu) => {
    console.log(err);
    res.send({
      status: 200,
      token
    })
  };

  pool.query(`INSERT INTO applications
    (token, details, applicantid, jobopportunityid, jobid, officeid,
    byclusterevaluatorid) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [token, details, applicantId, jobOpportunityId, jobId, officeId, evaluatorEmployeeId], cb);
});

//view job and its applicants
router.get('/applicants/:evaluatorId/:jobId/:jobOpportunityId', (req, res) => {
  let data = {
    hasStartedEvaluation: false,
    evaluationIsDone: false
  };

  const cb3 = (err, resu) => {
    if(resu.rows.length > 0) {
      data.hasStartedEvaluation = true;
      data.evaluationIsDone = resu.rows[0].contenders !== null;
    }

    res.send({
      status: 200,
      data
    })
  };

  const cb2 = (err, resu) => {
    data.hasStartedEvaluation = resu.rows.length > 0;

    pool.query('SELECT contenders FROM evaluations WHERE jobopportunityid = $1 AND jobid = $2',
      [req.params.jobOpportunityId, req.params.jobId], cb3);
  };

  const cb = (err, resu) => {
    pool.query('SELECT jobopportunityid, jobid FROM evaluations WHERE jobopportunityid = $1 AND jobid = $2',
      [req.params.jobOpportunityId, req.params.jobId], cb2);

    data.data = resu.rows;
  };

  pool.query(`SELECT lastname, firstname, LEFT(middlename, 1) as middleinitial, e.employeeid, j.jobtitle, a.dateofsubmission
    FROM employees e JOIN applications a ON e.employeeid = applicantid
    JOIN jobs j ON a.jobid = j.jobid
    WHERE employeeid IN (
    SELECT applicantid FROM applications a
    WHERE byclusterevaluatorid = $1 AND jobid = $2 )
    ORDER BY a.dateofsubmission`,
    [req.params.evaluatorId, req.params.jobId], cb);
});

//get application by id (the getter is applicant)
router.get('/:id', (req, res) => {
  const applicantId = parseInt(req.query.applicantId, 10);

  //create variable, this will be sent as the data itself
  let application;

  const cb3 = (err, resu) => {
    const employees = resu.rows;

    // add each employee's name to application data
    employees.forEach(employee => {
      application[_.camelCase(employee.rolename) + 'Name'] =
        employee.firstname + (employee.middlename != null ? ' ' + employee.middlename.charAt(0) + '.' : '') +
        ' ' + employee.lastname
    });

    res.send({
      status: 200,
      data: application
    })
  };

  const cb2 = () => {
    let employeeIds = [application.byclusterevaluatorid, application.hrevaluatorid]; //will be used as parameters in query
    employeeIds = employeeIds.filter(el => el != null); //remove nulls;

    //create the parameter
    let params = [];

    employeeIds.forEach((datum, i) => {
      params.push(`$${i + 1}`);
    });

    pool.query(`SELECT firstname, middlename, lastname, role, rolename 
    FROM employees e JOIN roles r ON r.roleid = e.role 
    WHERE employeeid IN (${params.join(',')})`, employeeIds, cb3);
  };

  const cb = (err, resu) => {
    application = resu.rows[0];

    if(resu.rows.length === 0) {
      return res.send({
        status: 401
      })
    } else if (application.applicantid === applicantId) {
      cb2();
    } else {
      res.send({
        status: 401
      })
    }
  };

  pool.query(`SELECT token, details, isdone, byclusterevaluatorid, 
    a.jobid, hrevaluatorid, dateofsubmission, dateofevaluation, 
    enddate, officeid, applicantid, jobtitle 
    FROM applications a 
    JOIN jobs j ON a.jobid = j.jobid 
    WHERE token = $1`,
    [req.params.id], cb)
});

//get applications by evaluatorId, then group it inside jobs
router.get('/evaluator/:id', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query(`SELECT DISTINCT ON(a.jobopportunityid) a.jobid, a.jobopportunityid, j.jobtitle 
  FROM applications a JOIN jobs j ON a.jobid = j.jobid 
  WHERE byclusterevaluatorid = $1`, [req.params.id], cb)
});

module.exports = router;