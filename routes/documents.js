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

    //set the ratings
    details.ratings.first = req.body.firstRating;
    details.ratings.second = req.body.secondRating;
    details.ratings.average = req.body.averageRating;

    const workAssignmentHistory = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.workAssignmentHistory.name);
      req.files.workAssignmentHistory.mv('public/documents/' + fileName, err => {
        details.files.workAssignmentHistory.localFilePath = fileName;

        cb2();
      });
    };

    const workExperience = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.workExperience.name);
      req.files.workExperience.mv('public/documents/' + fileName, err => {
        details.files.workExperience.localFilePath = fileName;

        workAssignmentHistory();
      });
    };

    const trainingCertificate = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.trainingCertificate.name);
      req.files.trainingCertificate.mv('public/documents/' + fileName, err => {
        details.files.trainingCertificate.localFilePath = fileName;

        workExperience();
      });
    };

    const swornStatement = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.swornStatement.name);
      req.files.swornStatement.mv('public/documents/' + fileName, err => {
        details.files.swornStatement.localFilePath = fileName;

        trainingCertificate()
      });
    };

    const positionDescriptionForm = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.positionDescriptionForm.name);
      req.files.positionDescriptionForm.mv('public/documents/' + fileName, err => {
        details.files.positionDescriptionForm.localFilePath = fileName;

        swornStatement();
      });
    };

    const performanceRatings2 = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.performanceRatings2.name);
      req.files.performanceRatings2.mv('public/documents/' + fileName, err => {
        details.files.performanceRatings2.localFilePath = fileName;

        positionDescriptionForm();
      });
    };

    const performanceRatings1 = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.performanceRatings1.name);
      req.files.performanceRatings1.mv('public/documents/' + fileName, err => {
        details.files.performanceRatings1.localFilePath = fileName;

        performanceRatings2();
      });
    };

    const memorandumOfRecommendation = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.memorandumOfRecommendation.name);
      req.files.memorandumOfRecommendation.mv('public/documents/' + fileName, err => {
        details.files.memorandumOfRecommendation.localFilePath = fileName;

        performanceRatings1();
      });
    };

    const diploma = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.diploma.name);
      req.files.diploma.mv('public/documents/' + fileName, err => {
        details.files.diploma.localFilePath = fileName;

        memorandumOfRecommendation();
      });
    };

    const applicationLetter = () => {
      fileName = req.body.applicationId + '_' + randtoken.generate(5) + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.applicationLetter.name);
      req.files.applicationLetter.mv('public/documents/' + fileName, err => {
        details.files.applicationLetter.localFilePath = fileName;

        diploma();
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