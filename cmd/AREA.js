// Find AREA signs.
//
// AREA signs are pairs of signs with the same tag after the BOT definition.
// These form a cuboid with [[x1.x2],[y1,y2],[z1,z2]]

const signs = yield ['sign', _];
if (!signs?.length) return;

const order	= {};

for (const s of signs)
  {
    if (!s.valid) continue;
    const n = `${s.text[0]}\t${s.text[3]}`;
    (order[n] ??= []).push(s);
  }

const r = [];

for (const x of Object.values(order))
  {
    do
      {
        // fetch the first sign
        const a	= x.shift();
        if (!x.length)
          {
            yield ['act missing second sign for', a.text[1], a];
            break;
          }
        // find the nearest other sign
        const p	= yield ['locate', a];

        let b	= x[0];
        let d	= a.dist(b);
        for (let i=b.length; --i>0; )
          {
            const x = b[i];
            const n = a.dist(x);
            if (n >= d) continue;
            b	= x;
            d	= n;
          }

        r.push([a,b]);
      } while (x.length > 1);
  }

console.error('ALL', order);
return r;

