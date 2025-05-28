// PLACER block item[s]
//
// Plase the first available item at the given block

const block = _.shift();
const items = yield ['item', _];

for (const d of 'dewnsu')
  {
    const b	= yield ['block', block, d];
    if (isAir(b[0])) continue;

    const item	= yield ['getsome', items];
    if (!item)
      throw `out of ${items.map(_ => _.id)}`;

    const p = yield ['SPOT', 3, block];
    if (p === void 0) return;

    if (p)
      yield ['Move', p];

    yield ['act place', item.type, b];
    try {
      yield yield ['equip hand', item.type];
      yield ['placer', b, `${d}r`];
      yield yield ['wait'];
      return;
    } catch {};
  }

