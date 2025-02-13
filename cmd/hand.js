// equip an item

const w = Array.from(yield ['invs']).filter(_ => _.id);
for (const x of w)
  yield yield ['act', x._.slot, x.type, x.id];

const x = yield ['hand'];
yield yield ['act HAND', x];

for (const x of w)
  if (x._.slot == _[0])
    {
      yield yield ['act equip', x];
      yield yield ['equip hand', x];
    }

