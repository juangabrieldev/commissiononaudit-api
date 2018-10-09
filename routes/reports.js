require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool, Client } = require('pg');

const pool = new Pool();

router.get('/byclusterevaluatorrankinglist/:jobId/:jobOpportunityId', (req, res) => {
  pool.query('SELECT')
});

module.exports = router;