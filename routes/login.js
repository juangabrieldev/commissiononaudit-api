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
const color = require('../colors');

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
      const token = randtoken.generate(5).toUpperCase();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'promotionmanagementsystem@gmail.com',
          pass: 'commissiononaudit2018'
        }
      });

      const mailOptions = {
        from: '"Developer Account" <promotionmanagementsystem@gmail.com>',
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

            client.query('SELECT role FROM employees WHERE employeeid = $1', [req.body.employeeId], (err, roleRes) => {
              const personalDataSheet = {
                trainingsAttended: [
                  {
                    date: null,
                    hours: null,
                    training: null,
                    dataSource: [],
                    isAbleToAdd: false
                  }
                ],
                educationalBackground: {
                  college: {
                    nameOfSchool: null,
                    periodOfAttendance: {
                      to: null,
                      from: null
                    },
                    highestLevelUnitsEarned: '',
                    basicEducationDegreeCourse: null,
                    scholarshipAcademicHonorsReceived: [
                      ''
                    ]
                  },
                  secondary: {
                    nameOfSchool: null,
                    periodOfAttendance: {
                      to: null,
                      from: null
                    },
                    highestLevelUnitsEarned: '',
                    basicEducationDegreeCourse: null,
                    scholarshipAcademicHonorsReceived: [
                      ''
                    ]
                  },
                  elementary: {
                    nameOfSchool: null,
                    periodOfAttendance: {
                      to: null,
                      from: null
                    },
                    highestLevelUnitsEarned: '',
                    basicEducationDegreeCourse: null,
                    scholarshipAcademicHonorsReceived: [
                      ''
                    ]
                  },
                  vocational: {
                    nameOfSchool: null,
                    periodOfAttendance: {
                      to: null,
                      from: null
                    },
                    highestLevelUnitsEarned: '',
                    basicEducationDegreeCourse: null,
                    scholarshipAcademicHonorsReceived: [
                      ''
                    ]
                  },
                  graduateStudies: {
                    nameOfSchool: null,
                    periodOfAttendance: {
                      to: null,
                      from: null
                    },
                    highestLevelUnitsEarned: '',
                    basicEducationDegreeCourse: null,
                    scholarshipAcademicHonorsReceived: [
                      ''
                    ]
                  }
                },
                civilServiceEligibility: [],
                workExperienceWithinCoa: [
                  {
                    isAbleToAdd: false,
                    positionTitle: ''
                  }
                ],
                workExperienceOutsideCoa: [
                  {
                    isAbleToAdd: false,
                    positionTitle: ''
                  }
                ]
              };

              client.query('INSERT INTO accounts(employeeid, password, email, roleid, color, personalDataSheet) VALUES ($1, $2, $3, $4, $5, $6)',
                [req.body.employeeId, hash, req.body.email, roleRes.rows[0].role, color(), personalDataSheet],
                (err, accountsRes) => {
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
                        lastName: user.lastName,
                        role: roleRes.rows[0].role
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
            });
          })
        });
      });
    }
  }
});

router.get('/verify/', (req, res) => {
  const cb3 = (err, resu) => {
    res.send({
      status: 200,
      message: 'Successful.'
    })
  };

  const cb2 = (err, resu) => {
    pool.query('DELETE FROM verifications WHERE employeeid = $1', [req.query.employeeid], cb3);
  };

  const cb = (err, resu) => {
    if(resu.rows.length === 1) {
      pool.query('UPDATE accounts SET verified = true WHERE employeeid = $1', [req.query.employeeid], cb2);
    } else {
      res.send({
        status: 401,
        message: 'Invalid verification link.'
      })
    }
  };

  pool.query('SELECT * FROM verifications WHERE employeeid = $1 AND token = $2', [req.query.employeeid, req.query.token], cb)
});

