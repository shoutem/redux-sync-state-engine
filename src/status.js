import _ from 'lodash';

export const STATUS = '@@shoutem/redux-sync-state-engine/status';

export const setStatus = (obj, status) => {
  if (_.has(obj, STATUS)) {
    // eslint-disable-next-line no-param-reassign
    obj[STATUS] = status;
  } else {
    Object.defineProperty(obj, STATUS, {
      value: status,
      enumerable: false,
      writable: true,
    });
  }
};

export function getStatusProp(obj, prop) {
  const propPath = _.isArray(prop) ? prop : [prop];
  return _.get(obj, [STATUS, ...propPath]);
}

export const updateStatus = (status, update, markChange = true) => {
  const timestamp = markChange ? { modifiedTimestamp: Date.now() } : {};
  return _.merge({}, status, update, timestamp);
};

export const getStatus = obj => _.get(obj, [STATUS]);

export const hasStatus = obj => _.has(obj, [STATUS]);
