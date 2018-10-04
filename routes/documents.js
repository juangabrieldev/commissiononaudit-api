require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../authentication/auth');
const moment = require('moment');
const { Pool } = require('pg');
const fs = require('fs');
const cheerio = require('cheerio');
const cfe = require('check-file-extension');
const request = require('request');
const randtoken = require('rand-token');

const pool = new Pool();

router.post('/', (req, res) => {
  let details;

  const cb2 = (err, resu) => {
    //set the time submitted
    const dateSubmitted = moment().format();

    //update the database
    pool.query('UPDATE applications SET details = $1, dateofsubmission = $2 WHERE token = $3', [details, dateSubmitted, req.body.applicationId], (err, resu) => {
      console.log('upload done for application:', req.body.applicationId);

      res.send({
        status: 200,
      })
    });
  };

  //upload the files to server and internet
  const cb = (err, resu) => {
    details = { ...resu.rows[0].details };

    let fileName;

    //set the rating
    details.rating = req.body.rating;

    const workAssignmentHistory = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.workAssignmentHistory.name);
      req.files.workAssignmentHistory.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.workAssignmentHistory.localFilePath = fileName;
            details.files.workAssignmentHistory.remoteFilePath = url;

            cb2();
          })
        });
      });
    };

    const workExperience = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.workExperience.name);
      req.files.workExperience.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.workExperience.localFilePath = fileName;
            details.files.workExperience.remoteFilePath = url;

            workAssignmentHistory();
          })
        });
      });
    };

    const trainingCertificate = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.trainingCertificate.name);
      req.files.trainingCertificate.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.trainingCertificate.localFilePath = fileName;
            details.files.trainingCertificate.remoteFilePath = url;

            workExperience();
          })
        });
      });
    };

    const swornStatement = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.swornStatement.name);
      req.files.swornStatement.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.swornStatement.localFilePath = fileName;
            details.files.swornStatement.remoteFilePath = url;

            trainingCertificate()
          })
        });
      });
    };

    const positionDescriptionForm = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.positionDescriptionForm.name);
      req.files.positionDescriptionForm.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.positionDescriptionForm.localFilePath = fileName;
            details.files.positionDescriptionForm.remoteFilePath = url;

            swornStatement();
          })
        });
      });
    };

    const performanceRatings2 = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.performanceRatings2.name);
      req.files.performanceRatings2.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.performanceRatings2.localFilePath = fileName;
            details.files.performanceRatings2.remoteFilePath = url;

            positionDescriptionForm();
          })
        });
      });
    };

    const performanceRatings1 = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.performanceRatings1.name);
      req.files.performanceRatings1.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.performanceRatings1.localFilePath = fileName;
            details.files.performanceRatings1.remoteFilePath = url;

            performanceRatings2();
          })
        });
      });
    };

    const memorandumOfRecommendation = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.memorandumOfRecommendation.name);
      req.files.memorandumOfRecommendation.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.memorandumOfRecommendation.localFilePath = fileName;
            details.files.memorandumOfRecommendation.remoteFilePath = url;

            performanceRatings1();
          })
        });
      });
    };

    const diploma = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.diploma.name);
      req.files.diploma.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.diploma.localFilePath = fileName;
            details.files.diploma.remoteFilePath = url;

            memorandumOfRecommendation();
          })
        });
      });
    };

    const applicationLetter = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.applicationLetter.name);
      req.files.applicationLetter.mv('public/documents/' + fileName, err => {
        request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
          formData: {
            file: fs.createReadStream('public/documents/' + fileName)
          }
        }, (err, response, body) => {
          const result = JSON.parse(body);
          const url = result.data.file.url.short;

          request.get(url, (errUrl, responseUrl, bodyUrl) => {
            const $ = cheerio.load(bodyUrl);
            const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

            details.files.applicationLetter.localFilePath = fileName;
            details.files.applicationLetter.remoteFilePath = url;

            diploma();
          })
        });
      });
    };

    applicationLetter();
  };

  pool.query('SELECT details FROM applications WHERE token = $1', [req.body.applicationId], cb);
});

router.get('/:link', (req, res) => {
  const url = `https://anonfile.com/${req.params.link}`;

  request.get(url, (errUrl, responseUrl, bodyUrl) => {
    const $ = cheerio.load(bodyUrl);
    const remoteUrl = $('#download-wrapper div a#download-url').attr('href');

    res.send({
      status: 200,
      remoteUrl
    })
  })
});

module.exports = router;