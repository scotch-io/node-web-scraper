const { load } = require('cheerio');
const { identity } = require('lodash');
const request = require('request');
const jsonframe = require('jsonframe-cheerio');

/**
 * given a set of props from a template ( e.g. ../templates/wikipedia.js), uses jsonframe-cheerio
 * to parse the html response and convert html -> json given the css selectors in the frame
 * @param html {string} - html string
 * @param selector {string} - main target to search within
 * @param frame {object} - from argument: see jsonframe-cheerio docs
 * @param scrapeOptions {object} - argument object for jsonframe.scrape()
 * @param postProcessor {function} - a function that post processes the output
 * @return {object} - object containing the results of the parse
 */
function parseJSONFrame({
  html,
  selector,
  frame,
  scrapeOpts: scrapeOptions = {},
  postProcessor = identity,
}) {
  const $ = load(html);
  jsonframe($); // initializes the plugin

  return postProcessor($(selector).scrape(frame, scrapeOptions));
}

/**
 * Given a parse template ( e.g. ../templates/wikipedia.js), returns a function to request from the
 * url contained in the template and parse the output using parseJSONFrame()
 * @param parseTemplate
 * @return {function} - function to perform the parsing request
 */
exports.parseRequestFromTemplate = function parseRequestFromTemplate(parseTemplate) {
  return function requester(req, res) {
    const { url, ...parseJsonFrameArguments } = parseTemplate;

    request(url, function respondToParseRequest(error, response, html) {
      if (!error) {
        res.send(JSON.stringify(
          parseJSONFrame({ html, ...parseJsonFrameArguments }),
         null,
          0),
        );
      }
    });
  };
};
