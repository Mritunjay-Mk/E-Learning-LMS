import xss from 'xss';

const sanitize = (value) => {
  if (typeof value === 'string') return xss(value.trim());
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitize(item)]));
  }
  return value;
};

export const xssSanitizer = (req, _res, next) => {
  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  req.query = sanitize(req.query);
  next();
};
