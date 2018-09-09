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

const pool = new Pool();

router.post('/', (req, res) => {
  const fileName = req.body.applicationId + '_' + moment().format('YYYYMMDDHHmmss') + cfe(req.files.file.name);

  req.files.file.mv('public/documents/' + fileName, err => {
    if(err) {
      return
    }
    request.post('https://anonfile.com/api/upload?token=c4a3ba02129ee1f4', {
      formData: {
        file: fs.createReadStream('public/documents/' + fileName)
      }
    }, (err, response, body) => {
      const url = JSON.parse(body).data.file.url.short;

      // request.get(url, (errUrl, responseUrl, bodyUrl) => {
      //   const $ = cheerio.load(bodyUrl);
      //   res.send({
      //     status: 200,
      //     url: $('#download-wrapper div a#download-url').attr('href')
      //   })
      // })
      res.send({
        status: 200,
        url
      })
    });
  });
});

module.exports = router;