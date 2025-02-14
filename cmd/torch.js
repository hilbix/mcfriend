// place torches where it is dark

const w = Array.from(yield ['invs']).filter(_ => _.id === 'torch');
if (!w.length) return 'lacking torches';

const p = yield ['pos'];
const b = yield ['block', p, 27];
for (const a of b)
  {
    if (a.id !== 'air') continue;
    if (a.id === 'torch') return;

    // check block under torch is something we can place a torch
    const g = yield ['block', a.pos(0,-1,0)];
    switch (g.id)
      {
      case 'torch': return;
      case 'air':
      case 'water': continue;
      }
//    console.error(a, g);

    yield ['equip', 'hand', w[0]];
    try {
      yield ['place', a];
    } catch (e) {
      return //'placing torch failed';
    }
    return //'placed torch';
  }

//return 'no space to place torch';


