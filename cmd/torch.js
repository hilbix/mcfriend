// place torches where it is dark
//
// torch list
// torch [item]

this.torched	??= [];
this.torches	??= 0;

switch (_[0])
  {
  case 'list':
    return yield ['act', torches, 'torches', torched];
  }

const t	= _[0] ?? 'torch';

const w = Array.from(yield ['invs']).filter(_ => _.id === t);
if (!w.length) return yield ['say NO', t];

const p = yield ['pos'];
const b = yield ['block', p, 27];
const pos = [];
for (const a of b)
  {
    if (a.id === t) return;
    if (a.id !== 'air') continue;
    if (a._.light > 10 && t === 'torch') return;

    // check block under torch is something we can place a torch
    const g = yield ['block', a.pos(0,-1,0)];
    if (g.light > 10) return;
    switch (g.id)
      {
      case t: return;
      case 'air':
      case 'water': continue;
      }
//    console.error(a, g);

    pos.push(a);
  }

if (!pos.length)
  return; //'no space to place torch';

this.torches++;
this.torched.push(pos[0]._.position);
if (torched.length>100)
  torched.shift();

yield ['equip', 'hand', w[0]];
try {
  yield ['place', pos[0]];
} catch (e) {
  return ['note placing', t, 'failed', pos[0]];
}

return ['say placed', t, pos[0]];

