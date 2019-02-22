const composeStringFromValues = vals =>
  vals.reduce((accumulator, currentValue) => (accumulator += currentValue), "");

module.exports = composeStringFromValues;
