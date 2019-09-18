import { isString } from 'lodash';

const {
  env: {
    PAGE_CACHE_TTL,
  },
} = process;
const prefix = 'PAGE';

const pathCacheConfigs = {
  // '/': (context) => {},
  // '/about': (context) => {},
};

export default (context) => {
  const configFn = pathCacheConfigs[context.path];
  if (!configFn) return null;
  let key = configFn(context);
  const ttl = key.ttl || PAGE_CACHE_TTL;
  key = isString(key) ? key : key.key;

  return {
    ttl,
    key: `${prefix}:${key}`,
  };
};
