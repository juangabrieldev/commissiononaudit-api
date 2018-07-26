require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool, Client } = require('pg');
const generate = require('nanoid/generate');
const nodemailer = require('nodemailer');
const randtoken = require('rand-token');
const verificationEmail = require('../email/verification');

const pool = new Pool();

// mode 1 - verify
// mode 2 - completeRegistration
// mode 3 - login

let user = {
  firstName: null,
  lastName: null
};

router.post('/register', (req, res) => {
  switch(req.body.mode) {
    case 1: {
      if(typeof req.body.employeeId === 'number') {
        pool.query('SELECT employeeid from employees WHERE employeeid = $1', [req.body.employeeId], (errQ, resQ) => {
          if(errQ) {
            console.log(errQ)
          } else {
            if(resQ.rowCount > 0) {
              pool.query('SELECT employeeid from accounts WHERE employeeid = $1', [req.body.employeeId], (errQS, resQS) => {
                if(errQS) {
                  console.log(errQ)
                } else {
                  if(resQS.rowCount > 0) {
                    res.send({
                      status: 409,
                      from: `/login/register`,
                      validationMessage: 'Employee ID is already registered'
                    })
                  } else {
                    pool.query('SELECT firstname, lastname FROM employees WHERE employeeid = $1', [req.body.employeeId], (errQT, resQT) => {
                      if(errQT) {
                        console.log(errQT)
                      } else {
                        user.firstName = resQT.rows[0].firstname;
                        user.lastName = resQT.rows[0].lastname;

                        res.send({
                          status: 200,
                          from: `/login/employeeid/`,
                          validationMessage: 'Employee ID is valid',
                        })
                      }
                    })
                  }
                }
              });
            } else {
              res.send({
                status: 404,
                from: `/login/register`,
                validationMessage: `Employee ID doesn't exist`
              });
            }
          }
        });
      } else {
        res.send({
          status: 404
        })
      }
      break;
    }

    case 2: {
      pool.query('SELECT email from accounts where email = $1', [req.body.email], (errQ, resQ) => {
        if(errQ) {
          console.log(errQ)
        } else {
          if(resQ.rowCount > 0) {
            res.send({
              status: 409,
              from: `/login/register`,
              validationMessage: 'This e-mail address is already used'
            })
          } else {
            res.send({
              status: 200,
              from: `/login/register`,
              validationMessage: 'E-mail address is valid'
            })
          }
        }
      });
      break;
    }

    case 3: {
      const token = randtoken.generate(30);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'promotionmanagementsystem@gmail.com',
          pass: 'commissiononaudit2018'
        }
      });

      const mailOptions = {
        from: 'promotionmanagementsystem@gmail.com',
        to: req.body.email,
        subject: 'Verify your account',
        html: verificationEmail(user.firstName, token)
      };

      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) {
          console.log(err);
          return res.send({
            status: 500,
            from: `/login/register`,
            message: 'Something went wrong.'
          })
        }

        pool.connect((err, client, done) => {
          const shouldAbort = err => {
            if(err) {
              console.error('Error in transaction', err.stack);
              client.query('ROLLBACK', err => {
                if(err) {
                  console.error('Error in rolling back', err.stack)
                }

                done();
              })
            }

            return !!err;
          };

          client.query('BEGIN', err => {
            if(shouldAbort(err)) {
              return res.send({
                status: 500,
                from: `/login/register`,
                message: 'Something went wrong.'
              })
            }

            client.query('INSERT INTO accounts(employeeid, password, email) VALUES ($1, $2, $3)', [req.body.employeeId, hash, req.body.email], (err, accountsRes) => {
              if(shouldAbort(err)) {
                return res.send({
                  status: 500,
                  from: `/login/register`,
                  message: 'Something went wrong.'
                })
              }

              client.query('INSERT INTO verifications(employeeid, token) VALUES ($1, $2)', [req.body.employeeId, token], (err, verRes) => {
                if(shouldAbort(err)) {
                  return res.send({
                    status: 500,
                    from: `/login/register`,
                    message: 'Something went wrong.'
                  })
                }

                client.query('COMMIT', err => {
                  if(err) {
                    console.error('Error committing transaction', err.stack)
                  }

                  done();

                  transporter.sendMail(mailOptions, (err, info) => {
                    if(err) {
                      console.error('Error in sending e-mail', err);
                      client.query('ROLLBACK', err => {
                        if(err) {
                          console.error('Error in rolling back', err.stack);

                          done();

                          return res.send({
                            status: 500,
                            from: `/login/register`,
                            message: 'Something went wrong.'
                          })
                        }
                      })
                    }

                    const token = jwt.sign({
                      mode: 2,
                      employeeId: req.body.employeeId,
                      email: req.body.email,
                      firstName: user.firstName,
                      lastName: user.lastName
                    }, process.env.JWT_KEY, {
                      expiresIn: '1h'
                    });

                    return res.send({
                      status: 200,
                      message: 'Successfully logged in.',
                      from: `/login/register`,
                      token
                    })
                  });
                })
              })
            })

          })
        });
      });
    }
  }
});

