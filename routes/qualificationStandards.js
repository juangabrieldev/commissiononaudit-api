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
      eligibility();
    }
  };

  const eligibilityCb = (err, res) => {
    if(err) {
      end(err)
    } else {
      data.eligibility = [...res.rows];
      final();
    }
  };

  const educationCustom = () => {
    pool.query('SELECT * FROM education where type = 2', [], educationCustomCb);
  };

  const trainings = () => {
    pool.query('SELECT * FROM trainings', [], trainingsCb);
  };

  const eligibility = () => {
    pool.query('SELECT * FROM eligibility', [], eligibilityCb);
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

router.post('/', (req, res) => {
  const end = e => {
    res.send({
      status: 500,
      from: `/departments/`,
      message: 'Something went wrong.'
    })
  };

  const cb = (err, ress) => {
    if(err) {
      return end(err)
    }

    req.app.io.sockets.emit(events.qualificationStandards);

    res.send({
      status: 200,
      message: 'Successful'
    })
  };

  const query = (q, data) => {
    pool.query(q, data, cb)
  };

  switch(req.body.type) {
    case 1:
    case 2: {
      query('INSERT INTO education(name, type, key) VALUES ($1, $2, $3)', [req.body.value, req.body.type, uuidv1()]);
      break;
    }

    case 3: {
      query('INSERT INTO trainings(name, key) VALUES ($1, $2)', [req.body.value, uuidv1()]);
      break;
    }

    case 4: {
      query('INSERT INTO eligibility(name, key) VALUES ($1, $2)', [req.body.value, uuidv1()]);
      break;
    }
  }
});

router.post('/delete', (req, res) => {
  const end = e => {
    res.send({
      status: 500,
      from: `/departments/`,
      message: 'Something went wrong.'
    })
  };

  const cb = (err, ress) => {
    if(err) {
      return end(err)
    }

    req.app.io.sockets.emit(events.qualificationStandards);

    res.send({
      status: 200,
      message: 'Successful'
    })
  };

  const query = (q, data) => {
    pool.query(q, data, cb)
  };

  switch(req.body.type) {
    case 1:
    case 2: {
      query('DELETE FROM education WHERE id = $1', [req.body.id]);
      break;
    }

    case 3: {
      query('DELETE FROM trainings WHERE id = $1', [req.body.id]);
      break;
    }
  }
});

router.get('/select', (req, res) => {
  let specificCourses;
  let customQualifications;
  let eligibility;


  const end = e => {
    res.send({
      e,
      status: 500,
      from: `/qualification-standards/`,
      message: 'Something went wrong.'
    })
  };

  const eligibilityCb = (err, ress) => {
    if(err) {
      return end(err);
    }

    eligibility = ress.rows;

    res.send({
      status: 200,
      message: 'Successful',
      data: {
        specificCourses,
        customQualifications,
        eligibility
      }
    })
  };

  const customQualificationsCb = (err, res) => {
    if(err) {
      return end(err);
    }

    customQualifications = res.rows;

    pool.query('SELECT id as value, name as label FROM eligibility ORDER BY label', [], eligibilityCb)
  };

  const specificCoursesCb = (err, res) => {
    if(err) {
      return end(err);
    }

    specificCourses = res.rows;
    pool.query('SELECT id as value, name as label FROM education WHERE type = 2 ORDER BY label', [], customQualificationsCb)
  };


  pool.query('SELECT id as value, name as label FROM education WHERE type = 1 ORDER BY label', [], specificCoursesCb)
});

router.get('/courses', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query('SELECT id as value, name as label FROM education WHERE type = 1 ORDER BY label', [], cb)
});

router.get('/eligibilities', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query('SELECT name AS label, CAST(id AS TEXT) AS value FROM eligibility ORDER BY label', [], cb)
});

router.get('/trainings', (req, res) => {
  const cb = (err, resu) => {
    res.send({
      status: 200,
      data: resu.rows
    })
  };

  pool.query('SELECT name AS label, CAST(id AS TEXT) AS value FROM trainings ORDER BY label', [], cb)
});

module.exports = router;