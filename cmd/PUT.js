//	fill chests marked 'put' with inventory items

this.lastc = void 0;

function* put(item, ...where)
{
  // this is not correct in case the put chest is full we shall fallback to store
  for (const c of (yield ['CHEST', where]) || [])
    {
      if (!c) continue;

      const h = yield ['have', item];
      if (!h) return true;
      yield ['act have', h, item];

      if (lastc !== c)
        yield yield ['Move', c, 2];
      lastc = c;

      const r = yield ['open', c];
      try {
        yield yield ['put', r, item, h];
        yield ['act putted', h, item];
      } catch (e) {
        yield ['act OOPS', e, c];
      } finally {
        yield ['close', r];
      }
      if (!(yield ['have', item])) return true;
    }
}

for (const i of yield ['invs'])
  if (i.id)
    {
      if ((yield* put(i, 'store', i.id)) || (yield* put(i, 'put', i.id)) || (yield* put(i, 'overflow', i.id)) || (yield* put(i, 'put', 'MISC')))	// not: 'put MISC'!
        continue;
      await sleep(3000);
    }

