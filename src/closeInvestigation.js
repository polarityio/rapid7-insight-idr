const { get } = require('lodash/fp');

const closeInvestigation = async (
  { investigationId },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    const response = await requestWithDefaults({
      method: 'PUT',
      url: `https://${options.regionCode.value}.api.insight.rapid7.com//idr/v1/investigations/${investigationId}/status/CLOSED`,
      headers: {
        'x-api-key': options.apiKey,
        'Content-Type': 'application/json'
      },
      json: true
    });

    if (response.statusCode !== 200) {
      throw new Error(
        get('body.message', response) ||
          (response.body && JSON.stringify(response.body)) ||
          'Unknown Closing Investigation Failure'
      );
    }

    callback(null, {});
  } catch (error) {
    Logger.error(
      error,
      { detail: 'Closing Investigation Failed' },
      'Closing Investigation Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: 'Closing Investigation Failed - ' + error.message
        }
      ]
    });
  }
};

module.exports = closeInvestigation;
