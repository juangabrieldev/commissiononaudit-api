require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../authentication/auth');
const moment = require('moment');
const { Pool } = require('pg');
const uuidv1 = require('uuid/v1');
const newlineBr = require('newline-br');
const events = require('../events');

const pool = new Pool();

router.get('/', (req, res) => { //view all
  let data = {};

  const educationSpecificCb = (err, res) => {
    if(err) {
      end(err)
    } else {
      data.educationSpecific = [...res.rows];
      educationCustom();
    }
  };

  const educationCustomCb = (err, res) => {
    if(err) {
      end(err)
    } else {
      data.educationCustom = [...res.rows];
      trainings();
    }
  };

  const trainingsCb = (err, res) => {
    if(err) {
      end(err)
    } else {
      data.trainings = [...res.rows];
      eligibilities();
    }
  };

  const eligibilitiesCb = (err, res) => {
    if(err) {
      end(err)
    } else {
      data.eligibilities = [...res.rows];
    }
  };

  const educationCustom = () => {
    pool.query('SELECT * FROM education where type = 2', [], educationCustomCb);
  };

  const trainings = () => {
    pool.query('SELECT * FROM trainings', [], trainingsCb);
  };

  const eligibilities = () => {
    pool.query('SELECT * FROM eligibilities', [], eligibilitiesCb);
    final();
  };

  const end = e => {
    res.send({
      status: 500,
      from: `/qualification-standards/`,
      message: 'Something went wrong.'
    })
  };

  const final = () => {
    res.send({
      status: 200,
      from: `/qualification-standards`,
      message: 'Successful.',
      data
    })
  };

  pool.query('SELECT * FROM education WHERE type = 1', [], educationSpecificCb);
});

router.post('/education', (req, res) => {
  const end = e => {
    res.send({
      status: 500,
      from: `/departments/`,
      message: 'Something went wrong.'
    })
  };

  const final = () => {
    req.app.io.sockets.emit(events.qualificationStandards);

    res.send({
      status: 200,
      from: `/departments/delete`,
      message: 'Successful.'
    })
  };

  const cb = (err, res) => {
    if(err) {
      end(err)
    } else {
      final();
    }
  };

  pool.query('INSERT INTO education(name, type, key) VALUES ($1, $2, $3)', [req.body.name, req.body.type, uuidv1()], cb)
});

router.post('/trainings', (req, res) => {
  const end = e => {
    res.send({
      status: 500,
      from: `/departments/`,
      message: 'Something went wrong.'
    })
  };

  const final = () => {
    req.app.io.sockets.emit(events.qualificationStandards);

    res.send({
      status: 200,
      from: `/departments/delete`,
      message: 'Successful.'
    })
  };

  const cb = (err, res) => {
    if(err) {
      end(err)
    } else {
      final();
    }
  };

  pool.query('INSERT INTO trainings(name, key) VALUES ($1, $2)', [req.body.name, uuidv1()], cb)
});

module.exports = router;