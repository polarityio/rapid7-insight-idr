const fp = require('lodash/fp');

let maxUniqueKeyNumber = 0;

const createLookupResults = (foundEntities, Logger) =>
  fp.flow(
    fp.map(({ entity, result }) => {
      let lookupResult;
      if (fp.size(result)) {
        maxUniqueKeyNumber++;
        const formattedResult = formatResult(result);
        lookupResult = {
          entity,
          data: {
            summary: createSummary(formattedResult),
            details: formattedResult
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
    fp.compact
  )(foundEntities);

const createSummary = (result) => [];


const formatResult = (result) => ({
  ...result,

});

module.exports = createLookupResults;
