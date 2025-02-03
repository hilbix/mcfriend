// place torches where it is dark

const w = Array.from(yield ['invs']).filter(_ => _.id === 'torch');
if (!w.length) return 'lacking torches';

const p = yield ['pos'];
const b = yield ['block', p, 27];
for (const a of b)
  {
    if (a.id  !== 'air') continue;

    const g = yield ['block', a.pos(0,-1,0)];
    switch (g.id)
      {
      case 'air':
      case 'torch':
      case 'water': continue;
      }
//    console.error(a, g);

    yield ['equip', 'hand', w[0]];
    try {
      yield ['place', w[0], a];
    } catch (e) {
      return 'placing torch failed';
    }
    return 'placed torch';
  }

return 'no space to place torch';


