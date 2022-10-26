'use strict';
const validateOptions = require('./src/validateOptions');
const createRequestWithDefaults = require('./src/createRequestWithDefaults');
const _ = require('lodash');
const getLookupResults = require('./src/getLookupResults');
const addIndicatorToThreat = require('./src/addIndicatorToThreat');
const closeInvestigation = require('./src/closeInvestigation');
const assignUserToInvestigation = require('./src/assignUserToInvestigation');

let Logger;
let requestWithDefaults;
let investigations;
let displayFieldsCompiled = null;
let previousDisplayFields = null;
let summaryFieldsCompiled = null;
let summaryDisplayFields = null;

const startup = (logger) => {
  Logger = logger;
  requestWithDefaults = createRequestWithDefaults(Logger);
};

const doLookup = async (entities, options, cb) => {
  Logger.debug({ entities }, 'Entities');

  if (previousDisplayFields === null || previousDisplayFields !== options.displayFields) {
    displayFieldsCompiled = _compileFieldsOption(options.displayFields);
    previousDisplayFields = options.displayFields;
  }

  if (summaryDisplayFields === null || summaryDisplayFields !== options.summaryFields) {
    summaryFieldsCompiled = _compileFieldsOption(options.summaryFields);
    summaryDisplayFields = options.summaryFields;
  }

  let lookupResults;
  try {
    lookupResults = await getLookupResults(
      entities,
      investigations,
      options,
      requestWithDefaults,
      Logger
    );

    lookupResults.forEach((result) => {
      if (result.data !== null) {
        const foundQueryLogs = result.data.details.foundQueryLogs;
        // Summary tags for log searches with events
        if (
          summaryFieldsCompiled.length > 0 &&
          Array.isArray(foundQueryLogs.events) &&
          foundQueryLogs.events.length > 0
        ) {
          const summaryTags = _getEventSummaryTags(foundQueryLogs.events);
          if (summaryTags.length > 0) {
            result.data.summary = summaryTags;
          }
        } else if (
          foundQueryLogs.statistics &&
          Object.keys(foundQueryLogs.statistics.stats).length > 0
        ) {
          // Summary tags for single value stats
          const statKey = Object.keys(foundQueryLogs.statistics.stats)[0];
          const statType = Object.keys(foundQueryLogs.statistics.stats[statKey])[0];
          const statValue = foundQueryLogs.statistics.stats[statKey][statType];
          result.data.summary = [`${statType}(${statKey})=${statValue}`];
        } else if (
          Array.isArray(foundQueryLogs.formattedGroupStats) &&
          foundQueryLogs.formattedGroupStats.length > 0
        ) {
          // Summary tags for groupby
          const numResults = foundQueryLogs.formattedGroupStats.length;
          const firstGroupBy = foundQueryLogs.formattedGroupStats[0];
          const numGroupBys = foundQueryLogs.formattedGroupStats[0].groupings.length;
          const values = firstGroupBy.groupings
            .map((item) => item.groupByValue)
            .join(' > ');
          const summary = [`${values}: ${firstGroupBy.stat.statValue}`];
          if (numResults > 1) {
            summary.push(`+${numResults - 1} more`);
          }
          result.data.summary = summary;
        }
        result.data.details.foundQueryLogs.events.forEach((log) => {
          log.fields = _getDisplayFields(log.message);
        });
      }
    });
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

function _getEventSummaryTags(logs) {
  let tags = [];
  let uniqueValues = new Set();

  logs.forEach((log) => {
    summaryFieldsCompiled.forEach((rule) => {
      let value = _.get(log.message, rule.path, null);
      let alreadyExists = uniqueValues.has(value);

      if (!alreadyExists) {
        if (value !== null) {
          if (rule.label.length > 0) {
            tags.push(`${rule.label}: ${value}`);
          } else {
            tags.push(value);
          }

          uniqueValues.add(value);
        }
      }
    });
  });

  return tags;
}

function _getDisplayFields(message) {
  let values = [];

  displayFieldsCompiled.forEach((rule) => {
    let value = _.get(message, rule.path, null);
    if (value !== null) {
      values.push({
        label: rule.label,
        value
      });
    }
  });

  return values;
}

function _compileFieldsOption(fields, useDefaultLabels = true) {
  const compiledFields = [];

  if (fields.trim().length === 0) {
    return compiledFields;
  }

  fields.split(',').forEach((field) => {
    let tokens = field.split(':');
    let label;
    let fieldPath;

    if (tokens.length !== 1 && tokens.length !== 2) {
      throw new CompileException(
        `Invalid field "${field}".  Field should be of the format "<label>:<json path>" or "<json path>"`
      );
    }

    if (tokens.length === 1) {
      // no label
      fieldPath = tokens[0].trim();
      label = useDefaultLabels ? tokens[0].trim() : '';
    } else if (tokens.length === 2) {
      // label specified
      fieldPath = tokens[1].trim();
      label = tokens[0].trim();
    }

    compiledFields.push({
      label,
      path: fieldPath
    });
  });

  return compiledFields;
}

const onMessageFunctions = {
  addIndicatorToThreat,
  closeInvestigation,
  assignUserToInvestigation
};

const onMessage = async ({ action, data: actionParams }, options, callback) =>
  onMessageFunctions[action](
    actionParams,
    options,
    requestWithDefaults,
    callback,
    Logger
  );

module.exports = {
  doLookup,
  startup,
  validateOptions,
  onMessage
};
