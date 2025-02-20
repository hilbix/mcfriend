//	fill chests marked 'put' with inventory items


const keep = {};

let hadsign;
function* put(item, ...where)
{
  // this is not correct in case the put chest is full we shall fallback to store
  for (const [c,s] of (yield ['CHEST', where]) || [])
    {
      if (!c) continue;
      hadsign |= s.text[3] === item.id;
      if (yield ['CACHE get in', c]) continue;

      const h = (yield ['have', item]) - (keep[item.id]|0);
      //yield ['act have', h, item];
      if (h <= 0) return true;

      const r = yield ['OPEN', c];
      if (!r) continue;
      try {
        yield yield ['put', r, item, h];
        //yield ['act putted', h, item];
        return true;
      } catch (e) {
        if (e.message === 'destination full')
          yield yield ['CACHE set in', c];
        else
          yield ['act OOPS', e.message, c, s];
      } finally {
        yield ['wait', 5];
      }
    }
}

function* valid(i)
{
  const id	= i.id;
  if (!id)		return;		// nothing is not valid
  const _	= keep[id];
  if (_ !== void 0)	return;		// ignore already seen
  keep[id]	= 1;
  const k	= keep[id]	??= ((yield [`set item:${i.id}:keep`]) ?? false);
  if (`${k}` !== `${k|0}`) return k;
  const h	= (yield ['have', i.id])|0;
  return h > k;
}

const much = [], more = [], over = [];

for (const i of yield ['invs'])
  if (yield* valid(i))
    {
      hadsign = false;
      if ((yield* put(i, 'store', i.id)) || (yield* put(i, 'put', i.id)) || (yield* put(i, 'overflow', i.id)) || (yield* put(i, 'toomuch', i.id)) || (yield* put(i, 'destroy', i.id)))
        yield ['wait', 5];
      else if (hadsign)
        much.push(i);
      else
        more.push(i);
    }

yield ['wait', 5];

for (const i of more)
  (yield* put(i, 'put', 'MISC')) || over.push(i);
for (const i of much)
  (yield* put(i, 'toomuch', 'MISC')) || over.push(i);
for (const i of over)
  yield* put(i, 'overflow', 'MISC');

yield ['OPEN'];	// close everything

