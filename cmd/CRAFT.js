// craft things
//
// The crafting tables to use needs a sign 'craft' (with an empty third line)
//
// By default it does following:
// - Fetches material from sign 'craftin'
// - And does the crafting for this material according to the recipes
//
// In future the recipes will be done with a book, too.
// But for now you need a chest with a sign on it:
//
// - craft
// - what-to-craft
//
// The bot only crafts until the chest is full.

this.FAIL ??= {};

function* scan_todo(s)
{
  const what	= s.text[3];
  const items	= {};
  try {
    for (const i of yield [`item`, what])
      {
        i.free	= 0;
        i.have	= 0;
        i.slots	= 0;
        items[i.id] = i;
      }
  } catch (e) {
    console.error(e);
    return yield ['say cannot craft', s];
  }

  const b	= (yield ['block', s, 6]).filter(_ => _.container);
  const r	= [0, items, b];
  if (b.length !== 1)
    {
      yield ['act #container? ', s];
      return r;
    }

  const c = yield ['OPEN', b];

  for (const slot  of c.items())
    {
      if (slot.empty)
        {
          r[0]++;
          continue;
        }

      const i	= items[slot.id];
      if (i)
        {
          i.slots++;
          i.have	+= i.n;
          i.free	+= i.max - i.n;
          continue;
        }

      yield ['act something strange in', s, slot];
      // or auto take it out?
    }
  return r;
}

function* autocraft()
{
  const signs	= yield ['sign', 'craft'];

  const dests	= [];

  for (const s of signs)
    {
      if (!s.text[3]) continue;
      if (!s.valid) continue;

//      console.error(`CRAFT ${s}`);

      const [free,items,chest] = (yield* scan_todo(s)) || [];
      if (!free) continue;

      // try to put some equal number of everything into the box
      //const k	= Object.keys(items);
      //if (k.length<2) return r;
      // recalculate(free, items);
      // for now we just equally distribute the free slots:

      const all = Object.entries(items);
      for (const [k,v] of all)
        {
          v.want	= (v.want ?? 0) + Math.floor(free / all.length) * v.max;
//          console.error('===========', k, v.want, free, all.length, v.max);
        }
      dests.push([chest,items]);
    }

//dests.forEach((s,i]) => console.error('AUTOCRAFT', `${s.vec()}`, Object.entries(i).map(([k,v]) => `${k}:${v.id} want:${v.want} have:${v.have} free:${v.free} slots:${v.slots}`)));

  for (const [chest,items] of dests)
    for (const [k,v] of Object.entries(items))
      if (v.want)
        {
          console.error('AUTOCRAFT', k, v);
          const n = yield ['CraftItem', v, v.want];
          if (!n) continue;
          const c = yield ['OPEN',chest];
          yield yield ['put', c, v, n];
          yield ['OPEN'];
        }
}

function* craftin()
{
  const cc = yield ['CHEST', 'craftin'];
  if (!cc) return;

  let ok = false;
  for (const c of cc)
    {
      const to	= {};
      const w	= yield ['OPEN',c];
      for (const i of w.items())
        {
          if (!i.id) continue;
          console.error('TAKE', yield ['take', w, i, i.n]);
          to[i.name] = 1;
        }
      yield yield ['OPEN'];
      yield yield ['wait'];
      for (const i of yield ['invs'])
        if (to[i.name])
          ok	|= yield ['CraftWith', i, i.n];
    }
  yield yield ['PUT'];
  return ok && 'CRAFT done';
}

yield ['CACHE clear'];
yield yield ['PUT'];
yield yield ['drop'];

if (_.length)
  for (const x of _)
    {
      const k = x.split('=');
      for (const i of yield ['item', k[0]])
        {
          const n = yield ['CraftItem', i, (k[1]|0)||1];
          yield yield ['PUT'];
          yield ['act crafted', n|0, i];
        }
    }
else
  {
    try { yield* craftin()   } catch (e) { console.error(e) }
    try { yield* autocraft() } catch (e) { console.error(e) }
  }

