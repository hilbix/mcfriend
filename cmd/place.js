// place needs 2 signs
//
// within the AREA the given blocks are placed

//console.log(__ABI__.B.game.dimension);
//console.error(__ABI__.B.world);

for (const a of yield ['AREA place'])
  yield yield* area(a);

// Process an area A..B
function* area(a)
{
  yield ['act placing', a];

  // go one lower than the signs
  const aa = [ a[0].pos(0,-1,0), a[1].pos(0,-1,0) ];

  // Get the material to place
  const item = yield ['item', a[0].text[3]];
  if (!item) throw `WTF? unknown s.text[3]`;
  
  // currently only one material is supported
  // in future we perhaps place it multi things randomly

  console.error('AREA', item.map(_ => _.id), aa);

  // find all the positions to place things to
  const pos	= OB();
  let cnt = 0;

  const iter = yield ['block', aa];
  for (const b of iter())
    {
      if (!isAir(b))
        switch (b.id)
          {
          default: continue;

          case 'water':
          case 'lava':
            break;
          }

      const v = b.vec();
      (pos[v.y|0] ??= new Set()).add([v.x|0,v.z|0]);
      cnt++;
    }
  if (!cnt)
    return yield ['act nothing to do', aa];

  const sw = Object.keys(pos)[0]|0;
  const [min,max] = Object.keys(pos).reduce(([a,b],c) => { c=c|0; return [a>c ? a : c, b<c ? b : c] }, [sw,sw]);

  console.error(min, max, cnt, Object.entries(pos).map(([k,v]) => [k, v.size]));

  for (let y=min; y<=max; y++)
    for (const [x,z] of pos[y])
      yield yield* place(item, x,y,z);
}

function* place(items, x,y,z)
{
  for (const d of 'ewns')
    {
      const b	= yield ['block', [[x, y, z]], d];
      if (isAir(b[0])) continue;

      const p = yield ['SPOT', 3, (yield ['block', [[x,y,z]]])];
      if (p === void 0) return;

      const item	= yield ['getsome', items];
      if (!item)
        throw `out of ${items.map(_ => _.id)}`;

      if (p)
        {
          yield ['act place', x,y,z];
          yield ['Move', p];
        }

      try {
        yield yield ['equip hand', item.type];
        yield ['placer', b, `${d}r`];
        yield yield ['wait'];
        return;
      } catch {};
    }
}

