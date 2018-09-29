require('dotenv').config();
const express = require('express');
const router = express.Router();
const randtoken = require('rand-token');
const { Pool } = require('pg');

const pool = new Pool();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'it works!'
  })
});

router.post('/', (req, res) => {
  const token = randtoken.generate(20);
  const details = {
    applicant: req.body.applicant,
    byClusterEvaluator: null,
    divisionChief: null,
    hrEvaluator: null
  };

  const cb = (err, resu) => {
    res.send({
      status: 200
    })
  };

  pool.query('INSERT INTO applications(token, details) VALUES ($1, $2)', [token, details], cb);
});

module.exports = router;