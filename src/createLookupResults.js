const { flow, map, size, compact } = require('lodash/fp');

let Logger;

const createLookupResults = (foundEntities, threats, users, options, _Logger) =>
  flow(
    map(({ entity, foundQueryLogs, foundInvestigations }) => {
      let lookupResult;
      if (size(foundQueryLogs) || size(foundInvestigations)) {
        lookupResult = {
          entity,
          data: {
            summary: createSummary(foundQueryLogs, foundInvestigations, options),
            details: {
              foundQueryLogs,
              foundInvestigations,
              threats,
              users
            }
          }
        };
      } else {
        lookupResult = {
          entity,
          data: null
        };
      }
      return lookupResult;
    }),
    compact
  )(foundEntities);

const createSummary = (foundQueryLogs, foundInvestigations, options) => {
  const foundQueryLogsSize = size(foundQueryLogs);
  const foundInvestigationsSize = size(foundInvestigations);

  return [
    ...(foundQueryLogsSize
      ? [
          `Query Logs: ${foundQueryLogsSize}${
            foundQueryLogsSize === options.maxResults ? '+' : ''
          }`
        ]
      : []),
    ...(foundInvestigationsSize
      ? [
          `Investigations: ${foundInvestigationsSize}${
            foundInvestigationsSize === options.maxResults ? '+' : ''
          }`
        ]
      : [])
  ];
};

module.exports = createLookupResults;
