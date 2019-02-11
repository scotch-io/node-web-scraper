const cities = require('all-the-cities');
const { us_states } = require('./state_codes');
const { get, isArray, memoize } = require('lodash');

// regex to look for University of ... at CityName, StateName
// https://regex101.com/r/uI0Zn9/2
const universityAtCityRegex = /at (\w+)\s*/;

/**
 * Crude city geocoder. Looks up cities by state and name.  Fails on counties, as expected
 * @param str - string containing full location name with commas
 * @param checkForUniversityAtCity - if true, crudely tries to find city name by searching for "at City Name"
 * @return {array} - array of result objects from all-the-cities "geocoder"
 */
function getUSCity(str = '', checkForUniversityAtCity = true) {
  const split = str.split(',');

  let cityName;
  let atUniversity;
  // check for University of... at City, State
  if (checkForUniversityAtCity) {
    const match = universityAtCityRegex.exec(str);
    if (match !== null && match[1]) {
      atUniversity = match[1];
    }
  }
  cityName = atUniversity || get(split, '[0]', str);

  const stateParse = isArray(split) ? split[split.length - 1].trim() : '';
  const results = cities.filter(city => {
    return city.name.match(cityName)
  });

  return results.reduce((acc, result) => {
    const {
      country,
      adminCode,
    } = result;
    const stateResult = get(us_states, adminCode);
    if (
      country === 'US'
      && stateResult.toLowerCase() === stateParse.toLowerCase()
    ) {
      acc.push(result);
    }

    return acc;
  }, []);
}

/**
 * memoize to speed up repeated api calls
 */
exports.getUSCityLocation = memoize(getUSCity);
