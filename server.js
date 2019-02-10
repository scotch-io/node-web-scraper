const express = require('express');
const app     = express();
const { parseRequestFromTemplate } = require('./utils/parser');
const { schoolShootings, massShootingsPre2018 } = require('./templates/wikipedia');

app.get('/wikipedia-school-shootings', parseRequestFromTemplate(schoolShootings));

app.get('/wikipedia-mass-shootings-pre-2018', parseRequestFromTemplate(massShootingsPre2018));

exports = module.exports = app;
