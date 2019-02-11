const express = require('express');
const app     = express();
const { parseRequestFromTemplate } = require('./utils/parser');
const { schoolShootings, massShootingsPre2018 } = require('./templates/wikipedia');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/wikipedia-school-shootings', parseRequestFromTemplate(schoolShootings));

app.get('/wikipedia-mass-shootings-pre-2018', parseRequestFromTemplate(massShootingsPre2018));

exports = module.exports = app;
