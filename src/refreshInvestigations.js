const fp = require('lodash/fp');

let Logger;

const refreshInvestigations =
  (setInvestigations, _options, requestWithDefaults, _Logger) => async () => {
    Logger = _Logger;
    Logger.info('Starting Data Refresh for Investigations');
    
    const options = {
      apiKey: fp.get('apiKey.value', _options) || _options.apiKey,
      regionCode: fp.get('regionCode.value.value', _options) || _options.regionCode.value
    };

    try {
      const investigations = await getAllInvestigations(options, requestWithDefaults);

      Logger.info(`${investigations.length} Total Investigations`);

      setInvestigations(investigations, options.apiKey, options.regionCode);

      return investigations;
    } catch (error) {
      Logger.error(error, 'Error in Refreshing Investigations Data');
    }
  };

const getAllInvestigations = async (
  options,
  requestWithDefaults,
  index = 0,
  allInvestigations = []
) => {
  const currentInvestigationResults = fp.get(
    'body',
    await requestWithDefaults({
      method: 'GET',
      url: `https://${options.regionCode}.api.insight.rapid7.com/idr/v1/investigations`,
      qs: {
        size: 1000,
        index
      },
      headers: {
        'x-api-key': options.apiKey,
        'Content-Type': 'application/json'
      },
      json: true
    })
  );

  const investigations = fp.flow(
    fp.getOr([], 'data'),
    fp.concat(allInvestigations),
    fp.orderBy('created_time', 'desc')
  )(currentInvestigationResults);

  const thereAreMoreInvestigations =
    fp.get('metadata.total_pages', currentInvestigationResults) - 1 > index;

  return thereAreMoreInvestigations
    ? await getAllInvestigations(options, requestWithDefaults, index + 1, investigations)
    : investigations;
};

module.exports = refreshInvestigations;
