//	fill chests marked 'put' with inventory items


const keep = {};
let hadsign;

function* put(item, ...where)
{
  // this is not correct in case the put chest is full we shall fallback to store
  for (const [c,s] of (yield ['CHEST', where]) || [])
    {
      if (!c) continue;

      const i = s.text[3];
      try {
        const items = yield ['item', i];
        hadsign |= items?.filter(_ => _.id === item.id).length;
      } catch(e) {
        if (i !== 'MISC') throw e;		// ignore MISC
      }

      if (yield ['CACHE get full', c]) continue;

      const h = (yield ['have', item.id]) - (parseInt(keep[item.id])|0);
//      console.error(`PUT have ${h} ${keep[item.id]}`, yield ['have', item.id], hadsign);
//      console.error(`PUT have ${h} ${keep[item.id]}`, toJ(item));
//      console.error(`PUT have ${h} ${keep[item.id]}`, item.id);
      //yield ['act have', h, item];
      if (h <= 0)
        {
          yield ['OPEN'];
          return true;
        }

      console.log(`PUT ${item} ${c} ${h}`, yield ['hand', item]);
      const r = yield ['OPEN', c];
      if (!r) continue;
      try {
        const cnt = item.n || h;
        yield yield ['put', r, item, cnt];
        yield ['act put', cnt, item, s];
        return true;
      } catch (e) {
        if (e.message === 'destination full')
          {
            yield ['OPEN'];	// take item out of your hand!
            yield ['wait'];
            yield yield ['CACHE set full', c];
          }
        else
          {
            yield ['act OOPS', e.message, c, s, item];
//            yield ['list inv'];
          }
      } finally {
        yield ['wait', 5];
      }
    }
}

function* valid(i)
{
  const id	= i.id;
  if (!id)		return;		// nothing is not valid
//  const _	= keep[id];
//  if (_ !== void 0)	return;		// ignore already seen
  const k	= keep[id]	??= ((yield [`set item:${i.id}:keep`]) ?? true);
//  yield ['act PUT', i, i.id, keep[i.id]];
  if (`${k}` !== `${k|0}`) return k;
  const h	= (yield ['have', i.id])|0;
  return h > k;
}

const much = [], more = [], over = [];

for (const i of yield ['invs'])
  if (yield* valid(i))
    {
//      yield ['act PUT', i, i.id, keep[i.id]];
      hadsign = false;
      if ((yield* put(i, 'store', i.id))
       || (yield* put(i, 'put', i.id))
       || (yield* put(i, 'fill', i.id))
       || (yield* put(i, 'craft', i.id))
       || (yield* put(i, 'overflow', i.id))
       || (yield* put(i, 'toomuch', i.id))
       || (yield* put(i, 'destroy', i.id))
         )
        yield ['wait', 5];
      else if (hadsign)
        much.push(i);
      else
        more.push(i);
    }

//yield ['wait', 5];

for (const i of more)
  (yield* put(i, 'put', 'MISC')) || over.push(i);
for (const i of much)
  (yield* put(i, 'toomuch', 'MISC')) || over.push(i);
for (const i of over)
  (yield* put(i, 'overflow', 'MISC')) || (yield * put(i, 'destroy', 'MISC')) || (yield ['act cannot put', i]);

yield ['OPEN'];	// close everything

