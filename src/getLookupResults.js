const { parseKeyValueOptionList, splitOutIgnoredIps } = require('./dataTransformations');

const searchQueryLogs = require('./searchQueryLogs');
const searchInvestigations = require('./searchInvestigations');
const createLookupResults = require('./createLookupResults');
const { map } = require('lodash/fp');

const getLookupResults = async (
  entities,
  investigations,
  options,
  requestWithDefaults,
  Logger
) => {
  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);

  const foundEntities = await _getFoundEntities(
    entitiesPartition,
    investigations,
    options,
    requestWithDefaults,
    Logger
  );

  const threats = parseKeyValueOptionList('threats', options);

  const lookupResults = createLookupResults(foundEntities, threats, Logger);

  return lookupResults.concat(ignoredIpLookupResults);
};

const _getFoundEntities = async (
  entitiesPartition,
  investigations,
  options,
  requestWithDefaults,
  Logger
) =>
  Promise.all(
    map(async (entity) => {
      const foundQueryLogs = await searchQueryLogs(
        entity,
        options,
        requestWithDefaults,
        Logger
      );

      const foundInvestigations = searchInvestigations(entity, investigations, Logger);

      return { entity, foundQueryLogs, foundInvestigations };
    }, entitiesPartition)
  );

module.exports = getLookupResults;
