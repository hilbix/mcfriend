// store inventory of bot into ordered depot of chests
//
// This has several phases.
// If no phase given, it runs from topmost phase to lowest phase.
//
// phase 0: stopped
// phase 1: init area
//
// phase 2: scan 1x3 sign+doublechest locations.
//	location is alternating left and right.
//	record the locations and the items
//	(All 10 locations two locations are skipped (for now))
//	this phase ends when the first improper/free location is found
// phase 3: put item from inventory into depot
//	until there are no items left which can be put into depot
// phase 4:
//	if inventory is clean, goto phase 7
//	if item is known in depot but has no free room, goto phase 6
// phase 5: prepare base of free location from phase 2
// phase 6: extend location one step higher
//	then goto phase 2 to scan the location again
// phase 7: wait for new items in the input chests
// phase 8: take items from the input chests
//	stop if either full or an item has no free room in the depot
// phase 9: goto phase 3

const V=2;	// increment to reset things
const FLOOR = 'cobblestone';
//const FLOOR = 'diorite'; 'blackstone';

// create depot content if not already present
if (this.self?.V !== V)
  this.self		= {V, phase:1, gen:0};

// function dump(_, x)
// {
//   if (x<4)
//     {
//       if (Array.isArray(_))
//         return _.map(_ => dump(_, x+1));
//       if ('object' === typeof _)
//         return Object.entries(_).map(([k,v]) => `${k}=${dump(v,x+1).join(',')}`);
//     }
//   return [toJ(_)];
// }
//
// yield ['act DEPOT', dump(self, 0)];

// close everything in case it still is open
yield ['OPEN'];

switch (_[0])
  {
  case void 0:	break;
  default:	return yield ['act not understood:', _];

  case '0':	self.phase = 1; self.gen++; break;
  case 'gen':	if (`${self.gen}` !== _[1]) return; break;
  }

// functions return:
//
// return;		next phase
// return 0;		same phase again
// return self.phase=0;	stop
// return nnn;		phase nnn
// else: ERROR

async function* P0()
{
  // stop phase with return self.phase=0
  // If this phase is reached
  yield ['report STOP'];
}

// init area

function* bug(..._)
{
  yield ['act depot:', `${_}`];
  yield ['report bug', _];
  return self.phase = 0;
}

// Initialization phase, setup self.r
// .x .y .w .h and .l (level=height)
// .p current pos
// .dirt do we need to update the cache
// .d cached data
// .c check for changed area
function* P1()
{
//  for (const _ of 'floor'.split(' ')) self[_]	= yield [`set depot:${_}`];

  const area	= yield ['AREA depot'];
  if (area?.length !== 1)
    return yield* bug('areas?', area.length, area);

  let [a,b]	= area[0];
  a		= a.pos();
  b		= b.pos();
  let [x,w]	= a.x <= b.x ? [a.x, b.x] : [b.x, a.x];
  let [y,h]	= a.z <= b.z ? [a.z, b.z] : [b.z, a.z];
  x		+= 1;
  y		+= 1;
  w		-= 1;
  h		-= 1;
  if (w-x<6 || h-y<6)
    return yield* bug('area too small', w-x, h-y);

  const l	= a.y < b.y ? a.y : b.y;	// level

  const r	= {x,y,w,h,l};			// coordinates
  const c	= toJ(r);			// stringified
  let d		= yield ['cache get depot', c];	// cache data

  r.dirt	= d?.[0]?.c !== c;		// check if area was changed
  r.d		= r.dirt ? {c} : d[0];		// kick data if area changed
  r.i		= 0;				// iterator w
  r.j		= 0;				// iterator h
  r.k		= 0;				// iterator l

  self.r	= r;
//  yield ['act depot p', p]; yield ['act depot a', a]; yield ['act depot b', b];
  yield ['report at', x,y,w,h];
  yield* move();
}

// move to position .i,.j:
// returns self.r with r.z set to chest direction -1 or 1
// updates self.r.p, so do not acces

// 012345	delta x
// CCSSCC	CC=doublechest S=Sign
// ffffff	f=floor
// --^		first pos (-1)
//    ^--	second pos (+1)
function* move(_ = 0)
{
  const r		= self.r;
  const {x,y,w,l,i,j}	= r;

  const t	= j&1;
  const u	= (j/2)|0;
  const m	= x+6*u+2+t;
  const n	= y+i;

  const p	= yield ['pos', m,l,n];
  r.p	= p;
  r.z	= t ? 1 : -1;
  r.b	= p.pos(_ * r.z, 0, _ * r.z);

  yield ['TP1', r.b];
  yield ['wait', 1];
  return r;
}

// increment position
// return void 0 if end, else 0
function inc()
{
  const r		= self.r;
  const {x,y,w,h,l,i,j}	= r;

  if (++r.i < r.w-r.x)
    return 0;
  r.i	= 0;

  if (++r.j < 3*(r.h-r.y))
    return 0;
  r.j	= 0;
}

