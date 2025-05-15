// place torches where it is dark

this.torched	??= [];
this.torches	??= 0;

switch (_[0])
  {
  case 'list':
    yield ['act', torches, 'torches', torched];
  }

const w = Array.from(yield ['invs']).filter(_ => _.id === 'torch');
if (!w.length) return yield ['say NO TORCH'];

const p = yield ['pos'];
const b = yield ['block', p, 27];
const pos = [];
for (const a of b)
  {
    if (a.id === 'torch') return;
    if (a.id !== 'air') continue;
    if (a._.light > 10) return;

    // check block under torch is something we can place a torch
    const g = yield ['block', a.pos(0,-1,0)];
    if (g.light > 10) return;
    switch (g.id)
      {
      case 'torch': return;
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
  return 'placing torch failed';
}

return ['say placed torch', pos[0]];

