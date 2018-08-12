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

router.get('/', (req, res) => {
  const end = e => {
    console.log(e);
    res.send({
      status: 500,
      from: `/departments/`,
      message: 'Something went wrong.'
    })
  };

  const cb = (errOffice, resOffice) => {
    if(errOffice) {
      end(errOffice);
    }

    let rows = [];

    for(let i = 0; i < resOffice.rows.length; i++) {
      const dateNow = moment();
      const dateCreated = resOffice.rows[i].datecreated;
      const difference = dateNow.diff(dateCreated, 'days');
      let newDepartment = difference <= 7;

      const row = {
        officeName: resOffice.rows[i].officename,
        description: resOffice.rows[i].description,
        slug: resOffice.rows[i].slug,
        id: resOffice.rows[i].id,
        key: resOffice.rows[i].key,
        dateCreated: dateCreated,
        newDepartment
      };

      rows.push(row)
    }

    res.send({
      status: 200,
      from: `/departments`,
      message: 'Successful.',
      data: rows
    })
  };

  const jobs = (e, r) => {
    if(e) {
      throw e
    }

    res.send({
      status: 200,
      from: `/departments`,
      message: 'Successful.',
      data: r.rows
    })
  };

  if(req.query.jobs) {
    pool.query('SELECT officename AS label, id AS value FROM office ORDER BY officename', [], jobs);
  } else {
    pool.query('SELECT * FROM office ORDER BY datecreated DESC', [], cb);
  }
});

router.post('/create/', (req, res) => {
  let i = 1; //for loop index

  const end = () => {
    res.send({
      status: 500,
      from: `/departments/create`,
      message: 'Something went wrong.'
    })
  };

  const cb3 = (errClusters, resClusters) => {
    if(errClusters) {
      end();
    } else {
      req.app.io.sockets.emit(events.office);

      res.send({
        status: 200,
        from: `/departments/create`,
        message: 'Successful.'
      })
    }
  };

  const cb2 = (errSelect, resSelect) => {
    if(errSelect) {
      end();
    } else {
      const id = resSelect.rows[0].id;
      let values = '';

      for(; i <= req.body.numberOfClusters; i++) {
        values = values.concat(`(${i}, ${id}, '${uuidv1()}')` + (i < req.body.numberOfClusters ? ', ' : ''));

        if(i === req.body.numberOfClusters) {
          pool.query('INSERT INTO clusters(clusternumber, officeid, key) VALUES ' + values, [], cb3)
        }
      }
    }
  };

  const cb = (errOffice, resOffice) => {
    if(errOffice) {
      end();
    }

    pool.query('SELECT id FROM office WHERE slug = $1', [req.body.slug], cb2);
  };

  pool.query('INSERT INTO office(officename, description, slug, datecreated, key) VALUES ($1, $2, $3, $4, $5)', [req.body.officeName, newlineBr(req.body.officeDescription.trim()), req.body.slug, moment().format(), uuidv1()], cb)
});

router.post('/delete/', (req, res) => {
  let values = '';

  for(let i = 0; i < req.body.id.length; i++) {
    values = values.concat(`$${i + 1}` + (i < req.body.id.length - 1 ? ', ' : ''));

    if(i === req.body.id.length - 1) {
      pool.query(`DELETE FROM office WHERE id IN (${values})`, req.body.id, (errDepartments, resDepartments) => {
        if(errDepartments) {
          return res.send({
            status: 500,
            from: `/departments/create`,
            message: 'Something went wrong.'
          })
        }

        req.app.io.sockets.emit(events.office);

        res.send({
          status: 200,
          from: `/departments/delete`,
          message: 'Successful.'
        })
      })
    }
  }
});

router.get('/view/', (req, res) => {
  pool.query('SELECT * FROM office JOIN clusters on office.id = clusters.officeid AND slug = $1', [req.query.slug], (errOffice, resOffice) => {
    if(errOffice) {
      return res.send({
        status: 500,
        from: `/departments/create`,
        message: 'Something went wrong.'
      })
    }

    res.send({
      status: 200,
      from: `/departments/view`,
      data: resOffice.rows
    })
  })
});

module.exports = router;