// phase 2: scan 1x3 sign+doublechest locations.
//	location is alternating left and right.
//	record the locations and the items
//	~~(All 10 locations two locations are skipped (for now))~~
//	this phase ends when the first improper/free location is found
function* P2()
{
  const {x,y,w,h,l,p,d,i,j,z}	= yield* move();

  for (const _ of [0,1,2])
    {
      const b = yield ['block', p.pos(z*_, -1, 0)];
      if (b.id !== FLOOR)
        return;
    }

  const s	= yield ['sign',  p.pos(0,0,0)];
  if (!isSign(s)) return;

//  yield ['act AAAA', s, i,j,p];
  let n;
  for (n=0; n+l<200; n++)
    {
      const b0	= yield ['sign',   p.pos(  0, n, 0)];
      const b1	= yield ['chesty', p.pos(  z, n, 0)];
      const b2	= yield ['chesty', p.pos(z+z, n, 0)];

      if (b1[0] !== 'L' && b1[0] !== 'R')
        {
//          yield ['act noDBL', n, b0, b1, b2];
          break;
        }
      if (!isSign(b0))
        {
//          yield ['act noSig', n, b0, b1, b0.name];
          break;
        }
//      yield ['act K', n, b0];
    }

  if (!n)
    return;

  d.x ??= [];
  d.x.push(s, n);

  return inc();
}

//  self.iter	= yield ['block', self.area];
//  self.iter	= self.iter();
//  const {v1,d1}	= await self.iter.next();
async function* P2x()
{
  yield ['Move', value, 3];
  const pos	= value.pos(0,-1,0);

//  yield ['act', 'P', pos, self.pick];

  const y	= pos.y;
  const d	= [];
  const pile	= yield ['block', pos.pos(0,-1,0), pos.pos(0,250-y,0)];
  for await (const x of pile())
    {
//      yield ['act', 'H', pos, x]; return self.phase = 0;
      if (isAir(x)) continue;
      d.unshift(x);
    }

  yield ['act HERE', value, d];
  return self.phase = 0;
  return 0;
}

// phase 3: put item from inventory into depot
//	until there are no items left which can be put into depot
async function* P3()
{
}

// phase 4:
//	if inventory is clean, goto phase 7
//	if item is known in depot but has no free room, goto phase 6
async function* P4()
{
}

function* put(n,m,t)
{
  const {x,y,w,h,l,p,d,i,j,z}	= yield* move();

  const b	= yield ['block', p.pos(n*z, m, 0)];

  switch (b.id)
    {
    case t:
      return false;
  
    default:
      yield ['note BREAK', b];
      yield ['BREAKER', b];
  
    case 'air':
    case 'cave_air':
      break;
    }
  try {
    yield ['PLACE', t, b];
  } catch {
  }
  return true;
}

// phase 5: prepare base of free location from phase 2
function* P5()
{
  let fail = false;

  const {x,y,w,h,l,p,d,i,j,z}	= yield* move();
  for (const i of [0,1,2])
    fail |= yield* put(i, -1, FLOOR);
  if (fail)
    return 0;
}

// phase 6: extend location one step higher
//	then goto phase 2 to scan the location again
async function* P6()
{
  const {x,y,w,h,l,p,d,i,j,z,b}	= yield* move(1);

//  yield ['act BOT', p];
  return (yield ['doublecheststack', -z-z]) ? 2 : 0;
}

// phase 7: wait for new items in the input chests
async function* P7()
{
}

// phase 8: take items from the input chests
//	stop if either full or an item has no free room in the depot
async function* P8()
{
}

// phase 9: goto phase 3
async function* P9()
{
  return self.phase = 0;
}

try {
  let o = self.phase;
  yield ['report phase', o];
  const r = yield* (eval(`P${o}`))();

  if (r === void 0)
    self.phase++;
  else if (r)
    self.phase	= r;
  if (self.phase)
    yield yield [`in 1 depot`]; // gen ${self.gen}`];
  else
    yield ['report stopped', o];
} catch (e) {
  bug(`P${self.phase} ${e}`);
  self.phase	= 0;
  throw e;
}


/*

async function* layer(y)
{
  const r = {};
  for (const a of area)
    {
      const x	= yield ['block', a.map(_ => _.pos(0,y,0))];
      for await (const b of x())
        {
          const p = yield* b.locate();
          switch (b.id)
            {
            case 'cobblestone':
            case 'stone':
              t	= 'base';
              break;
            case 'stone':
            case
            }
          r[p.id]	= p;
        }
    }
}

const keep	= area.shift();

// First check if the floor still is stable.

// Then detect the barrels and fill them
try {
  for (let y=0; yield* barrels(keep,y); y++);
} catch(e) {
  yield [`act ERROR ${e}`];
  console.error(e);
}

yield ['OPEN'];
yield ['AGAIN keep'];

console.warn('end');
//console.warn('all', Object.values(stock).length);
//console.warn('full', Object.values(stock).filter(_ => _.full).length);
//console.warn('empty', Object.values(stock).filter(_ => _.empty).length);
//console.warn('part', Object.values(stock).filter(_ => _.stack).length);

return ['note keep done'];

function* keepin(max)
{
  let n = 0;

  for (const c of input)
    {
      const w	= yield ['OPEN', c];
      for (const i of w.items())
        if (i.id)
          {
            yield ['take', w,i,i.n];
            if (++n > max)
              return;
          }
    }
}

async function* filler(stacks, empties)
{
  yield* keepin(empties.length);

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
      ret	= void 0;	// loop again below

      while (stacks[id]?.length)
        {
          const [m,b]	= stacks[id].shift();

          delete stock[b.pos()];	// rescan it

          const r	= yield ['OPEN', b];
          try {
            yield yield ['put', r, x, (m>n ? n : m)];
            yield ['act keep fill', n, x, m, b];
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

      const s	= empties.shift();
      if (!s)
        {
          console.error('no more empties');
          return;	// loop again below
        }
      delete stock[s.pos()];		// rescan it
      const r	= yield['OPEN',s];
      try {
        yield yield ['put', r, x, n];
        yield ['verbose put', n, x, s];
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

      // Place barrel if there is none yet
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
}

*/
