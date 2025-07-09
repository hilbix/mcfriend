// DIG iterator blocks..
//
// within the AREA the given blocks are broken
// Use the full area.  Note:  This unconditionally breaks the given blocks

// things not to touch
const keep = {lava:true, water:true};

const iter = _.shift();
//console.error('ITER', iter);

// items to break
const items = yield ['item', _];
if (!items || !items.length) throw `WTF? no items ${_}`;
  
const want = Object.fromEntries(items.map(_ => [_.id,true]));

const nix = { air:1, cave_air:1, torch:1, wall_torch:1 };

let lx, ly, lz;

//console.error({want,keep});

// find all the positions to place things to
const ok = OB();	// good to break
const ko = [];		// dangerous positions

let minx = Number.POSITIVE_INFINITY;
let maxx = Number.NEGATIVE_INFINITY;
let maxy = Number.NEGATIVE_INFINITY;
let minz = Number.POSITIVE_INFINITY;
let maxz = Number.NEGATIVE_INFINITY;

let t = 0, s = 0;
for await (const bb of iter())
  {
    let b;
    try {
      b = await bb;
    } catch (e) {
      yield ['act NO BLOCK'];
      break;
    }

    const v = b.vec();

    if (++t > 10000) { yield ['verbose thinking', v.y, s, ko.length]; yield ['wait']; t=0 }

    if (minx > v.x) minx	= v.x|0;
    if (maxx < v.x) maxx	= v.x|0;
    if (maxy < v.y) maxy	= v.y|0;
    if (minz > v.z) minz	= v.z|0;
    if (maxz < v.z) maxz	= v.z|0;

    if (want[b.id])
      {
        ((ok[v.y|0] ??= {})[v.x|0] ??= {})[v.z|0] = true;
        s++;
      }
    else if (keep[b.id])
      ko.push(b.vec());

    // XXX TODO XXX how to detect flowing things?

    else if (!nix[b.id])
      switch (b.id)
        {
        default:
          console.error(b.id);
          nix[b.id]	= true;

        case 'air':
        case 'cave_air':
          break;
        }
    }

// There should be a way to forcibly load a block!
function* getBlock(x,y,z)
{
  for (let i=100; --i>0; )
    {
      const p	= yield ['pos', x,y,z];
      const b	= yield ['block', p];
      if (b) return b;

      yield ['Move', p];
      yield ['wait 10'];
    }
  trap `cannot location block ${x} ${y} ${z}`;
}

// Look into the layer above
// XXX TODO XXX build-maxheight?
if (minx < maxx)
  {
    const k = yield ['BLOCK', minx, maxy-1, minz];
    const l = yield ['BLOCK', maxx, maxy-1, maxz];
    const i = yield ['block', k, l];
    for await (const b of i())
      if (keep[b.id])
        ko.push(b.vec());
  }

console.log('DIG', Object.values(ok).reduce((a,k) => a+Object.values(k).reduce((a,k) => a+Object.keys(k).length, 0), 0));

for (const k of ko)
  {
    const x = k.x;
    const y = k.y;
    const z = k.z;
    for (const [a,b,c] of [[-1,0,0],[0,1,0],[0,-1,0],[0,0,-1],[0,0,1]])	// y first
      if (ok[y+a]?.[x+b]?.[z+c])
        delete ok[y+a][x+b][z+c];
    // We should place blockers there if it is flowing out
  }

//  console.log('==', Object.values(ok));

const sw	= Object.keys(ok)[0]|0;
const [min,max]	= Object.keys(ok).reduce(([a,b],c) => { c=c|0; return [a<c ? a : c, b>c ? b : c] }, [sw,sw]);

yield ['verbose DIG', max, min];

// process the top layer

let n = 1000;
for (const [x,_] of Object.entries(ok[max]||{}))
  for (const z of Object.keys(_))
    if (keep[(yield ['BLOCK', x|0, max+1, z|0]).id])
      delete ok[max][x][z];
    else if (yield* breaker(x|0,max,z|0))
      n--;

yield ['verbose DIG top', max];

const cnt = Object.values(ok).reduce((a,k) => a+Object.values(k).reduce((a,k) => a+Object.keys(k).length, 0), 0);
if (!cnt)
  return ko.length ? ['act only keeps', ko.length] : ['note nothing to do'];

yield ['verbose', cnt, 'to break', ko.length, 'to keep'];

for (let y=max; --y>=min; )
  for (const [x,_] of Object.entries(ok[y]||{}))
    for (const z of Object.keys(_))
      if (yield* breaker(x|0,y|0,z|0))
        if (--n < 0)
          {
            yield ['PUT'];	// interrupt the breaking to clean inventory
            n = 1000;
          }

yield ['verbose DIG end', max, min];

function* breaker(x,y,z)
{
  const p = yield ['BLOCK', x,y,z];
  if ((yield ['dist', p])>5)
    {
      const b	= yield ['SPOT', 5, p];
      if (b === void 0)
        {
	  return;
	}
      if (b)
        {
          if ( (lx != x) + (ly != y) + (lz != z) > 1 )
            yield ['verbose break', x,y,z];
          lx = x; ly = y; lz = z;
          yield ['Move', b];
        }
    }
  yield ['say /execute run fill',x,y,z,x,y,z,'air destroy'];
  yield yield ['wait'];
  return 1;
}

