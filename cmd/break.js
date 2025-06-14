// break needs 2 signs which define the area
//
// within the AREA the given blocks are broken
// Use the full area.
//
// Note:  This might break blocks the sign is on!

const b = yield ['AREA break'];
if (!b) return 'act no area yet';

for (const a of b)
  {
    yield ['note breaking', a];
    const iter = yield ['block', a[0], a[1]];
    console.error('break.sh:', iter);
    yield yield ['DIG', iter, a[0].text[3]];
  }

