// test 'KEEP.js'

const V=0;	// increment to reset things
if (this.stock?.V !== V)
  this.stock		= {V};

//console.error({stock});

//yield yield ['home'];

yield ['OPEN'];
//yield ['PUT'];
//yield ['drop'];
//yield ['home'];

const area = yield ['AREA keep'];
if (area?.length !== 1)
  return yield ['act WTF keep-area', area];

const input	= yield ['CHEST keepin'];
if (!input?.length)
  return yield ['act WTF no keepin chests?'];

const keep	= area.shift();

const keepcache	= OB();
let cache	= [], empties = [], stacks;

// First check if the floor still is stable.
while ((yield* check_floor(keep.map(_ => _.pos(0,-1,0)))));

// Then detect the barrels and fill them
try {
  for (let y=0; yield* barrels(keep,y); y++);
} catch(e) {
  yield [`act ERROR ${e}`];
}

yield ['OPEN'];
yield ['AGAIN keep'];

console.warn('end');
console.warn('all', Object.values(stock).length);
console.warn('full', Object.values(stock).filter(_ => _.full).length);
console.warn('empty', Object.values(stock).filter(_ => _.empty).length);
console.warn('part', Object.values(stock).filter(_ => _.stack).length);

return ['act keep done'];

async function* filler(stacks, empties, empty)
{
  let n = 0;

  for (const c of input)
    {
      const w	= yield ['OPEN', c];
      for (const i of w.items())
        if (i.id)
          {
            yield ['take', w,i,i.n];
            if (++n >= empties.length)
              break;
          }
      if (n > empties.length)
        break;
    }

  const keep	= OB();
  keep['barrel'] = 200;

  let ret = 'done';

  for (const x of yield ['invs'])
    {
      const id	= x.id;
      if (!id) continue;

      const k	= keep[id]	??= keepcache[id] ??= ((yield [`set item:${x.id}:keep`]) ?? 0);

      let n	= x.n - k;
      if (n<0)
        {
          console.error('keep', id, n);
          keep[id]	-= x.n;
          continue;
        }
      keep[id]	= 0;
      ret = void 0;

      while (stacks[id]?.length)
        {
          const [m,b] = stacks[id].shift();

          delete stock[b.pos()];	// rescan it

          const r = yield ['OPEN', b];
          try {
            yield yield ['put', r, x, (m>n ? n : m)];
            yield ['act fill', n, x, m, b];
            n -= m;
            if (n<0)
              break;
          } catch (e) {
            console.error('PUT err', e);
            yield ['act keep err', b, e];
            break;
          }
        }
      if (n<0) continue;

      const s = empties.shift();
      if (!s)
        {
          console.error('no more empties');
          return;
        }
      delete stock[s.pos()];		// rescan it
      const r	= yield['OPEN',s];
      try {
        yield yield ['put', r, x, n];
        yield ['act put', n, x, s];
      } catch (e) {
        console.error('PUT err', e);
        yield ['act keep err', s, e];
      }
    }

  //yield ['OPEN'];
  return ret;
}

async function* barrels(keep, y)
{
  let	next;

  const x	= yield ['block', keep.map(_ => _.pos(0,y,0))];
  for await (const b of x())
    {
      if (empties.length>20)
        {
          if (yield* filler(stacks, empties))
            return;		// finished
          yield ['AGAIN keep 0'];
          next	= void 0;
        }

      if (b.id !== 'barrel')
        {
          //yield ['Move', b, 3];

          if (!isAir(b)) yield ['BREAKER', b];		// break unknown blocks
          yield yield ['PLACER', b, 'barrel'];		// place a barrel

          yield ['wait'];				// relax

          delete stock[b.pos()];

          if ((yield ['block', b])?.id !== 'barrel')
            {
              yield ['act placing barrel failed', b];
              continue;
            }
          // Note that b might not be updated
          // however we only need the positon,
          // as we no more check if it is a barrel
          // as we know, it must be some now
        }

//      yield ['act at', b];

      if (!next)
        {
          next		= cache;	// rescan everything
          cache		= [];
          empties	= [];
          stacks	= {};
        }
      next.push(b);

      stacks	= OB();

      while (next.length)
        {
          const b	= next.shift();
          const d	= yield* check_barrel(b);

          if (d.full)	continue;
          cache.push(b);

          if (!d.known)
            continue;

          for (let i=d.empty; --i>=0; empties.push(b));
          d.stack.forEach(([id,n]) => (stacks[id] ??= []).push([n,b]));
        }

//      yield ['OPEN'];
    }
  return true;
}

function* check_barrel(b)
{
  const d	= stock[b.pos()] ??= OB();
  if (d.full || d.known) return d;			// skip if known to be full

  const c	= yield ['OPEN', b];
  if (!c) return d;
  
//  d.b		= b;
  d.full	= true;
  d.empty	= 0;
  d.stack	= [];

  for (const i of c.items())
    {
      const n = i.max - i.n;
      if (n>0)
        d.stack.push([i.id,n]);
      else if (i.empty)
        d.empty++;
      else 
        continue;		// fully occupied slot
      d.full	= false;
    }

// yield ['OPEN'];
  d.known	= true;
  return d;
}

async function* check_floor(area)
{
  const x = yield ['block', area];
  let n=0;
  for await (const b of x())
    {
      switch (b.id)
        {
        case 'stone':		continue;
        case 'cobblestone':	continue;

        default:
          yield ['act breaking', b];
          yield ['BREAKER', b];
        case 'air':
          break;
        }
      n++;
      yield ['Move', b, 3];
      yield ['PLACER', b, 'stone cobblestone'];
    }
  yield ['act floor ok'];
  return n;
}

