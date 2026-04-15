// DOUBLE block [orientation]
//
// Place a doublechest

function* put(pos, dir)
{
  console.error('HERE', pos, dir);

  const b	= yield ['block', pos];
//  if (!isAir(b)) return;

  const item	= yield ['getsome', yield ['item chest']];
  if (!item)
    throw 'out of chests?';

  const p = yield ['SPOT', 3, pos];
  if (p === void 0) return;
  if (p)
    yield ['Move', p];

  yield ['verbose place', item.type, b];
  try {
    yield yield ['equip hand', item.type];
//    const x = yield ['pos', b.dir('d')];
    yield ['placed', b, dir];
    yield yield ['wait'];
    return;
  } catch(_) { console.error('ERR', _) };
}

function pla()
{
  const p = yield ['pos'];

  const item	= yield ['getsome', yield ['item chest']];
  
  yield ['TP', p];
  yield ['equip hand', item.type];

  yield ['placed', p.pos(0, -1, 0)];
  yield ['placed', p.pos(1, -1, 0)];
}

yield* pla();

//const b	= _.shift();
//
//yield* put(b.pos( 0,0,0), 's');
//yield* put(b.pos( 0,0,0), 'w');

//for (const d of 'dewnsu')
