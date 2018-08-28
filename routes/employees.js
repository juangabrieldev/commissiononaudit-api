require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const uuidv1 = require('uuid/v1');

const pool = new Pool();

router.post('/create', (req, res) => { //for react-select
  const cb = (err, resu) => {
    res.send({
      status: 200,
    })
  };

  const query = 'INSERT INTO employees(employeeid, jobid, firstname, middlename, lastname, clusterid, key, role, officeid) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';

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
  ];

  pool.query(query, data, cb);
});

module.exports = router;