const { flow, map, size, compact } = require('lodash/fp');

const createLookupResults = (foundEntities, threats, Logger) =>
  flow(
    map(({ entity, foundQueryLogs, foundInvestigations }) => {
      let lookupResult;
      if (size(foundQueryLogs) || size(foundInvestigations)) {
        lookupResult = {
          entity,
          data: {
            summary: createSummary(foundQueryLogs, foundInvestigations),
            details: {
              foundQueryLogs,
              foundInvestigations,
              threats
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

const createSummary = (foundQueryLogs, foundInvestigations) => {
  const foundQueryLogsSize = size(foundQueryLogs);
  const foundInvestigationsSize = size(foundInvestigations);

  return [
    ...(foundQueryLogsSize ? [`Query Logs: ${foundQueryLogsSize}`] : []),
    ...(foundInvestigationsSize ? [`Investigations: ${foundInvestigationsSize}`] : [])
  ];
};

module.exports = createLookupResults;
