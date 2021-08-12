const { flow, get, replace, find, eq, map, concat, orderBy } = require('lodash/fp');
const { or } = require('./dataTransformations');

const searchQueryLogs = async (
  entity,
  options,
  requestWithDefaults,
  Logger,
  _moreStuffUrl,
  _allQueryLogs = []
) => {
  const queryLogsResponse = await requestWithDefaults({
    method: 'GET',
    url:
      _moreStuffUrl ||
      `https://${options.regionCode.value}.rest.logs.insight.rapid7.com/query/logsets`,
    ...(!_moreStuffUrl && {
      qs: {
        query: flow(get('logQuery'), replace('{{ENTITY}}', entity.value))(options),
        logset_name: 'Internal Logs',
        time_range: options.logQueryTimeRange
      }
    }),
    headers: {
      'x-api-key': options.apiKey,
      'Content-Type': 'application/json',
      size: 1000
    },
    json: true
  });

  const allQueryLogs = flow(
    get('body.events'),
    map((event) => ({
      ...event,
      message: event.message[0] === '{' ? JSON.parse(event.message) : event.message
    })),
    concat(_allQueryLogs),
    orderBy('timestamp', 'desc')
  )(queryLogsResponse);

  const moreStuffUrl = flow(
    get('body.links'),
    find(flow(get('rel'), or(eq('Self'), eq('Next')))),
    get('href')
  )(queryLogsResponse);

  if (moreStuffUrl) {
    return await searchQueryLogs(
      entity,
      options,
      requestWithDefaults,
      Logger,
      moreStuffUrl,
      allQueryLogs
    );
  }

  return allQueryLogs;
};

module.exports = searchQueryLogs;
