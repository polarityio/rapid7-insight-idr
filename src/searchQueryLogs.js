const { flow, get, replace, find, eq, map, orderBy, slice, size } = require('lodash/fp');
const { or } = require('./dataTransformations');
const RequestError = require('../errors/request-error');

/**
 *
 * @param entity
 * @param options
 * @param requestWithDefaults
 * @param Logger
 * @param _moreStuffUrl
 * @param _allResults
 * The _allResults object contains two top level keys that hold either log events or in the event of a
 * statistics based query, contains a top level statistics key. In the case of events, each call to
 * searchQueryLogs appends additionally fetched log events to the `events` array inside of `_allResults`.
 * _allresults : {
 *     events: [],
 *     statistics: {},
 *     query: ''
 * }
 * @returns {Promise<*>}
 */
const searchQueryLogs = async (
  entity,
  options,
  requestWithDefaults,
  Logger,
  _moreStuffUrl,
  _allResults = null
) => {
  const query = flow(
    get('logQuery'),
    replace('{{ENTITY}}', entity.value.toLowerCase())
  )(options);

  const queryLogsResponse = await requestWithDefaults({
    method: 'GET',
    url:
      _moreStuffUrl ||
      `https://${options.regionCode.value}.rest.logs.insight.rapid7.com/query/logsets`,
    ...(!_moreStuffUrl && {
      qs: {
        query,
        logset_name: options.logset.split(',').map(log => log.trim()),
        time_range: options.logQueryTimeRange
      },
      useQuerystring: true
    }),
    headers: {
      'x-api-key': options.apiKey,
      'Content-Type': 'application/json',
      size: 1000
    },
    json: true
  });

  if (queryLogsResponse.statusCode !== 200 && queryLogsResponse.statusCode !== 202) {
    throw new RequestError(
      queryLogsResponse.body.message
        ? queryLogsResponse.body.message
        : `Unexpected status code ${queryLogsResponse.statusCode} received`,
      queryLogsResponse.statusCode,
      queryLogsResponse.body
    );
  }

  // On the first invocation of this method, we need to initialize our _allResults object
  if (_allResults === null) {
    _allResults = {
      // Events are log results and it is populated if the query only contains a `where` clause
      // (i.e., there are no `groupBy` or `calculate` clauses.
      events: [],
      // We initialize statistics to `null` so it's easier to tell in the template if
      // there is any statistics information to display.  Statistics are populated if the
      // query contains a `calculate` or `groupBy` clause.
      statistics: null,
      // Groups Formatted is populated via the `statistics.groups` field but is designed
      // to be easy to render for our template.  It's a remap of the statistics.groups
      // data.  It will be populated for queries that use the `groupBy` syntax.
      formattedGroupStats: [],
      // This is the raw query that was run including the entity substitution on {{ENTITY}}
      // This is used by the template.
      query: query,
      groupBy: getGroupByFields(query, Logger),
      link: getSearchLink(queryLogsResponse, query, options)
    };
  }

  // Events are returned for queries that do not include a `groupby` or `calculate` predicate
  // If the query is a `groupby` query or a `calculate` query then there will be a top level statistics
  // object that we want to capture.
  if (Array.isArray(queryLogsResponse.body.events)) {
    const eventQueryLogs = getQueryEvents(queryLogsResponse, query, options);
    _allResults.events = _allResults.events.concat(eventQueryLogs);
  } else if (typeof queryLogsResponse.body.statistics === 'object') {
    _allResults.statistics = getStatistics(queryLogsResponse);
  } else {
    // unknown response
    Logger.error({ queryLogsResponse }, 'Received an unexpected response payload');
  }

  const moreStuffUrl = flow(
    get('body.links'),
    find(flow(get('rel'), or(eq('Self'), eq('Next')))),
    get('href')
  )(queryLogsResponse);

  if (moreStuffUrl && size(_allResults.events) < options.maxResults) {
    return await searchQueryLogs(
      entity,
      options,
      requestWithDefaults,
      Logger,
      moreStuffUrl,
      _allResults
    );
  }

  const sortEventsByTimestamp = flow(orderBy('timestamp', 'desc'));
  _allResults.events = slice(
    0,
    options.maxResults,
    sortEventsByTimestamp(_allResults.events)
  );

  // Only format group stats if we have a statistics object to work with
  if (_allResults.statistics) {
    _allResults.formattedGroupStats = convertGroupsToTemplateFormat(_allResults);
  }

  return _allResults;
};

