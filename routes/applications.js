require('dotenv').config();
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log(process.env.SECRET);
  res.status(200).json({
    message: 'it works!'
  })
});

router.post('/', (req, res) => {
  res.status(200).json(req.body.username)
});

module.exports = router;