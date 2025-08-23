// automatically mark empty chestsigns
//
// signs		find signs
// signs BOTS store	make line one and two

const s = yield ['osign'];

for await (const a of s)
  {
    yield ['act', a];
  }
