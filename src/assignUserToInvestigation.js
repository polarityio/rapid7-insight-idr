const { get } = require('lodash/fp');

const assignUserToInvestigation = async (
  { investigationId, email },
  options,
  requestWithDefaults,
  callback,
  Logger
) => {
  try {
    const response = await requestWithDefaults({
      method: 'PUT',
      url: `https://${options.regionCode.value}.api.insight.rapid7.com/idr/v1/investigations/${investigationId}/assignee`,
      headers: {
        'x-api-key': options.apiKey,
        'Content-Type': 'application/json'
      },
      body: {
        user_email_address: email
      },
      json: true
    });

    if (response.statusCode !== 200) {
      throw new Error(
        get('body.message', response) ||
          (response.body && JSON.stringify(response.body)) ||
          'Unknown Assigning User to Investigation Failure'
      );
    }

    callback(null, { newInvestigation: get('body', response) });
  } catch (error) {
    Logger.error(
      error,
      { detail: 'Assigning User to Investigation Failed' },
      'Assigning User to Investigation Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: 'Assigning User to Investigation Failed - ' + error.message
        }
      ]
    });
  }
};

module.exports = assignUserToInvestigation;
