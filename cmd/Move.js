// [x,y,z] delta: move to location
// TODO: implement a working pathfinder (mineflayer-pathfinder has issues)

//return yield ['TP', _];

const dest	= _[0];
const delta	= (_[1]|0)+0.5;
if (delta >= (yield ['dist', dest])) return ['note already there!'];

//console.error('Move', dest);
let d	= delta;

function* check(k,l)
{
  const p	= yield ['SPOT', l, k];
  if (!p) return;

  const opos	= yield ['dist', dest];
  const npos	= dest.dist(p);

  if (npos >= opos) return;	// yield ['act WTF wrong way', p];

  // this moves at least distance 1, hence we have progress
  yield yield ['TP', p];
  yield ['wait'];
}

function* miss(n,d)
{
  const p	= yield ['pos'];
  const v	= p.sub(dest).scale(1/n);		// f(x) := dest + x * (post - dest) / n  --   0..[n-1]

  //console.error('miss', p,v);
  // do a binary search

  let l	= 0;
  let h	= n - 1;
  let x;

  while (l <= h)
    {
      const m	= ((n+l) / 2)|0 || 1;
      const k	= dest.pos(v.scaled(m));
      if (yield* check(k, n>15 ? 15 : n))
        return;						// there is progress
      l	= m + 1;
    }
  return true;
}

for (;;)
  {
    const d	= yield ['dist', dest];
    if (d <= delta+1) return ['note arrived', ((d*1000)|0)/1000, 'at', dest];

    yield ['OPEN'];	// close chests before moving

    for (let n=delta || 1; yield* miss(n, d); n *= 2)
      if (n * 3 > d)
        {
          yield ['tp', dest];
          return ['note sorry no way found', d, n];
        }
  }

