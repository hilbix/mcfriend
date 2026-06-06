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

const V=4;	// increment to reset things
const FLOOR = 'cobblestone';
//const FLOOR = 'diorite'; 'blackstone';

// create depot content if not already present
if (this.self?.V !== V)
  this.self		= {V, phase:1, gen:0, empty:{}};

const speed = 0;

function dump(_, x)
{
  x |= 0;
  if (x<4)
    {
      if (Array.isArray(_))
        return _.map(_ => dump(_, x+1));
      if (_ && 'object' === typeof _)
        return Object.entries(_).map(([k,v]) => `${k}=${dump(v,x+1).join(',')}`);
    }
  try {
    return [toJ(_)];
  } catch (e) {
    return [`${e}`];
  }
}

//
// yield ['act DEPOT', dump(self, 0)];

// close everything in case it still is open
yield ['OPEN'];

switch (_[0])
  {
  case void 0:	break;
  default:	return yield ['act not understood:', _];

  case '0':	self.phase = 1; self.gen++; break;
  case 'gen':	if (`${self.gen}` !== _[1]) return; if (_[2]) self.phase=_[2]; break;
  case 'list':	yield* list(); return;
  case 'clr':	self.empty = {}; return;
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

  yield ['drop'];

  const area	= yield ['AREA depot'];
  if (!area)
    return yield* bug('no area', toJ(area));
    
  if (area?.length !== 1)
    return yield* bug('areas?', area?.length, toJ(area));

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
  let d		= yield ['cache get depot d', c];	// cache data

  self.dirt	= d?.[0]?.c !== c;		// check if area was changed
  r.d		= self.dirt ? {c,x:{}} : d[0];	// kick data if area changed
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
//  const {x,y,w,h,l,i,j}	= r;

  if (++r.i <= r.h-r.y)
    return 0;
  r.i	= 0;

  if (3 * ++r.j <= r.w-r.x)
    return 0;
  r.j	= 0;

  // XXX TODO XXX probably depot too small error
  return self.phase = 0;
}

// phase 2: scan 1x3 sign+doublechest locations.
//	location is alternating left and right.
//	record the locations and the items
//	~~(All 10 locations two locations are skipped (for now))~~
//	this phase ends when the first improper/free location is found
async function* P2()
{
  const {w,h,l,p,d,i,j,z}	= yield* move();

  BUG('P2', 0);
  for (const _ of [0,1,2])
    {
      const b = yield ['block', p.pos(z*_, -1, 0)];
      if (b.id !== FLOOR)
        return;		// unprepared position found, next state
    }
  BUG('P2', 1);

  const s	= yield ['sign',  p.pos(0,0,0)];
  if (!isSign(s)) return;

  let k		= s._.block.getSignText()[0].split('\n')[2];

//  yield ['act AAAA', k, s, i,j,p];

  let n;
  for (n=0; n+l<200; )
    {
      BUG('P2', 2);
      const b0	= yield ['sign',   p.pos(  0, n, 0)];
      const b1	= yield ['chesty', p.pos(  z, n, 0), p.pos(z+z, n, 0)];

      if (b1[0] !== 'R' && b1[1] !== 'L')	// missing chest
        break;

      if (!isSign(b0))				// missing sign
        break;

      // get from sign what shall be in the chest
      const tx	= b0._.block.getSignText()[0].split('\n');
      if (!k)
        k	= tx[2];

      BUG('P2', 3);
      // look into the chest
      const rb	= yield ['block', p.pos(z,n,0)];
      const r	= yield ['OPEN', rb];
      if (!r)
        {
	  // open failed for unknown reason
          yield ['act BUG: Cannot open', rb, s];
	  break;
	}

      if (!k)	// preset with something from the chest's content
        k	= Object.keys(Object.fromEntries(r.items().filter(_ => _.id && !d.x?.[_.id]).map(_ => [_.id, true])))[0] ?? '';

      n++;	// we have a chest

      // XXX TODO XXX CHANGE THIS to proper handling of manual changes
      //
      // Leave this to the future, for now we just overwrite the index below.
      //
      // Everything is ok if either d.x[k] is unknown or is us (.i,.j == i,j).  Else:
      //
      // T.B.D.

      // not yet defined (or wrongly defined)?
      if (tx[2] !== k || (n<2 && !tx[1]))
        {
          const ts = [ tx[0] || "BOTS" , tx[1] || "store", k ];

          yield ['OPEN'];	// close chest

          // set it
          const p = s._.pos;
          BUG('P2', 4, k, tx);
	  for (let i = n<2 ? 0 : 2; i < ts.length; i++)
            yield ['say /data modify block', b0.x,b0.y,b0.z, `front_text.messages[${i}] set value ${toJ(toJ(ts[i]))}`];

          try {
            await clickhack(s);
          } catch (e) {
            console.error(e);
          }
          break;
        }
      if (!k)
        break;	// empty unnamed chest, hence free

      // is there something wrong in the chest?
      const w = r.items().filter(_ => _.id && _.id !== k);
      if (w.length)
        {
          BUG('P2', 5);
          yield ['take', r, w[0], w[0].count];
          // what if no free inv?
          break;
        }
      if (r.items().filter(_ => _).length < 54)	// stop at chests with empty slots
        break;
    }

  yield ['OPEN'];	// close chest

  // we found a usable position
  // remember location and stack height
  // Note that we can only remember 1 stack per item type
  // (perhaps this is wrong for special items like broken bow?)

  const o = d.x[k];
  const x = d.x[k] = {i, j, n};
  if (o !== x)
    self.dirt	= true;

  return n && k ? inc() : void 0;
}

