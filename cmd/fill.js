//	actively fill chests marked 'fill' with the given items
// This takes out the items from other chests and puts them into the given chest until it is full.

this.track ??= {};

yield ['note FILL start'];

yield ['CACHE clear'];
yield ['PUT'];

//const a = yield ['chest', 'D'];
const a = yield ['CHEST', 'fill'];
if (!a?.length) return yield 'no signs with "fill"?';

for (const [c,s] of a)
  {
    if (c.container !== true) continue;	// cannot use slotted containers

    yield ['Move', s, 1];
    const r	= yield ['OPEN', c];
    if (!r) continue;

    const i	= r.items().filter(yield* itemFilter(s.text[3]));

    const filt	= yield* itemFilter(s.text[3]);
    let e = 0;
    const need = {};
    for (const x of r.items())
      {
        if (x.empty)
          {
            e++;
            continue;
          }
        if (!filt(x)) continue;
        need[x.id] = (need[x.id]|0) + x.max - x.n;
      }
    const item = {};
    for (const x of yield ['item', s.text[3]])
      {
        item[x.id] = x;
        const n = need[x.id]|0;
        need[x.id] = e ? Math.min(e,5) * x.max : n>x.max ? x.max : n <= x.max/4 ? 0 : n;
      }
    const m = Object.entries(need).filter(([k,v]) => v);
    if (!m.length) continue;	// all full

    try {
      for (const [k,v] of m)
        {
          yield ['AGAIN fill 0'];	// reset backoff
          yield ['verbose GET',k,v];
          yield yield [`get NOFILL ${k}=${v}`];
        }
       yield ['Move', s, 1];
       const r = yield ['OPEN', c];
       for (const [k,v] of m)
         {
           yield ['verbose FILL', item[k], v];
           yield yield ['put', r, item[k], v];
         }
    } catch (e) {
      console.error('FILL', e);
      yield yield ['act ERROR', e];
    }
    yield ['OPEN'];		// close r
    yield yield ['wait', 10];
  }

return ['note FILL done', yield ['AGAIN fill']];

