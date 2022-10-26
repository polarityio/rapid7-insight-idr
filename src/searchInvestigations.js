const { filter, flow, get, includes, some, slice } = require('lodash/fp');
const { createFunctionMap } = require('./dataTransformations');

const doKeysIncludeEntityValue = (paths) => (entity) => (investigation) =>
  some((path) => flow(get(path), includes(get('value', entity)))(investigation), paths);

const isEntityInInvestigationByType = createFunctionMap({
  IPv4: doKeysIncludeEntityValue(['title']),
  IPv6: doKeysIncludeEntityValue(['title']),
  email: doKeysIncludeEntityValue(['title', 'assignee.email']),
  domain: doKeysIncludeEntityValue(['title']),
  url: doKeysIncludeEntityValue(['title']),
  hash: doKeysIncludeEntityValue(['title'])
});

const searchInvestigations = (entity, investigations, options, _Logger) =>
  flow(
    filter(isEntityInInvestigationByType('type', entity)),
    slice(0, options.maxResults)
  )(investigations);


module.exports = searchInvestigations;
