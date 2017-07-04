import _ from 'lodash';

export const setMetadata = (obj, metadata, key) => {
  if (_.has(obj, key)) {
    // eslint-disable-next-line no-param-reassign
    obj[key] = metadata;
  } else {
    Object.defineProperty(obj, key, {
      value: metadata,
      enumerable: false,
      writable: true,
    });
  }
};

export function getMetadataProp(obj, prop, key) {
  const propPath = _.isArray(prop) ? prop : [prop];
  return _.get(obj, [key, ...propPath]);
}

export const updateMetadata = (metadata, update, markChange = true) => {
  const timestamp = markChange ? { modifiedTimestamp: Date.now() } : {};
  return _.merge({}, metadata, update, timestamp);
};

export const getMetadata = (obj, key) => _.get(obj, [key]);

export const hasMetadata = (obj, key) => _.has(obj, [key]);
