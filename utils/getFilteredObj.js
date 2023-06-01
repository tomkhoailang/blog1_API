module.exports = (obj, rgFields) => {
  return Object.keys(obj).reduce((acc, curr) => {
    if (rgFields.test(curr)) {
      acc[curr] = obj[curr];
    }
    return acc;
  }, {});
};