router.post('/verify/resend', (req, res) => {

  const token = randtoken.generate(5).toUpperCase();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'promotionmanagementsystem@gmail.com',
      pass: 'commissiononaudit2018'
    }
  });

  const mailOptions = {
    from: '"Developer Account" <promotionmanagementsystem@gmail.com>',
    to: req.body.email,
    subject: 'Verify your account',
    html: verificationEmail(req.body.firstName, token)
  };

  const cb = (err, resu) => {
    transporter.sendMail(mailOptions, (errMail, info) => {
      res.send({status: 200})
    });
  };

  pool.query('UPDATE verifications SET token = $1 WHERE employeeid = $2', [token, req.body.employeeId], cb);
});

router.post('/verify/success', (req, res) => {
  let imageUrl = {}; //for display picture

  const cb2 = (err, resu) => {
    const employeeId = parseInt(req.body.employeeId, 10);
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const token = jwt.sign(
      {
        mode: 3,
        employeeId,
        email,
        firstName,
        middleInitial: (resu.rows[0].middlename != null ? resu.rows[0].middlename.charAt(0) + '.' : null),
        lastName,
        role: resu.rows[0].role,
        imageUrl
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
  };

  const cb = (err, resu) => {
    imageUrl = {
      hasUrl: resu.rows[0].imagepath != null,
      url: resu.rows[0].imagepath != null ? resu.rows[0].imagepath : null,
      color: resu.rows[0].color
    };

    pool.query('SELECT role, middlename FROM employees WHERE employeeid = $1', [req.body.employeeId], cb2);
  };

  pool.query('SELECT imagepath, color FROM accounts WHERE employeeid = $1', [req.body.employeeId], cb);
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
          pool.query('SELECT verified, imagepath FROM accounts WHERE employeeid = $1', [req.body.employeeId], (errVerification, resVerification) => {
            if(!resVerification.rows[0].verified) {
              const token = jwt.sign(
                {
                  mode: 2,
                  employeeId: resAccounts.rows[0].employeeid,
                  email: resAccounts.rows[0].email,
                  firstName: resEmployees.rows[0].firstname,
                  middleInitial: (resEmployees.rows[0].middlename != null ? resEmployees.rows[0].middlename.charAt(0) + '.' : null),
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
              });
            } else {
              pool.query('SELECT registrationcomplete FROM accounts WHERE employeeid = $1', [req.body.employeeId], (errRegCom, resRegCom) => {
                if(resRegCom.rows[0].registrationcomplete) {
                  const token = jwt.sign(
                    {
                      mode: 4,
                      employeeId: resAccounts.rows[0].employeeid,
                      email: resAccounts.rows[0].email,
                      firstName: resEmployees.rows[0].firstname,
                      middleInitial: (resEmployees.rows[0].middlename != null ? resEmployees.rows[0].middlename.charAt(0) + '.' : null),
                      lastName: resEmployees.rows[0].lastname,
                      role: resAccounts.rows[0].roleid,
                      imageUrl: {
                        hasUrl: !!resAccounts.rows[0].imagepath,
                        url: resAccounts.rows[0].imagepath,
                        color: resAccounts.rows[0].color
                      }
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
                } else {
                const token = jwt.sign(
                  {
                    mode: 3,
                    employeeId: resAccounts.rows[0].employeeid,
                    email: resAccounts.rows[0].email,
                    firstName: resEmployees.rows[0].firstname,
                    middleInitial: (resEmployees.rows[0].middlename != null ? resEmployees.rows[0].middlename.charAt(0) + '.' : null),
                    lastName: resEmployees.rows[0].lastname,
                    role: resAccounts.rows[0].roleid,
                    imageUrl: {
                      hasUrl: !!resAccounts.rows[0].imagepath,
                      url: resAccounts.rows[0].imagepath,
                      color: resAccounts.rows[0].color
                    }
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: '1h'
                  }
                );

                  res.send({
                    status: 200,
                    mode: 3,
                    message: 'Successfully logged in.',
                    from: `/login`,
                    token
                  })
                }
              })
            }
          });
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