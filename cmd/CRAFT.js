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

this.NOTE ??= {};

function note(how, what, ..._)
{
  const a = NOTE[how] ??= [];
  a.unshift(what);
  if (a.length>60)
    a.pop();
}

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
      yield ['note #container? ', s];
      return r;
    }
  if (yield ['CACHE get full', b])
    return r;

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

      yield ['note something strange in', s, slot];
      // or auto take it out?
    }
  if (!r)
    yield ['CACHE set full', b, 2];
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
      const pos = `${s.text[3]}@${s.pos().id}`;

      if (NOTE.full?.includes(pos))			// chest full
        continue;
      if (NOTE.fail?.includes(s.text[3]))		// item fails
        continue;

//      console.error(`CRAFT ${s}`);

      const [free,items,chest] = (yield* scan_todo(s)) || [];
      yield* verbose(`free=${free}`, pos);
      if (!free)
        {
//          yield ['CACHE del full', chest];
          note('full', pos);
          continue;
        }
      note('todo', pos);

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
          yield* verbose('crafting', v.want, v.id);
          if (NOTE.fail?.[k]) continue;

          const n = yield ['CraftItem', v, v.want];
          note('craft', `${v.id}=${n}`);
          if (!n)
            {
              note('fail', k);
              continue;
            }
          yield ['CACHE del missing', k];
          const c = yield ['OPEN',chest];
          try {
            yield yield ['put', c, v, n];
            yield ['OPEN'];
          } catch (e) {
            console.error('CRAFTput', e);
            yield* verbose('WTF', `${e}`);
          }
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
      yield* verbose('open', c);
      for (const i of w.items())
        {
          if (!i.id) continue;
          console.error('TAKE', yield ['take', w, i, i.n]);
          to[i.name] = 1;
        }
      yield ['OPEN'];
      yield yield ['wait'];
      for (const i of yield ['invs'])
        if (to[i.name])
          {
            yield* verbose('craft-from', i.name);
            const did = yield ['CraftWith', i, i.n];
            ok	|= did;
            if (did)
              note('did', i.name);
            else
              note('left', i.name);
          }
    }
  yield yield ['PUT'];
  return ok && 'CRAFT done';
}

let verbose = function*(..._) { yield [`act CRAFT`, _] };

if (!_.length)
  {
    verbose = function*(){};

    yield ['CACHE clear'];
    yield yield ['PUT'];
    yield yield ['drop'];

    try { yield yield* craftin()   } catch (e) { console.error(e) }
    try { yield yield* autocraft() } catch (e) { console.error(e) }
  }
else
  switch (_[0])
    {
    default:
      for (const x of _)
        {
          const k = x.split('=');
          for (const i of yield ['item', k[0]])
            {
              const n = yield ['CraftItem', i, (k[1]|0)||1];
              note('craft', `${i.id}=${n}`);
              yield yield ['PUT'];
              yield ['verbose crafted', n|0, i];
            }
        }
      break;
    case 'in':
      try { yield* craftin()   } catch (e) { console.error(e); yield [`act CRAFT ${e}`] };
      break;
    case 'auto':
      try { yield* autocraft() } catch (e) { console.error(e); yield [`act CRAFT ${e}`] }
      break;
    case 'clear':
      NOTE = {};
      note('craft', 'clear');
    case '?':
      for (const a in NOTE)
        {
          const l = Object.entries(NOTE[a].reduce((a,_) => { _=_.split('@')[0]; a[_] = 1+(a[_]??0); return a }, {})).map(([k,v]) => `${k}:${v}`);
          console.log(a, l);
          yield ['act',a,l];
        }
    }