function clickhack(sign)
{
  BUG('clickhack', 0, sign._pos);
  if (!sign._.block)
    return Promise.reject('no sign');
  const p = new Promise((o,k) =>
    {
      BUG('clickhack', 1);
      __ABI__.B.once('windowOpen', o);
      sleep(2000).then(() => k('windowOpen did not fire within 10s'));
    });
  BUG('clickhack', 2);
  p.then(() => { BUG('clickhack', 6); return this.__ABI__.B.closeWindow() }).catch(console.error);
  BUG('clickhack', 3);
  return __ABI__.B.activateBlock(sign._.block).then(_ => { BUG('clickhack', 4, _); return p });
}

function* list()
{
  for (const [k,v] of Object.entries(self.r))
    yield ['act Dlst', k, `${dump(v)}`.substr(0,40)];
  for (const [k,v] of Object.entries(self.r.d ?? {}))
    yield ['act DlsD', k, `${dump(v)}`.substr(0,40)];
  const x = (self.r.d?.x ?? []).reduce((_,[s,n]) => { (_[toJ(s.full)] ??= []).push(n); return _ }, {});
  for (const [k,v] of Object.entries(x))
    yield ['act DlsX', k, `${dump(v)}`.substr(0,40)];
}

function jump(x)
{
  const r = self.r;

  r.i	= x.i;
  r.j	= x.j;
}

// phase 3: put item from inventory into depot
//	until there are no items left which can be put into depot
async function* P3()
{
  const r = self.r;
  const x = r.d.x;
  let	flag;

  yield ['act P3', self.r.i, self.r.j];

  // preset the current pos to append
  x[''] ??= {i:r.i, j:r.j, n:0};

  const i0 = __ABI__.B.inventory.inventoryStart;
  const i1 = __ABI__.B.inventory.inventoryEnd;
   
  let had;
  for (const i of yield ['invs'])
    {
      if (!i.id) continue;
      if (had && i.id !== had) continue;
      if (i._.slot < i0 || i._.slot >= i1) continue;

      const r	= x[i.id] ?? (flag=x['']);
      if (!r.n) continue;

//      console.log('ITEM', i0, i1, i);
      yield ['act Dput', i.id, i.n, toJ(r)];

      const {p,z}	= yield* move(jump(r));
      const b	= yield ['block', p.pos(z, r.n-1, 0)];
      const c	= yield ['OPEN', b];

      try {
        yield yield ['put', c, i, i.n];
      } catch (e) {
        if (e.message === 'destination full')
          {
            yield ['OPEN'];     // take item out of your hand!
            yield ['wait'];
            return 6;
          }
	// we are in some unknown state, start all over
	return 1;
      }
      had	= i.id;
    }
  if (had)
    {
      yield ['OPEN'];
      return flag ? 2 : 0;	// re-evaluate(2) or again with next item
    }
}

