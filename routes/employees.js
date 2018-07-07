require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD,
  port: 5432,
});
//
// app.get('/', (req, res) => {
//   res.send('hello');
// });
//
// app.get('/employees', (req, res) => {
//   pool.query('SELECT * FROM employee', (err, result) => {
//     res.send(result)
//   })
// });
//
// app.get('/announcements', (req, res) => {
//   pool.query('SELECT * FROM announcement', (err, result) => {
//     res.send(result)
//   })
// });

router.get('/', (req, res) => {
  pool.query('SELECT * FROM employee', (err, result) => {
    res.status(200).send({
      result
    })
  })
});

router.get('/error', (req, res) => {
  pool.query('SELECT * FROM employee', (err, result) => {
    res.status(500).send({
      result
    })
  })
});

module.exports = router;