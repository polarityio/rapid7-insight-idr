const addIndicatorToThreat = async (
  { entity, threatKeyToAddIndicatorTo },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    const response = await requestWithDefaults({
      method: 'POST',
      url: `https://us.api.insight.rapid7.com/idr/v1/customthreats/key/${threatKeyToAddIndicatorTo}/indicators/add?format=json`,
      headers: {
        'x-api-key': options.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        [entity.type === 'IPv4' || entity.type === 'IPv4'
          ? 'ips'
          : entity.type === 'domain'
          ? 'domain_names'
          : 'urls']: [entity.value]
      }),
      json: true
    });

    if(response.statusCode !== 200) {
      throw new Error(
        response.body.message ||
          JSON.stringify(response.body) ||
          'Adding Indicator to Threat Failed'
      );
    }

    callback(null, { });
  } catch (error) {
    Logger.error(
      error,
      { detail: 'Adding Indicator to Threat Failed' },
      'Adding Indicator to Threat Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: 'Adding Indicator to Threat Failed - ' + error.message
        }
      ]
    });
  }
};

module.exports = addIndicatorToThreat;
