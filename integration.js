'use strict';
const fp = require('lodash/fp');
let schedule = require('node-schedule');

const validateOptions = require('./src/validateOptions');
const createRequestWithDefaults = require('./src/createRequestWithDefaults');

const { INVESTIGATION_REFRESH_TIME } = require('./src/constants');
const getLookupResults = require('./src/getLookupResults');
const refreshInvestigations = require('./src/refreshInvestigations');

let Logger;
let requestWithDefaults;
let investigations;
let previousRegionCode;
let previousApiKey;
let job;

const setInvestigations = (_investigations, _previousApiKey, _previousRegionCode) => {
  investigations = _investigations;
  previousApiKey = _previousApiKey;
  previousRegionCode = _previousRegionCode;
};

const setJob = (_job) => {
  if (fp.get('cancel', job)) job.cancel();
  job = _job;
};

const getRequestWithDefaults = () => requestWithDefaults;
const getLogger = () => Logger;

const startup = (logger) => {
  Logger = logger;
  requestWithDefaults = createRequestWithDefaults(Logger);
};

const doLookup = async (entities, options, cb) => {
  Logger.debug({ entities }, 'Entities');

  let lookupResults;
  try {
    let shouldStartNewJob;
    if (mustGetInvestigations(options)) {
      setJob();
      await refreshInvestigations(
        setInvestigations,
        options,
        requestWithDefaults,
        Logger
      )();
      shouldStartNewJob = true;
    }
    lookupResults = await getLookupResults(
      entities,
      investigations,
      options,
      requestWithDefaults,
      Logger
    );
    if (shouldStartNewJob) {
      setJob(
        schedule.scheduleJob(
          `*/${INVESTIGATION_REFRESH_TIME} * * * *`,
          refreshInvestigations(setInvestigations, options, requestWithDefaults, Logger)
        )
      );
    }
  } catch (error) {
    Logger.error({ error }, 'Get Lookup Results Failed');
    return cb({
      detail: error.message || 'Query Failed',
      err: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    });
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};

const mustGetInvestigations = (options) =>
  !fp.size(investigations) ||
  options.apiKey !== previousApiKey ||
  options.regionCode.value !== previousRegionCode;

module.exports = {
  doLookup,
  startup,
  validateOptions: validateOptions(
    setInvestigations,
    setJob,
    getRequestWithDefaults,
    getLogger
  )
};
