
const s = yield ['sign', _];
for (const _ of s || [])
  {
    yield ['act sign', _, 'gave', _, _.valid]
  }

const x = yield ['CHEST', 'put MISC'];
for (const _ of x || [])
  {
    yield ['act chest', _, 'gave', _]
  }

return 'DONE';

