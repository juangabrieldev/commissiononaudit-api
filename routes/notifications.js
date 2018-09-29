require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool, Client } = require('pg');

const pool = new Pool();

//get all notifications by employeeId
router.get('/:id', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query('SELECT * from notifications WHERE employeeid = $1 ORDER BY id DESC', [req.params.id], cb);
});

//get latest notification by employeeId
router.get('/:id/latest', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query('SELECT * FROM notifications WHERE employeeid = $1 ORDER BY id DESC LIMIT 1', [req.params.id], cb);
});

module.exports = router;