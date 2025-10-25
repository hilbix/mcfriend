//		fill the inventory with standard items (set list:get:item:count X)
// item..	get something out of a storage box
//		item=5 takes 5 such items, default: 1

//const i = Array.from(yield ['invs']);

const nofill = _[0] === 'nofill' && _.shift();

const l = _.length
  ? _.map(_ => _.split('=',2))		// arg: item=n
  : Object
    .entries({} || (yield ['set list get']) || {})
    .filter(([k,v]) =>
      {
        const n = (v|0)||1;
        // check inventory for count of items
        return true;
      })
    .map(([k,v]) => [k,v.count]);

if (!Object.keys(l).length) return [`act please state what to get`];

let ok = 0;

for (const [k,v] of l)
  {
    const signs = [].concat(yield ['sign', 'take', k], yield ['sign', 'get', k], yield ['sign', 'store', k], yield ['sign', 'craft', k], yield ['sign', 'made', k], nofill ? [] : yield ['sign', 'fill', k]).filter(_ => _ && _.valid);
    if (!signs?.length)
      {
        //yield ['act no sign found for', _];
        continue;
      }
    const n = (v|0)||1;
    for (const s of signs)
      {
//        yield ['act', s];
//        const p = yield ['locate', s];
//        yield ['act', p];
        const d = (yield ['block', s, 6]).filter(_ => _.container);
        if (d.length !== 1) return ['act invalid', d.length, s, s.valid];

        // move to the chest
        //yield yield ['Move', s];
        yield ['Move', s];

        // open the chest
        const c = d[0];
        const r = yield ['OPEN', c];

        // locate the needed item
        const v = r.items().filter(yield* itemFilter(k));
        if (!v.length) 
          {
            //yield ['act', k, 'not in', c]
            //yield ['OPEN'];
            continue;
          }

        // take the item and close
        try {
          const t	= c.container;
          if (t === true)
            yield ['take', r, v[0], n];
          else
            yield ['take', t];
        } catch (e) {
        }

        yield ['OPEN'];		// have does not work with some open chest?!?

        // check that I have enough from this item
        const h = yield ['have', v[0]];
        if ((h|0) >= n)
          {
            yield ['verbose got', h, v[0]];
            ok++;
            break;
          }
        yield ['verbose only', h, v[0]];
      }
  }

//yield ['OPEN'];

if (l.length !== ok)
  return ['note unable to get', l];

//console.error('GET', signs);

