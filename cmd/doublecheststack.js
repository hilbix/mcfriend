// Place a double chest with a sign


const p = yield ['pos'];
//yield ['act pos', p];

try {
  for (let z=0; z<100; z++)
    {
      const p0	= yield ['block', p.pos(1,z,-1)];
      const p1	= yield ['block', p.pos(1,z,0)];
      const p2	= yield ['block', p.pos(1,z,1)];
      const c	= yield ['chesty', p1, p2];

      if (c[0] !== 'R' && c[1] !== 'L')
        {
          if (isAir(p1))
            yield ['PLACE chest', p1, isAir(p2) ? 'd' : p2];
          else if (isAir(p2))
            yield ['PLACE chest', p2, p1];
          else
            yield ['BREAKER', p1, p2];
          yield ['TP', p];
          break;
        }
      if (!isSign(p0))
        {
          if (!isAir(p0))
            yield ['BREAKER', p0];
          yield ['TP', p];
//          yield ['wait', 10];
          yield ['PLACE', 'jungle_sign', p0, p1];
          break;
        }
    }

//  yield ['act ok'];
} catch(e) {
  console.error(e);
  yield ['act ERR', `${e}`];
}

