// item count

const itm = _[0];
const cnt = _[1] > itm.max ? itm.max : (_[1]|0)||1;

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

for (const i of yield ['item', itm])
  {
    const r = yield ['recipe', table, i, cnt];
    if (!r.length)
      {
        yield ['act no recipe for', cnt, i];
        continue;
      }
    yield ['act recipe', cnt, i];
  }

