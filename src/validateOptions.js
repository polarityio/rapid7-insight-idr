const { includes, size, flow, isEmpty, get } = require('lodash/fp');
const reduce = require('lodash/fp/reduce').convert({ cap: false });
let schedule = require('node-schedule');

const refreshInvestigations = require('./refreshInvestigations');
const { parseKeyValueOptionList } = require('./dataTransformations');
const { INVESTIGATION_REFRESH_TIME } = require('./constants');

const validateOptions = (options, callback) => {
    const stringOptionsErrorMessages = {
      apiKey: 'You must provide a valid API Key from your Nexpose Insight Account',
      logQuery: 'You must have a query, and cannot leave this field blank'
    };

    const stringValidationErrors = _validateStringOptions(
      stringOptionsErrorMessages,
      options
    );

    const logQueryHasNoEntity = !includes('{{ENTITY}}', options.logQuery.value)
      ? [
          {
            key: 'logQuery',
            message:
              'You must have the string "{{ENTITY}}", somewhere in your query or it will not work.'
          }
        ]
      : [];

    const threatNamesAreValid =
      (size(get('threats.value', options)) &&
        flow(get('threats.value'), includes('->'))(options)) ||
      !size(get('threats.value', options));
      
    const parsedThreats =
      threatNamesAreValid && size(get('threats.value', options)) && parseKeyValueOptionList('threats', options, true);

    const threatsNotParsable =
      !threatNamesAreValid || parsedThreats === false
        ? [
            {
              key: 'threats',
              message: 'Threats not formatted correctly.'
            }
          ]
        : [];

    const errors = stringValidationErrors
      .concat(logQueryHasNoEntity)
      .concat(threatsNotParsable);

    // if (!errors.length) {
    //   Logger.info(
    //     `Refresh Investigations Data Time set to ${INVESTIGATION_REFRESH_TIME} minutes`
    //   );
    //   setJob(
    //     schedule.scheduleJob(
    //       `*/${INVESTIGATION_REFRESH_TIME} * * * *`,
    //       refreshInvestigations(setInvestigations, options, requestWithDefaults, Logger)
    //     )
    //   );
    // }

    callback(null, errors);
  };

const _validateStringOptions = (stringOptionsErrorMessages, options, otherErrors = []) =>
  reduce((agg, message, optionName) => {
    const isString = typeof options[optionName].value === 'string';
    const isEmptyString = isString && isEmpty(options[optionName].value);

    return !isString || isEmptyString
      ? agg.concat({
          key: optionName,
          message
        })
      : agg;
  }, otherErrors)(stringOptionsErrorMessages);

module.exports = validateOptions;
