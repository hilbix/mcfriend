// BLOCK x y z
// BLOCK pos
//
// Fetch the block, even if not loaded

const p	= yield ['pos', _];
let old;

for (let i=100;; )
  {
    const b	= yield ['block', p];
    if (b || --i<0)
      {
        old && (yield ['TP', old]);
        if (!b) throw `cannot locate block ${p}`;
        return b;
      }

    old ??= yield ['pos'];
    yield ['tp', (yield ['SPOT', 10, p]) ?? p];
    yield ['wait 10'];
  }

