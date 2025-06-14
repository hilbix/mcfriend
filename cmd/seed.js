// seed area
// Needs two "seed"-signs, 3rd line is what to plant

yield ['note SEED start'];
yield yield ['PUT'];

try {
  yield yield ['drop'];
  for (const [a,b] of yield ['AREA seed'])
    {
      const av = a.vec(), bv = b.vec();
      if (av.y !== bv.y)
        {
          yield ['act seed AREA must be flat:', area];
          continue;
        }

      const i = a.text[3];
      const n = ((Math.abs(av.x - bv.x) + 1) * (Math.abs(av.z - bv.z) + 1))|0;

      yield yield ['supply', `${i}=${n+1}`];

      const c	= Array.from(yield ['invs']).filter(_ => _.id === i);
      if (!c.length)
        {
          yield ['act WTF? have no', i];
          continue;
        }
      yield yield ['equip hand', c[0].type];

      const iter = yield ['block', a,b];
      for await (const c of iter())
        {
          if (c.id !== 'air') continue;

          const d = yield ['block', c.pos(0,-1,0)];
          if (d.id !== 'farmland') continue;

          yield ['tp', c.pos(0,0.1,0)];
          yield yield ['wait'];		// relax a bit
          yield yield ['click', d];
          yield yield ['wait'];		// relax a bit
        }
    }
  yield ['note SEED ok'];
} catch (e) {
  yield [`act SEED fail: ${e}`];
  throw e;
}

yield ['note SEED done'];
return ['PUT']


