const { get, size, flow, eq, filter, orderBy } = require('lodash/fp');

const MAX_CACHE_TIME = 1000 * 60 * 60 * 24; //24 hours

let cachedUsers, cacheTime, cacheApiKey;

const getUsers = async (options, requestWithDefaults, Logger) => {
  const cacheHasntExpired = Date.now() - cacheTime < MAX_CACHE_TIME;

  if (size(cachedUsers) && cacheHasntExpired && cacheApiKey === options.apiKey)
    return cachedUsers;

  const response = await requestWithDefaults({
    method: 'GET',
    url: `https://${options.regionCode.value}.api.insight.rapid7.com/account/api/1/users`,
    headers: {
      'x-api-key': options.apiKey,
      'Content-Type': 'application/json'
    },
    json: true
  });

  if (response.statusCode !== 200) {
    if (response.statusCode === 403) return;

    throw new Error(
      get('body.message', response) ||
        (response.body && JSON.stringify(response.body)) ||
        'Unknown Closing Investigation Failure'
    );
  }
  cacheTime = Date.now();
  cacheApiKey = options.apiKey;
  cachedUsers = flow(
    get('body'),
    filter(flow(get('status'), eq('ACTIVE'))),
    orderBy('last_login', 'desc')
  )(response);
  return cachedUsers;
};

module.exports = getUsers;
