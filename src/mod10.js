const flatten = require("lodash/flatten");
const flow = require("lodash/flow");
const chunk = require("lodash/chunk");
const { sha256 } = require("js-sha256");

const composeStringFromValues = require("./composeStringFromValues");

/**
 * Fills an array to range
 * @param {*} start
 * @param {*} end
 */
const fillRange = (start, end) =>
  Array(end - start + 1)
    .fill()
    .map((_item, index) => start + index);

/**
 * Fills an array from the latest index until the given to number
 * @param {*} arr
 * @param {*} to
 */
const fillArrayTo = (arr, to) => [...arr, ...fillRange(0, to - 1)];

/**
 * Convert to ASCII characters,
 * convert to numbers,
 * and split them
 * @param {*} hashStr
 */
const convertToSequence = hashStr =>
  flatten(
    hashStr
      .replace(/\s/g, "")
      .split("")
      .map(c => {
        const char = isNaN(c)
          ? c
              .charCodeAt(0)
              .toString()
              .split("")
              .map(Number)
          : c;
        return char;
      })
  );

/**
 * Chunk sequence into 10
 * @param {*} sequence
 */
const chunkSequence = (sequence, amount = 10) => chunk([...sequence], amount);

/**
 * Fill chunks to 10
 * if not the length % 10 is not 0
 * @param {*} chunk
 * @param {*} filledChunks
 * @param {*} i
 */
const fillChunks = (chunk, filledChunks = [], i = 0) => {
  if (!chunk[i]) return filledChunks;

  const filled =
    chunk[i].length % 10 !== 0
      ? fillArrayTo(chunk[i], 10 - chunk[i].length)
      : chunk[i];

  const next = i + 1;

  return fillChunks(chunk, [...filledChunks, filled], next);
};

/**
 * Sum each chunk of the sequence
 * @param {*} chunkedSequence
 * @param {*} summed
 */
const sumSequence = (chunkedSequence = [], summed = []) => {
  // No more sequence blocks, done
  if (!chunkedSequence.length) return [...summed];

  if (!summed.length) {
    // Don't add up if it's just one block
    if (chunkedSequence.length === 1) return chunkedSequence;
    // Get first sequence, but spread to stop manipulating the initial sequence
    summed = [...chunkedSequence.shift()];
  }

  // Get next sequence
  const nextSequence = [...chunkedSequence.shift()];
  // Map over and increment
  const added = summed.map(
    (number, i) => (parseInt(number, 10) + parseInt(nextSequence[i], 10)) % 10
  );

  return sumSequence(chunkedSequence, added);
};

/**
 * @description MOD10 Algorithm
 */
const hash = flow([
  convertToSequence,
  chunkSequence,
  fillChunks,
  sumSequence,
  composeStringFromValues,
  sha256
]);

module.exports = {
  hash,
  fillArrayTo,
  convertToSequence,
  chunkSequence,
  fillChunks,
  sumSequence
};
