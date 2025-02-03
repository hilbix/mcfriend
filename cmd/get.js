//		fill the inventory with standard items (set list:get:item:count X)
// item..	get something out of a storage box
//		item=5 takes 5 such items, default: 1

const i = Array.from(yield ['invs']);

const l = _.length
  ? _.map(_ => _.split('=',2))		// arg: item=n
  : Object
    .entries({} || (yield ['get list get']) || {})
    .filter(([k,v]) =>
      {
        const n = (v|0)||1;
        // check inventory for count of items
        return true;
      })
    .map(([k,v]) => [k,v.count]);

if (!Object.keys(l).length) return [`act please state what to get`];

for (const [k,v] of l)
  {
    const signs = [].concat(yield ['sign', 'get', k], yield ['sign', 'store', k]).filter(_ => _.valid);
    if (!signs?.length)
      {
        yield ['act no sign found for', _];
        continue;
      }
    const n = (v|0)||1;
    for (const s of signs)
      {
//        yield ['act', s];
//        const p = yield ['locate', s];
//        yield ['act', p];
        const d = (yield ['block', s, 6]).filter(_ => _.id === 'chest');
        if (d.length !== 1) return ['act invalid sign', s, d.length];

        // move to the chest
        yield yield ['Move', s];

        // open the chest
        const c = d[0];
        const r = yield ['open', c];

        // locate the needed item
        const v = r.items().filter(_ => _.id === k);
        if (!v.length) 
          {
            yield ['act nothing in', c]
            yield ['close', r];
            continue;
          }

        // take the item and close
        try {
          yield ['take', r, v[0], n];
        } catch (e) {
        }
        yield ['close', r];

        // check that I have enough from this item
        const h = yield ['have', v[0]];
        if ((h|0) > n)
          return ['act got', h, v[0]];
      }
  }

//console.error('GET', signs);

