const { filter, flow, get, includes, some } = require('lodash/fp');
const { createFunctionMap } = require('./dataTransformations');
let Logger;

const doKeysIncludeEntityValue = (paths) => (entity) => (investigation) =>
  some((path) => flow(get(path), includes(get('value', entity)))(investigation), paths);

const isEntityInInvestigationByType = createFunctionMap({
  IPv4: doKeysIncludeEntityValue(['title']),
  IPv6: doKeysIncludeEntityValue(['title']),
  email: doKeysIncludeEntityValue(['title', 'assignee.email']),
  domain: doKeysIncludeEntityValue(['title']),
  url: doKeysIncludeEntityValue(['title'])
});

const searchInvestigations = (entity, investigations, _Logger) => {
  Logger = _Logger;
  return filter(isEntityInInvestigationByType('type', entity), investigations);
};

module.exports = searchInvestigations;
