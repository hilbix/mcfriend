// place torches where it is dark

const w = Array.from(yield ['invs']).filter(_ => _.id === 'torch');
if (!w.length) return 'lacking torches';

const p = yield ['pos'];
const b = yield ['block', p, 27];
for (const a of b)
  {
    if (a.id  !== 'air') continue;

    const g = yield ['block', a.pos(0,-1,0)];
    if (g.id === 'air' || g.id === 'torch') continue;
//    console.error(a, g);

    yield ['equip', 'hand', w[0]];
    return ['place', w[0], a];
  }

return 'no space to place torch';