router.post('/verify', (req, res) => {
});

router.post('/', (req, res) => {
  pool.query('SELECT * FROM accounts WHERE employeeid = $1', [req.body.employeeId], (errAccounts, resAccounts) => {
    if(resAccounts.rows.length < 1) {
      pool.query('SELECT employeeid FROM employees WHERE employeeid = $1', [req.body.employeeId], (errEmployees, resEmployees) => {
        if(resEmployees.rows.length < 1) {
          res.send({
            status: 401,
            message: 'Invalid Employee ID or password.',
            from: `/login/`,
          });
        } else {
          res.send({
            status: 403,
            message: 'Employee ID is not yet registered.',
            employeeId: req.body.employeeId,
            from: `/login/`,
          });
        }
      });

      return 0;
    }

    bcrypt.compare(req.body.password, resAccounts.rows[0].password, function(err, result) {
      if(result) {
        pool.query('SELECT firstname, middlename, lastname FROM employees WHERE employeeid = $1', [req.body.employeeId], (errEmployees, resEmployees) => {
          if(resAccounts.rows[0].roleid === 1) {
            const token1 = jwt.sign({
                mode: 5,
                employeeId: resAccounts.rows[0].employeeid,
                email: resAccounts.rows[0].email,
                firstName: resEmployees.rows[0].firstname,
                middleInitial: resEmployees.rows[0].middlename.charAt(0) + '.',
                lastName: resEmployees.rows[0].lastname,
                role: resAccounts.rows[0].roleid,
              },
              process.env.JWT_KEY,
              {
                expiresIn: '1h'
              });

            const token2 = jwt.sign({
                mode: 4,
                employeeId: resAccounts.rows[0].employeeid,
                email: resAccounts.rows[0].email,
                firstName: resEmployees.rows[0].firstname,
                middleInitial: resEmployees.rows[0].middlename.charAt(0) + '.',
                lastName: resEmployees.rows[0].lastname,
                role: 1,
              },
              process.env.JWT_KEY,
              {
                expiresIn: '1h'
              });

            const token3 = jwt.sign({
                mode: 4,
                employeeId: resAccounts.rows[0].employeeid,
                email: resAccounts.rows[0].email,
                firstName: resEmployees.rows[0].firstname,
                middleInitial: resEmployees.rows[0].middlename.charAt(0),
                lastName: resEmployees.rows[0].lastname,
                role: 3,
              },
              process.env.JWT_KEY,
              {
                expiresIn: '1h'
              });

            res.send({
              status: 200,
              mode: 5,
              message: 'Successfully logged in.',
              from: `/login`,
              token1,
              token2,
              token3
            })

          } else {
            const token = jwt.sign(
              {
                mode: 4,
                employeeId: resAccounts.rows[0].employeeid,
                email: resAccounts.rows[0].email,
                firstName: resEmployees.rows[0].firstname,
                middleInitial: resEmployees.rows[0].middlename.charAt(0),
                lastName: resEmployees.rows[0].lastname,
                role: resAccounts.rows[0].roleid,
              },
              process.env.JWT_KEY,
              {
                expiresIn: '1h'
              }
            );

            res.send({
              status: 200,
              mode: 4,
              message: 'Successfully logged in.',
              from: `/login`,
              token
            })
          }
        })
      } else {
        return res.send({
          status: 401,
          message: 'Invalid Employee ID or password.',
          from: `/login`,
        })
      }
    });
  })
});

module.exports = router;