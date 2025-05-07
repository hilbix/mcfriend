// x,y,z delta: move to location
// TODO: implement a working pathfinder (mineflayer-pathfinder has issues)

//return yield ['TP', _];

const dest	= _[0];
const delta	= (_[1]|0)+0.5;
if (delta >= (yield ['dist', dest])) return ['act already there!'];

//console.error('Move', dest);
let d	= delta;

function* check(k,l)
{
  const p	= yield ['SPOT', l, k];
  if (!p) return;

  // this moves at least distance 1, hence we have progress
  yield yield ['TP', p];
  return d	= delta;
}

function* miss(n,d)
{
  const p	= yield ['pos'];
  const v	= p.sub(dest).scale(1/n);		// f(x) := dest + x * (post - dest) / n  --   0..[n-1]

  console.error('miss', p,v);
  // do a binary search

  let l	= 0;
  let h	= n - 1;
  let x;

  while (l <= h)
    {
      const m	= ((n+l) / 2) | 0;
      const k	= dest.pos(v.scale(m));
      if (yield* check(k, n))
        return;						// there is progress
      l	= m + 1;
    }
  return true;
}

for (;;)
  {
    const d	= yield ['dist', dest];
    if (d <= delta+1) return ['act arrived!', d, delta];

    for (let n=delta || 1; yield* miss(n, d); n *= 2)
      if (n * 3 > d)
        {
          yield ['tp', dest];
          return ['act sorry no way found', d, n];
        }
  }

