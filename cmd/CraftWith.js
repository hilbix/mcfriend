// item count

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

const m = _[0];
const n = _[1]|0;

const t = yield [`set craft:${m}`];
if (!t)
  throw `do not know what to craft with ${m}`;

let had = 0;

for (const x of t)
  try {
    const i = yield ['item', x];
    if (i.length !== 1)
      throw `internal error ${x}`;
    const i0 = i[0];

    const r = (yield ['recipe', table, i0, 1]).filter(_ => _.input.length === 1 && _.input[0].id === m);
    if (!r.length)
      {
        yield ['act no recipe for', i0, 'from', m];
        continue;
      }
    for (const y of r)
      {
        const a = y.input[0].count;
        const l = ((n/a)|0) * y.output[0].count;
        if (!l) continue;

        yield ['act', table, x, l];

        yield ['Move', table];
        yield yield ['craft', table, y, l];
        yield ['wait', 20];
        had++;
      }
  } catch (e) {
    console.error(e, x);
  }

return had;

