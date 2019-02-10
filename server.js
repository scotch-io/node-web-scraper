const express = require('express');
const fs      = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const _ = require('lodash');
let jsonframe = require('jsonframe-cheerio');
const app     = express();

app.get('/wikipedia-school-shootings', function(req, res){
  const url = 'https://en.wikipedia.org/wiki/List_of_school_shootings_in_the_United_States';

  request(url, function(error, response, html){
    if(!error) {
      let $ = cheerio.load(html);
      jsonframe($); // initializes the plugin

      let frame = {
        school_shootings: {
          _s: ".wikitable tbody tr",  // the selector
          _d: [{  // allow you to get an array of data, not just the first item
            "date": "td:nth-child(1)",
            "location": "td:nth-child(2)",
            "deaths": "td:nth-child(3)",
            "injuries": "td:nth-child(4)",
            "description": "td:nth-child(5)",
          }]
        }
      }

      const unparsed = $('#bodyContent').scrape(frame, { /* string: true */ });

      // Clean the output and reformat a few fields
      const json = _.isArray(_.get(unparsed, 'school_shootings'))
        ? unparsed.school_shootings.reduce((acc, { deaths, injuries, description, ...rest }) => {
          if (
            !_.isNil(description)
            && !_.isNil(deaths)
          ) {
            // remove the citation brackets e.g. [145]
            // https://regex101.com/r/JTEb0z/1
            // TODO: parse the citation links and parse them to a new field so we can add
            // TODO:   a direct link to any records
            const parseDescrption = description.replace(/\[.+?\]\s*/gm, '');

            // remove (including perpetrator) from some entries to retrieve numeric values
            // and set booleans to indicate whether the perp died or was injured in the shooting
            // https://regex101.com/r/4TLSb2/1
            const regex = / \(.+?perpetrator\)\s*/gm;
            const parseDeaths = deaths.replace(regex, '')
            const perpetrator_died = regex.exec(deaths) !== null;
            const parseInjuries = injuries.replace(regex, '')
            const perpetrator_injured = regex.exec(injuries) !== null;

            acc.push({
              ...rest,
              deaths: parseDeaths,
              perpetrator_died,
              injuries: parseInjuries,
              perpetrator_injured,
              description: parseDescrption,
            });
          }
          return acc;
        }, [])
        : unparsed;

      // fs.writeFile('output.json', JSON.stringify(json, null, 4), function (err) {
      //   console.log('File successfully written! - Check your project directory for the output.json file');
      // })

      res.send(JSON.stringify(json, null, 0));
    }
  })
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
