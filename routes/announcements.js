require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool, Client } = require('pg');

const pool = new Pool();

router.post('/register', (req, res) => {
  pool.query(`SELECT * FROM employees WHERE username = '${req.body.username}'`, (err, result1) => {
    if(result1.rows.length > 0) {
      return res.send({
        message: 'Username already exists.',
        result1
      })
    }
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      const personalDataSheet = JSON.stringify(req.body.personaldatasheet);
      pool.query(`INSERT INTO Employee (jobid, username, password, avatar, clusterid, personaldatasheet) 
        VALUES ( $1, $2, $3, $4, $5, $6 )`, [req.body.jobid, req.body.username, hash, req.body.avatar, req.body.clusterid, personalDataSheet], (err, result2) => {
        if(err) {
          return res.status(500).send({
            message: err
          })
        }
        res.status(200).send({
          message: 'Registration successful.'
        })
      })
    });
  })
});

router.post('/', (req, res) => {
  pool.query(`SELECT * FROM Employee WHERE username = $1`, [req.body.username], (errorfromquery, findusername) => {
    if(findusername.rows.length < 1)
      return res.send({ message: 'Unauthorized'});
    bcrypt.compare(req.body.password, findusername.rows[0].password, function(err, result) {
      if(result) {
        const token = jwt.sign(
          {
            id: findusername.rows[0].employeeid
          },
          process.env.JWT_KEY,
          {
            expiresIn: '3h'
          }
        );
        return res.status(200).send({
          message: "Successfully logged in.",
          token,
          employeeid: findusername.rows[0].employeeid,
          jobid: findusername.rows[0].jobid,
          name: findusername.rows[0].personaldatasheet.personalInformation.firstName + ' ' + findusername.rows[0].personaldatasheet.personalInformation.surname
        })
      }
      return res.send({ message: 'Unauthorized'});
    });
  })
});

router.post('/special', (req, res) => {
  res.send(req.body);
});

module.exports = router;