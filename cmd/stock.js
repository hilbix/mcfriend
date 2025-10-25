// List stock (see keep.js)
// Usage: keep [command args..]
// gets: stock command args..

this.stock	??= {};

const area	= (yield ['AREA keep']).shift();

for (let y=0;; y++)
  {
    const x	= yield ['block', area.map(_ => _.pos(0,y,0))];
    let had	= 0;
    let did	= 0;
    for await (const b of x())
      {
        if (b.id !== 'barrel') continue;
        had++;
        const p = `${b.pos()}`;
        if (p in stock) continue;

        did++;
        const a = stock[p] = {};
        const c = yield ['OPEN', b];
        for (const i of c.items())
          if (i.id)
            a[i.id] = (a[i.id]??0)+i.count;
        yield ['OPEN'];
        if (did > 4)
          break;
      }
    console.error(y, did, had);
    if (!had)
      break;
  }

const items	= {};
for (const [k,v] of Object.entries(stock))
  for (const [i,j] of Object.entries(v))
    {
      const h	= items[i] ??= {cnt:0, box:[]};
      h.cnt	+= j;
      h.box.push(k);
    }

for (const [k,v] of Object.entries(items))
  console.error(`${v.box.length}`.padStart(3), `${v.cnt}`.padStart(7), k);