// phase 4:
//	if inventory is clean, goto phase 7
//	if item is known in depot but has no free room,
//		goto phase 6 with correct location
//
async function* P4()
{
  const x = self.r.d.x;
  yield ['act P4', self.r.i, self.r.j];

  // preset the last empty pos to append
  x[''] = {i:self.r.i, j:self.r.j, n:0};

  const i0 = __ABI__.B.inventory.inventoryStart;
  const i1 = __ABI__.B.inventory.inventoryEnd;

  for (const i of yield ['invs'])
    {
      if (!i.id) continue;
      if (i._.slot < i0 || i._.slot >= i1) continue;

      const c = x[i.id];
      const r = c ?? x[''];
      // stack is full, so raise the stack
      yield ['act P4:', self.r.i, self.r.j, c === r, toJ(c)];
      jump(r);
      yield ['act P4=', self.r.i, self.r.j, c === r, toJ(c)];
      // height === 0 then prepare the position
      return r.n ? 6 : void 0;
    }
  return 7;
}

function* put(n,m,t)
{
  const {x,y,w,h,l,p,d,i,j,z}	= yield* move();
  yield ['act PUT', i, j];

  const b	= yield ['block', p.pos(n*z, m, 0)];

  switch (b.id)
    {
    case t:
      return false;

    default:
      yield ['note BREAK', b];
      yield ['BREAKER', b];
      return true;

    case 'air':
    case 'cave_air':
      break;
    }
  try {
    yield ['PLACE', t, b];
  } catch(e) {
    console.error(e);
  }
  return true;
}

// phase 5: prepare base of free location from phase 2
function* P5()
{
  let fail = false;

  const {x,y,w,h,l,p,d,i,j,z}	= yield* move();
  yield ['act P5', i, j];
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
  yield ['act P6', i, j];

  return (yield ['doublecheststack', -z-z]) ? 2 : 0;
}

function Q(afn)
{
  const x = [];
  const iter = afn(_ => x.push(_));
  return next;

  async function* next()
    { 
      let v;

      while (!x.length)
        {
          const r = await iter.next(v);
          yield ['act D NX', r.done, r.value];
          if (r.done)
            return;
          v = yield r.value;
        }
//      yield ['act D q', x];
      return x.shift();
    }
}

async function* inputs(q)
{
  for (const c of (yield ['CHEST', 'keepin']) || [])
    {
      yield ['act D in', c];
      await q(c);
    }
}

// phase 7: wait for new items in the input chests
async function* P7()
{
  let m = __ABI__.B.inventory.inventoryEnd - __ABI__.B.inventory.inventoryStart;
  let n = 0;

  const q = Q(inputs);
  while (_ = (yield* q()))
    {
      const [c,s_] = _;
//      yield ['act GOT c', c];
      if (self.empty[c])
        {
          yield ['act D ign', s_];
          continue;
        }
      const w   = yield ['OPEN', c];

      let is = void 0;

      for (const i of w?.items())
        if (i.id)
          {
            is=true;
            yield ['act D take', s_, i];
            yield ['take', w,i,i.n];
            if (++n >= m)
              return 3;
          }
      if (!is)
        {
          yield ['act D empty', s_];
          self.empty[c] = 1;
        }
    }

  yield ['act D got', n];
  if (n < m)
    self.empty	= {};	// reset cache

  if (n)
    return 3;

  // retry in a few seconds
  // we should use AGAIN for better backoff.
  // But this not yet supports parameters I think.
  yield yield [`in 20 depot gen ${self.gen} 7`];
  return self.phase = 0;
}

// phase 8: take items from the input chests
//	stop if either full or an item has no free room in the depot
async function* P8()
{
}

// phase 9: goto phase 3
async function* P9()
{
  return 3;
//  return self.phase = 0;
}

try {
  let o = self.phase;
  yield ['report phase', o];
  BUG('run', o);
  const r = yield* (eval(`P${o}`))();
  BUG('ret', o, r);
  if (r === void 0)
    self.phase++;
  else if (r)
    self.phase	= r;
  if (self.phase)
    yield yield [`in ${speed} depot gen ${self.gen}`];
  else
    yield ['report stopped', o];
  if (self.dirt)
    {
      self.dirt	= void 0;
      yield ['cache set depot d', self.r.d];	// cache the updated data
    }
} catch (e) {
  console.error(e);
  bug(`P${self.phase} ${e}`);
//  self.phase	= 0;
  throw e;
}

