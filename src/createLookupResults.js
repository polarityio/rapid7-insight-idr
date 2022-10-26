const { flow, map, size, compact, filter, eq, get } = require('lodash/fp');

let Logger;

const createLookupResults = (foundEntities, threats, users, options, _Logger) =>
  flow(
    map(({ entity, foundQueryLogs, foundInvestigations }) => {
      let lookupResult;
      if (hasResults(foundQueryLogs, foundInvestigations, options)) {
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

function hasResults(foundQueryLogs, foundInvestigations, options) {
  // Always return result if the option is set
  if (options.showNoResults) {
    return true;
  }

  // We have results if there are event logs or investigations
  if (size(foundQueryLogs.events) || size(foundInvestigations)) {
    return true;
  }

  // We have groupby results
  if (size(foundQueryLogs.formattedGroupStats)) {
    return true;
  }

  // We have stats
  if (foundQueryLogs.statistics && Object.keys(foundQueryLogs.statistics.stats) > 0) {
    return true;
  }

  return false;
}

const createSummary = (foundQueryLogs, foundInvestigations, options) => {
  const foundQueryLogsSize = size(foundQueryLogs.events);
  const foundInvestigationsSize = size(foundInvestigations);
  const openInvestigationsSize =
    foundQueryLogsSize &&
    flow(filter(flow(get('status'), eq('OPEN'))), size)(foundInvestigations);

  if (foundQueryLogsSize === 0) {
    return ['No search results'];
  }

  return [
    ...(foundQueryLogsSize
      ? [
          `Query Logs: ${foundQueryLogsSize}${
            foundQueryLogsSize === options.maxResults ? '+' : ''
          }`
        ]
      : []),
    ...(foundInvestigationsSize && !openInvestigationsSize
      ? [
          `Investigations: ${foundInvestigationsSize}${
            foundInvestigationsSize === options.maxResults ? '+' : ''
          }`
        ]
      : openInvestigationsSize
      ? [
          `Open Investigations: ${openInvestigationsSize}${
            foundInvestigationsSize === options.maxResults ? '+' : ''
          }`,
          ...(foundInvestigationsSize - openInvestigationsSize > 0
            ? [
                `Closed Investigations: ${
                  foundInvestigationsSize - openInvestigationsSize
                }${foundInvestigationsSize === options.maxResults ? '+' : ''}`
              ]
            : [])
        ]
      : [])
  ];
};

module.exports = createLookupResults;
