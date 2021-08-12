const { parseKeyValueOptionList, splitOutIgnoredIps } = require('./dataTransformations');

const searchQueryLogs = require('./searchQueryLogs');
const searchInvestigations = require('./searchInvestigations');
const getUsers = require('./getUsers');
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

  const users = await getUsers(options, requestWithDefaults, Logger);

  const lookupResults = createLookupResults(
    foundEntities,
    threats,
    users,
    options,
    Logger
  );

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

      const foundInvestigations = searchInvestigations(
        entity,
        investigations,
        options,
        Logger
      );

      return { entity, foundQueryLogs, foundInvestigations };
    }, entitiesPartition)
  );

module.exports = getLookupResults;
