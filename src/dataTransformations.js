const _ = require('lodash');
const fp = require('lodash/fp');

const { IGNORED_IPS } = require('./constants');

const getKeys = (keys, items) =>
  Array.isArray(items)
    ? items.map((item) => _.pickBy(item, (v, key) => keys.includes(key)))
    : _.pickBy(items, (v, key) => keys.includes(key));

const groupEntities = (entities) =>
  _.chain(entities)
    .groupBy(({ isIP, isDomain, type }) =>
      isIP ? 'ip' : 
      isDomain ? 'domain' : 
      type === 'MAC' ? 'mac' : 
      isMD5 === true ? 'md5' :
      isSHA1 === true ? 'sha1' :
      isSHA256 === true ? 'sha256' :
      'unknown'
    )
    .omit('unknown')
    .value();

const splitOutIgnoredIps = (_entitiesPartition) => {
  const { ignoredIPs, entitiesPartition } = _.groupBy(
    _entitiesPartition,
    ({ isIP, value }) =>
      !isIP || (isIP && !IGNORED_IPS.has(value)) ? 'entitiesPartition' : 'ignoredIPs'
  );

  return {
    entitiesPartition,
    ignoredIpLookupResults: _.map(ignoredIPs, (entity) => ({
      entity,
      data: null
    }))
  };
};

const createFunctionMap = (funcMap) => (pathToFuncMapKey, obj) =>
  fp.get(fp.get(pathToFuncMapKey, obj), funcMap)(obj);

const parseKeyValueOptionList = (key, options, inValidateOptions = false) =>
  fp.flow(
    fp.get(inValidateOptions ? `${key}.value` : key),
    fp.split(','),
    fp.map(fp.flow(fp.split('->'), fp.map(fp.trim))),
    fp.reduce((agg, [key, value]) => {
      if(!key || !value || agg === false) return false 
      return { ...agg, [key]: value };
    }, {})
  )(options);

const or =
  (...[func, ...funcs]) =>
  (x) =>
    func(x) || (funcs.length && or(...funcs)(x));

module.exports = {
  getKeys,
  groupEntities,
  splitOutIgnoredIps,
  createFunctionMap,
  parseKeyValueOptionList,
  or
};
