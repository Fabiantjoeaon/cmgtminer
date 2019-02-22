const express = require("express");
const axios = require("axios");
const qs = require("qs");
const flatten = require("lodash/flatten");

const mod10 = require("./mod10");
const composeStringFromValues = require("./composeStringFromValues");

const app = express();

const ownData = {
  name: "fabian",
  amount: 1
};

const getFinalBlock = () =>
  axios.get("http://programmeren9.cmgt.hr.nl:8000/api/blockchain/next");
const postBlock = nonce =>
  axios.post(
    "http://programmeren9.cmgt.hr.nl:8000/api/blockchain",
    {
      nonce: nonce.toString(),
      user: ownData.name
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const isCorrectBlock = hash => hash.slice(0, 4) === "0000";

const generatePreviousHashString = ({ blockchain }) => {
  const previousHashValues = [blockchain.hash];
  for (const { from, to, amount, timestamp } of blockchain.data) {
    previousHashValues.push([from, to, amount, timestamp]);
  }
  previousHashValues.push([blockchain.timestamp, blockchain.nonce]);

  return composeStringFromValues(flatten(previousHashValues));
};

const generateNextHashString = (
  { transactions, timestamp: rootTimestamp },
  ownData,
  prevHash
) => {
  const nextHashValues = [prevHash];
  for (const { from } of transactions) {
    nextHashValues.push([from]);
  }
  nextHashValues.push([ownData.name, ownData.amount]);
  for (const { timestamp } of transactions) {
    nextHashValues.push([timestamp]);
  }
  nextHashValues.push([rootTimestamp]);

  return composeStringFromValues(flatten(nextHashValues));
};

const generateHashWithPossibleNonces = async (
  str,
  nonce = -1,
  timeout = 4000
) => {
  console.log(str);
  const hash = mod10.hash(`${str}${nonce.toString()}`);
  console.log(nonce, hash);
  if (isCorrectBlock(hash)) return { hash, nonce };

  const next = nonce + 1;

  let t = timeout - 1;

  if (t === 0) {
    t = 4000;
    await sleep(10);
  }

  return generateHashWithPossibleNonces(str, next, t);
};

const mine = async () => {
  const { data } = await getFinalBlock();
  console.log(data);
  if (data.countdown < 10000) {
    console.log(`Waiting for max countdown, ${data.countdown} seconds`);
    await sleep(data.countdown);
  }

  console.time("mined in");
  const prevHashString = generatePreviousHashString(data);
  const prevHash = mod10.hash(prevHashString);

  const nextHashString = generateNextHashString(data, ownData, prevHash);
  const { nonce } = await generateHashWithPossibleNonces(nextHashString);
  console.timeEnd("mined in");
  const res = await postBlock(nonce);
  console.log(`Posted solution with nonce ${nonce}`, res.data);
};

// const h = async (str, iNonce = -1) => {
//   const { nonce } = await generateHashWithPossibleNonces(str, iNonce);
//   console.timeEnd("mined in");
//   const res = await postBlock(nonce);
//   console.log(`Posted solution with nonce ${nonce}`, res.data);

//   if (res.data.message === "nonce not correct") {
//     console.log(res.data.message);
//     await sleep(1000);
//     await h(str, nonce + 1);
//   } else {
//     console.log("CONGRATS", res.data);
//   }
// };

app.set("port", 3000);
app.listen(app.get("port"), async () => {
  console.log(`Server started on port ${app.get("port")}`);
  await mine();
});

module.exports = { generatePreviousHashString, generateNextHashString };