function getSearchLink(searchResult, query, options){
  let logIdsString = '';
  if(Array.isArray(searchResult.body.logs)){
    const logIds = searchResult.body.logs.map(log => {
      return `"${log}"`;
    });
    logIdsString = `%5B${logIds.join('%2C')}%5D`;
  }
  // return `https://${options.regionCode.value}.idr.insight.rapid7.com/op/${
  //     options.opCode
  // }#/search?logs=%5B"${searchResult.body.logs[0]}"%5D&query=${encodeURIComponent(
  //     query
  // )}&range=${encodeURIComponent(options.logQueryTimeRange)}`
  return `https://${options.regionCode.value}.idr.insight.rapid7.com/op/${
      options.opCode
  }#/search?logs=${logIdsString}&query=${encodeURIComponent(
      query
  )}&range=${encodeURIComponent(options.logQueryTimeRange)}`
}

/**
 * If the user uses a `groupBy` clause in their query the API will return a `group` array with the following
 * format:
 *
 * ```
 *   "groups": [
 *      {
 *        "[WINDOWS-14VBH5E, 7045]": {
 *          "count": 10
 *        }
 *      }
 *    ],
 * ```
 *
 * In this format the groups array is keyed on the groupBy fields.
 * Here is how we want to display this information:
 *
 * ```
 * source_json.computerName: WINDOWS-14VBH5E
 *   source_json.eventCode: 7045
 *     count: 10
 * ```
 * Here is a single depth data format that we convert into for easy template display:
 *
 * ```
 * [
 *   {
 *     groupings: [
 *       {
 *         groupByField: 'source_json.computerName',
 *         groupByValue: 'WINDOWS-14VBH5E'
 *       },
 *       {
 *         groupByField: 'source_json.eventCode',
 *         groupByValue: 7045
 *       }
 *     ],
 *     stat: {
 *       statType: 'count',
 *       statValue: 10
 *     }
 *   },
 *   {
 *      // next result
 *   }
 * ]
 * ```
 *
 * Notice that the groupings array index value corresponds to the "depth" we which use for indentation.  The maximum depth
 * is 6 (up to a total of 5 grouping keys and the actual statistic value which comes last).
 *
 * @param queryLogsResponse
 */
function convertGroupsToTemplateFormat(_allResults) {
  const formattedResult = [];
  const groupByFields = _allResults.groupBy;
  const groups = _allResults.statistics ? _allResults.statistics.groups : [];

  groups.forEach((group) => {
    // We always assume there is only 1 key in the object which from all the sample queries we've run
    // seems to be the case.
    const groupByValueString = Object.keys(group)[0];
    // groupByValueString is a string of format `"[Value1, Value2]"` in the event of multiple values
    // or just a plain string in the event of a single vlaue.
    // remove first and last character which are the array brackets if we have multple values
    const groupByValueNoBrackets = groupByValueString.startsWith('[')
      ? groupByValueString.slice(1, groupByValueString.length - 1)
      : groupByValueString;
    const groupByValues = groupByValueNoBrackets.split(',').map((value) => value.trim());
    const result = {
      groupings: [],
      stat: {}
    };
    groupByValues.forEach((value, index) => {
      result.groupings.push({
        groupByField: groupByFields[index],
        groupByValue: value
      });
    });
    // Now that we've pushed our fields, we push the final value
    // Again we assume that there is only one statKey
    const statKey = Object.keys(group[groupByValueString])[0];
    const statValue = group[groupByValueString][statKey];
    result.stat.statType = statKey;
    result.stat.statValue = statValue;

    formattedResult.push(result);
  });
  return formattedResult;
}

/**
 * When results are returned by the Rapid7 API it returns the grouping results but
 * does not provide any information on what fields are being grouped on.  As a result,
 * we generate a groupBy array based on the `groupBy` clause within the query itself.
 * The `groupBy` clause will look like this:
 *
 * groupBy(field1, field2, field3)
 *
 * Having this array makes it easier for the template to let the user know what
 * fields are being grouped on.
 *
 * Documentation: https://docs.rapid7.com/insightidr/use-a-search-language/#groupby
 *
 * @param query
 */
function getGroupByFields(query, Logger) {
  const groupRegex = /groupby\((?<groups>.+?)\)/gim;
  let allGroups = [];
  for (const match of query.matchAll(groupRegex)) {
    // Array of individual groupBy groups
    const groups = match.groups.groups.split(',').map((group) => group.trim());
    allGroups = allGroups.concat(groups);
  }
  return allGroups;
}

/**
 * Non-statistic queries return a top-level events array which contains event objects. The event objects
 * events contain a `message` property which is can be a JSON string.
 * The JSON string must be parsed into a javascript object.
 */
function getQueryEvents(queryLogsResponse, query, options) {
  let allEventQueryLogs = flow(
    get('body.events'),
    map((event) => ({
      ...event,
      // If the message looks like JSON parse it into an object
      message: event.message[0] === '{' ? JSON.parse(event.message) : event.message
    }))
  )(queryLogsResponse);

  return allEventQueryLogs;
}

/**
 * Returns the statistics object on the query response
 * @param queryLogsResponse
 * @returns {*}
 */
function getStatistics(queryLogsResponse) {
  return queryLogsResponse.body.statistics;
}

module.exports = searchQueryLogs;
