const { get, isNil, isArray } = require('lodash');

/**
 * remove the citation brackets e.g. [145]
 * https://regex101.com/r/JTEb0z/1
 * TODO: parse the citation links and parse them to a new field so we can add
 * TODO:   a direct link to any records
 * @param str {string} - input string
 * @param regex - regex to use to parse
 * @return {string|void}
 */
function removeCitationBrackets(str, regex = /\[.+?\]\s*/gm) {
  return str.replace(regex, '');
}

/**
 * remove (including perpetrator) from some entries to retrieve numeric values
 * and set booleans to indicate whether the perp died or was injured in the shooting
 * https://regex101.com/r/4TLSb2/1
 * @param str {string} input string
 * @param regex - regex to use to parse
 * @return {{found_perpetrator: boolean, replaced: (string|void|never)}}
 */
function removePerpetratorInsideParens(str, regex = / \(.+?perpetrator\)\s*/gm) {
  return {
    replaced: str.replace(regex, ''),
    found_perpetrator: regex.exec(str) !== null,
  };
}

/**
 * School shootings all years
 * Collection of props to pass to ../parser.parseJSONFrame() to select items on a given page
 * and convert them to objects using the jsonframe-cheerio library
 * @type {{
 *    selector: string representing the target selector to target on the html page,
 *    postProcessor: (function(*=): *) function to post process the json response,
 *    url: string representing the url of the page,
 *    frame: object representing the shape of the output json according to jsonframe spec,
 *    scrapeOptions: object representing the options of the jsonframe.scrape() function,
 * }}
 */
exports.schoolShootings = {
  url: 'https://en.wikipedia.org/wiki/List_of_school_shootings_in_the_United_States',
  selector: '#bodyContent',
  frame: {
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
  },
  scrapeOptions: {},
  postProcessor: function processSchoolShootingsJSON(unparsed) {
    const parseArray = get(unparsed, 'school_shootings');
    return isArray(parseArray)
    ? parseArray.reduce((acc, { deaths, injuries, description, ...rest }) => {
      if (
        !isNil(description)
        && !isNil(deaths)
        && !isNil(injuries)
      ) {
        // remove (including perpetrator) from some entries to retrieve numeric values
        // and include a boolean indicating the fate of the perpetrator
        const {
          replaced: parseDeaths,
          found_perpetrator: perpetrator_died,
        } = removePerpetratorInsideParens(deaths);
        const {
          replaced: parseInjuries,
          found_perpetrator: perpetrator_injured,
        } = removePerpetratorInsideParens(injuries);

        acc.push({
          ...rest,
          deaths: parseDeaths,
          perpetrator_died,
          injuries: parseInjuries,
          perpetrator_injured,
          description: removeCitationBrackets(description),
        });
      }
      return acc;
    }, [])
    : unparsed;
  }
};

/**
 * Mass shootings pre 2018
 * Collection of props to pass to ../parser.parseJSONFrame() to select items on a given page
 * and convert them to objects using the jsonframe-cheerio library
 * @type {{
 *    selector: string representing the target selector to target on the html page,
 *    postProcessor: (function(*=): *) function to post process the json response,
 *    url: string representing the url of the page,
 *    frame: object representing the shape of the output json according to jsonframe spec,
 *    scrapeOptions: object representing the options of the jsonframe.scrape() function,
 * }}
 */
exports.massShootingsPre2018 = {
  url: 'https://en.wikipedia.org/wiki/List_of_mass_shootings_in_the_United_States',
  selector: '#bodyContent',
  frame: {
    mass_shootings_pre_2018: {
      _s: ".wikitable tbody tr",  // the selector
      _d: [{  // allow you to get an array of data, not just the first item
        "date": "td:nth-child(1)",
        "location": "td:nth-child(2)",
        "deaths": "td:nth-child(3)",
        "injuries": "td:nth-child(4)",
        "description": "td:nth-child(6)",
      }]
    }
  },
  scrapeOptions: {},
  postProcessor: function processMassShootingsJSON(unparsed) {
    const parseArray = get(unparsed, 'mass_shootings_pre_2018');
    return isArray(parseArray)
      ? parseArray.reduce((acc, { deaths, injuries, description, ...rest }) => {
        if (
          !isNil(description)
          && !isNil(deaths)
          && !isNil(injuries)
        ) {
          acc.push({
            ...rest,
            // deaths, injuries, description,
            deaths: removeCitationBrackets(deaths),
            injuries: removeCitationBrackets(injuries),
            description: removeCitationBrackets(description),
          });
        }
        return acc;
      }, [])
      : unparsed;
  }
};


