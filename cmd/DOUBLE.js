// DOUBLE block [orientation]
//
// Place a doublechest

function* put(pos, delta, type)
{
  const b	= yield ['block', pos];
  if (isAir(b)) return;

  const item	= yield ['getsome', 'chest'];
  if (!item)
    throw `out of ${items.map(_ => _.id)}`;

  const p = yield ['SPOT', 3, pos];
  if (p === void 0) return;
  if (p)
    yield ['Move', p];

  yield ['verbose place', item.type, b];
  try {
    yield yield ['equip hand', item.type];
    yield ['retry', 2, 'placer', b, `${d}r`];
    yield yield ['wait'];
    return;
  } catch {};
}

const b	= _.shift();

put(b, 0, 'left');
put(b, 1, 'right');

//for (const d of 'dewnsu')
