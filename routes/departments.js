require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../authentication/auth');
const moment = require('moment');
const { Pool } = require('pg');
const uuidv1 = require('uuid/v1');
const newlineBr = require('newline-br');
const flatuicolor = require('flat-color-generator');

const pool = new Pool();

router.get('/', (req, res) => {
  pool.query('SELECT * FROM departments ORDER BY datecreated DESC ', [], (errDepartments, resDepartments) => {
    if(errDepartments) {
      return res.send({
        status: 500,
        from: `/departments/create`,
        message: 'Something went wrong.'
      })
    }

    let rows = [];

    for(let i = 0; i < resDepartments.rows.length; i++) {
      const dateNow = moment();
      const dateCreated = resDepartments.rows[i].datecreated;
      const difference = dateNow.diff(dateCreated, 'days');
      let newDepartment = difference <= 7;

      const row = {
        departmentHead: resDepartments.rows[i].departmenthead,
        departmentName: resDepartments.rows[i].departmentname,
        description: resDepartments.rows[i].description,
        slug: resDepartments.rows[i].slug,
        id: resDepartments.rows[i].id,
        key: uuidv1(),
        dateCreated: dateCreated,
        newDepartment
      };

      rows.push(row)
    }

    res.send({
      status: 200,
      from: `/departments/create`,
      message: 'Successful.',
      data: rows
    })
  })
});

router.post('/create/', (req, res) => {
  const color = flatuicolor();

  pool.query('INSERT INTO departments(departmentname, description, slug, datecreated, color) VALUES ($1, $2, $3, $4, $5)', [req.body.departmentName, newlineBr(req.body.departmentDescription.trim()), req.body.slug, moment().format(), color.hex], (errDepartments, resDepartments) => {
    if(errDepartments) {
      return res.send({
        status: 500,
        from: `/departments/create`,
        message: 'Something went wrong.'
      })
    }

    req.app.io.sockets.emit('system_log', 'hey');

    res.send({
      status: 200,
      from: `/departments/create`,
      message: 'Successful.'
    })
  })
});

router.post('/delete/', (req, res) => {
  for(let i = 0; i < req.body.id.length; i++) {
    pool.query('DELETE FROM departments WHERE id = $1', [req.body.id[i]], (errDepartments, resDepartments) => {
      if(errDepartments) {
        return res.send({
          status: 500,
          from: `/departments/create`,
          message: 'Something went wrong.'
        })
      }

      if(i === req.body.id.length - 1) {
        setTimeout(() => {
          req.app.io.sockets.emit('system_log', 'hey');

          res.send({
            status: 200,
            from: `/departments/delete`,
            message: 'Successful.'
          })
        }, 500) //database delay compensation
      }
    })
  }
});

router.get('/view/', (req, res) => {
  pool.query('SELECT * FROM departments WHERE slug = $1', [req.query.slug], (errDepartments, resDepartments) => {
    if(errDepartments) {
      return res.send({
        status: 500,
        from: `/departments/create`,
        message: 'Something went wrong.'
      })
    }

    res.send({
      status: 200,
      from: `/departments/view`,
      data: resDepartments.rows
    })
  })
});

module.exports = router;