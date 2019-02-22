const mod10 = require("../src/mod10");
const index = require("../src/index");

const data = {
  blockchain: {
    _id: "5c5003d55c63d51f191cadd6",
    algorithm: "mod10sha,0000",
    hash: "000078454c038871fa4d67b0022a30baaf25eaa231f8991b108e2624f052f3f8",
    nonce: "10312",
    timestamp: 1548747788716,
    __v: 0,
    data: [
      {
        _id: "5c4f20695c63d51f191cadd1",
        from: "CMGT Mining Corporation",
        to: "Bob PIKAB",
        amount: 1,
        timestamp: 1548689513858
      }
    ]
  },
  transactions: [
    {
      _id: "5c5003d55c63d51f191cadd7",
      from: "CMGT Mining Corporation",
      to: "Bas BOOTB",
      amount: 1,
      timestamp: 1548747733261,
      __v: 0
    }
  ],
  timestamp: 1548748101396,
  algorithm: "mod10sha,0000",
  open: true,
  countdown: 57235
};

describe("index", () => {
  test("prev hash", () => {
    expect(index.generatePreviousHashString(data)).toBe(
      "000078454c038871fa4d67b0022a30baaf25eaa231f8991b108e2624f052f3f8CMGT Mining CorporationBob PIKAB11548689513858154874778871610312"
    );
  });
});

describe("mod10", () => {
  test("Text to ASCII Sequence", () => {
    const t = mod10.convertToSequence("text");

    expect(t).toEqual([1, 1, 6, 1, 0, 1, 1, 2, 0, 1, 1, 6]);
  });

  test("To chunks of 10 or less", () => {
    const t1 = mod10.convertToSequence("text");
    const t2 = mod10.chunkSequence(t1);

    expect(t2).toEqual([[1, 1, 6, 1, 0, 1, 1, 2, 0, 1], [1, 6]]);
  });

  // HINT: Recursive!
  test("Fill all chunks to 10", () => {
    const t1 = mod10.convertToSequence("text");
    const t2 = mod10.chunkSequence(t1);

    expect(mod10.fillChunks(t2)).toEqual([
      [1, 1, 6, 1, 0, 1, 1, 2, 0, 1],
      [1, 6, 0, 1, 2, 3, 4, 5, 6, 7]
    ]);
  });

  // HINT: Recursive!
  test("Sum sequence", () => {
    const t1 = mod10.convertToSequence("text");
    const t2 = mod10.chunkSequence(t1);
    const t3 = mod10.fillChunks(t2);

    expect(mod10.sumSequence(t3)).toEqual([2, 7, 6, 2, 2, 4, 5, 7, 6, 8]);
  });

  test("Hash simple word", () => {
    expect(mod10.hash("text")).toBe(
      "d0b3cb0cc9100ef243a1023b2a129d15c28489e387d3f8b687a7299afb4b5079"
    );
  });

  test("Hash from prev block and gather values", () => {
    const prevHashString = index.generatePreviousHashString(data);
    expect(mod10.hash(prevHashString)).toBe(
      "00005d430ce77ad654b5309a770350bfb4cf49171c682330a2eccc98fd8853cf"
    );
  });

  test("Hash from next block no gathered values", () => {
    expect(
      mod10.hash(
        "00005d430ce77ad654b5309a770350bfb4cf49171c682330a2eccc98fd8853cfCMGT Mining CorporationBas BOOTB1154874773326115487481013963926"
      )
    ).toBe("000068fe4cbbe34a1efaffb8959758fde8da0bdb82aad9e8b78815a22823afd4");
  });

  test("Extra hash test", () => {
    expect(
      mod10.hash(
        "000078454c038871fa4d67b0022a30baaf25eaa231f8991b108e2624f052f3f8 CMGT Mining Corporation Bob PIKAB 1 1548689513858 1548747788716 10312"
      )
    ).toBe("00005d430ce77ad654b5309a770350bfb4cf49171c682330a2eccc98fd8853cf");
  });

  test("Gather next values and hash", () => {
    const t = index.generateNextHashString(
      data,
      { name: "Bas BOOTB", amount: "1" },
      "00005d430ce77ad654b5309a770350bfb4cf49171c682330a2eccc98fd8853cf"
    );
    const nonce = 3926;
    expect(t).toBe(
      "00005d430ce77ad654b5309a770350bfb4cf49171c682330a2eccc98fd8853cfCMGT Mining CorporationBas BOOTB115487477332611548748101396"
    );

    expect(mod10.hash(`${t}${nonce}`)).toBe(
      "000068fe4cbbe34a1efaffb8959758fde8da0bdb82aad9e8b78815a22823afd4"
    );
  });
});
