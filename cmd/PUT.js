//	fill chests marked 'put' with inventory items

function* put(item, ...where)
{
  // this is not correct in case the put chest is full we shall fallback to store
  for (const c of (yield ['CHEST', where]) || [])
    {
      if (!c) continue;
      if (yield ['CACHE get in', c]) continue;

      const h = yield ['have', item];
      yield ['act have', h, item];
      if (!h) return true;

      const r = yield ['OPEN', c];
      if (!r) continue;
      try {
        yield yield ['put', r, item, h];
        yield ['act putted', h, item];
      } catch (e) {
        if (e.message === 'destination full')
          yield yield ['CACHE set in', c];
        else
          yield ['act OOPS', e.message, c];
      } finally {
        yield ['wait', 5];
      }
      if (!(yield ['have', item])) return true;
    }
}

const had = {};

for (const i of yield ['invs'])
  if (i.id)
    {
      if (had[i.id]) continue;
      had[i.id] = 1;
      if ((yield* put(i, 'store', i.id)) || (yield* put(i, 'put', i.id)) || (yield* put(i, 'overflow', i.id)))
        await sleep(3000);
    }

yield ['wait'];

for (const i of yield ['invs'])
  if (i.id)
    yield* put(i, 'put', 'MISC');

yield ['OPEN'];	// close everything

