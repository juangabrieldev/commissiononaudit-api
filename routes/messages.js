require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../authentication/auth');

router.get('/', auth, (req, res) => {
  res.status(200).json({
    message: 'it works!',
    decoded: req.decoded
  })
});

router.post('/delete', (req, res) => {
  res.status(200).json({
    message: 'post request'
  })
});

router.post('/delete/:id', (req, res) => {
  res.status(200).json({
    message: req.params.id
  })
});

module.exports = router;