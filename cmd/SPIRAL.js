// height: 0 cube around the sign (default)
// height: 1  level of the sign
// height: 2  level of the sign .. sign+1
// height: -1 level of the block below the sign
// height: -2 two levels below the sign
//
// Returns [iter, ok]
//
// for await (const block of iter()) { (yield* process(block)) && (yield* ok(block)) }	// process is your implementation
// ok() can be called asynchronously out of sequence

if (!validSign(_[0]))
  {
    const s = _[0];
    yield ['act checking', s];
    const t = yield ['SPOT', 5, s];
    if (t !== false)
      yield ['tp', t ?? s];
    yield ['wait', 30];

    const b = yield ['sign', s];
    if (!b.valid)
      {
        yield ['act', s, 'not valid'];
        return; // 'sign is not valid';
      }

    if (toJ(s.full) !== toJ(b.full))
      throw 'sign has changed!?!';
    _[0] = b;
  }

const s = _[0];
const h = _[1] | 0;
const p = yield ['locate', s];

//console.error(Object.keys(s._), s.name, s._.id, p);

//if (!isSign(s))	throw 'not a sign';
//if (!s.valid)	throw 'sign is not valid';

/*
class YieldQ
  {
  #q; #p; #o;
  #stop;
  get stopped() { return this.#stop }
  get length()	{ return this.#q.length }

  signal()
    {
      if (this.#q.length || force)
        this?.#o[0]?.(this.#p=void 0);
      if (!this.#p)
        this.#p	= new Promise((..._) => this.#o = _);
      if (this.#stop)
        this.p.o[1](this.#stop);
      return this;
    }

  constructor()
    {
      this.#q	= [];
      this.signal();
    }

  stop(..._)	{ return this.signal(this.#stop = _) }
  push(..._)	{ this.#q.push(..._); return this.signal() }

  async *[Symbol.asynciterator]()
    {
      while (!this.halt)
        {
          await this.#p;
          while (this.#q.length)
            yield this.#q.shift();
        }
    }
  };

const q	= new QS();

q.ok	= function* ok(block)
{
}
*/

// n ist der radius
// eine Seite ist n*2 +1
// 4 Seiten sind 4 * (n*2 + 1) -4
// Seiten = n*8
// x,y,z ist die posistion vom sign
// x-n bis x+n und y-n bis y+n ist die flaeche
// z-n bis z+n ist die hoehe, wenn h=0
// direkt neben dem sign NICHTs machen

//console.error('SIGN', s.full[0]);

const f = s.full[0].split('\n');
const w	= f[2];
const l = f[3].split(' ');

let lev	= (l[0]|0) || 1;// level
let o	= l[1] | 0;	// start state
let k;			// current state

const items = yield ['item', w];
if (!items || !items.length) throw `WTF? no items ${_}`;
const want = Object.fromEntries(items.map(_ => [_.id,true]));

//console.error('WANT', want);	// Items die er abbauen soll

// There should be a way to forcibly load a block!
function* getBlock(..._)
{
  for (let i=100; --i>0; )
    {
      const p   = yield ['pos', _];
      const b   = yield ['block', p];
      if (b) return b;

      yield ['Move', p];
      yield ['wait 10'];
    }
  trap `cannot location block ${x} ${y} ${z}`;
}

const q = [], busy = {};

function* out(x,y,z)
{
  const p	= s.pos(x,y,z);
  const b	= yield* getBlock(p);
  //console.error('out', lev,o, `${b}`, x,y,z);
  //yield ['act', lev,o,x,y,z];
  if (p.dist(s) > 1.1)
    {
      //console.error('POSOK', `${p}`);
      busy[`${p}`] = [lev,o];
      q.push(b);
    }
  o++;
  do
    yield;
  while (q.length>15);	// should not exceed 1
}

function* ok(block)
{
  const p = `${block.pos()}`;
  //console.error('OKPOS', p); console.error('OKPOS', p); console.error('OKPOS', p);
  const [n,k] = busy[p];
  delete busy[p];
  for (const [m,j] of Object.values(busy))
    if (m < n || (m===n && j < k))
      return;

  yield yield ['setSign', s, 0, n,k];      // l.length not used above
  console.log('DONE', n,k, `${block}`);
}

// n up vom Sign
// width 2n+1
function* deckel(y)
{
  const x = lev;
  const z = x+x+1;
  const c = z*z;
  const m = k;
  k	+= c;

  //console.log('deckel', y, k, o); // console.log('deckel', y); console.log('deckel', y);

  if (k <= o) return;	// nothing to do

  const t = z+z;
  for (let i = k-o; --i>=0; )
    {
      let a = ((i / t)|0)*2;	// x 1/2 doppelbahnen der Laenge 2z
      let b = i % t;
      if (b>=z)
        {
          b = t - b - 1;
          a++;
        }
      yield* out(a-x, y, b-x);
    }
}

function* ring(y)
{
  const x = lev;
  const c = (x+x)*4;
  const m = k;
  k	+= c;

  if (k <= o) return;	// nothing to do

  //console.log('ring', y); //console.log('ring', y); console.log('ring', y); console.log('ring', y);

  for (let a=-x; a<x; a++)	yield* out(a, y, x);
  for (let a=-x; a<x; a++)	yield* out(x, y, a);
  for (let a=-x; a<x; a++)	yield* out(a, y, -x);
  for (let a=-x; a<x; a++)	yield* out(-x, y, a);

}

function* iter()
{
  if (!h)
    for (;; lev++, o=0)
      {
        k	= 0;
        yield* deckel(lev);
        const a = -lev;
        for (let y=lev; --y>a; )
          yield* ring(y);
        yield* deckel(a);
      }
  else if (h>0)
    for (;; lev++, o=0)
      {
        k	= 0;
        for (let y=h; --y>=0; )
          yield* ring(y);
      }
  else
    for (;; lev++, o=0)
      {
        k	= 0;
        for (let y=0; --y>=h; )
          yield* ring(y);
      }
}

let	stopped;

const	gen = iter();

function* next()
{
  let v;

  for (;;)
    {
      //console.error('NEXT', q.length, `${v}`);
      while (q.length)
        {
          const block = q.shift();
          if (!block) continue;
          // register block
          //console.error('NX', `${block}`);
          return block;
        }
      if (stopped)
        return;

      // yield* fuer arme ..
      const r = gen.next(v);
      if (r.done)
        stopped	= true;
      else
        v = yield r.value;
    }
}

next.ok		= ok;
next.stop	= () => stopped = true;
next.end	= async () => { console.error('END', l, s.full); await gen.return() };
return next;

