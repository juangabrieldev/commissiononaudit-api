require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool();

router.get('/select', (req, res) => { //for react-select
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query('SELECT rolename AS label, roleid AS value FROM roles ORDER BY label', [], cb);
});

module.exports = router;