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

function* scan_todo(s)
{
  const what	= s.text[3];
  const items	= {};
  for (const i of yield ['item', what])
    {
      i.free	= 0;
      i.have	= 0;
      i.slots	= 0;
      items[i.id] = i;
    }

  const r	= [0, items];

  const b	= (yield ['block', s, 6]).filter(_ => _.container);
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
      if (!s.text[3])
        continue;
      const [free,items] = yield* scan_todo(s);

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
      dests.push([s,items]);
    }

//dests.forEach((s,i]) => console.error('AUTOCRAFT', `${s.vec()}`, Object.entries(i).map(([k,v]) => `${k}:${v.id} want:${v.want} have:${v.have} free:${v.free} slots:${v.slots}`)));

  for (const [sign,items] of dests)
    for (const [k,v] of Object.entries(items))
      if (v.want)
        {
	  console.error('AUTOCRAFT', k, v);
          yield yield ['CraftItem', v, v.want];
	  const c = yield ['OPEN',sign];
          yield yield ['put', c, v, v.want];
	  yield ['OPEN'];
        }
}

function* craftin()
{
  let ok = false;
  for (const c of yield ['CHEST', 'craftin'])
    {
      const to	= {};
      const w	= yield ['OPEN',c];
      for (const i of w.items())
        {
	  if (!i.id) continue;
          console.error('TAKE', yield ['take', w, i, i.n]);
	  to[i.name] = (to[i.name]|0) + i.n;
	}
      yield yield ['OPEN'];
      yield yield ['wait'];
      for (const [k,v] of Object.entries(to))
        ok	|= yield ['CraftWith', k, v];
      yield yield ['PUT'];
    }
  return ok && 'CRAFT done';
}

yield ['CACHE clear'];
yield yield ['PUT'];
yield yield ['drop'];

if (_.length)
  for (const x of _)
    {
      const n = x.split('=');
      for (const y of yield ['item', n[0]])
        yield yield* craft(y, (n[1]|0)||1);
      yield yield ['drop'];
    }
else
  {
    try {
      if (!((yield* craftin()) || (yield* autocraft())))
        return;
    } catch (e) {}
    //yield ['craft'];
  }

