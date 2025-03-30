// item count

const itm = _[0];
const cc = _[1]|0;
const cnt = cc > itm.max ? itm.max : cc ? cc : 1;

let table;

for (const t of (yield ['sign', 'craft']).filter(_ => !_.text[3]))
  {
    const d	= (yield ['block', t, 6]).filter(_ => _.id === 'crafting_table');
    if (d.length !== 1)
      {
        yield ['act #crafting? ', s];
        continue;
      }
    table	= d[0];
    break;
  }

if (!table)
  throw 'missing sign: craft';

const r = yield ['recipe', table, itm, cnt];
if (!r.length)
  return yield ['act no recipe for', cnt, itm];

let tot = 0;

outer:
for (const x of r)
  {
    if (itm.id === 'torch' && x.input.filter(_ => _.name === 'coal').length)	continue;	// do not craft torches from coal
    for (const z of x.input)
      {
        if (z.id<=0) continue;
        for (const i of yield ['item', z.id])
          {
//            console.error('CraftItem:', i.map(_ => _.name), z.id, z.count);
// This is wrong, we must accumulate
            const err = yield [`get ${i.name}=${cnt * z.count}`];
            if (!err) continue;

            yield yield err;
            yield yield ['act to craft', itm];
            continue outer;
          }
      }

    yield ['act', table, itm, cnt];

    yield yield ['Move', table];
    yield yield ['craft', table, x, cnt];
    yield ['wait', 20];

    tot += cnt;
    if ((yield ['have', itm]) >= cnt)
      break;
  }

return tot;

