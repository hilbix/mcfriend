// harvest area and prepare it for seeding
// Needs two "harvest"-signs
//
// Currently cannot use Move as this creates jump damage

yield ['act HARVEST start'];

//const grown 

try {
  for (const [a,b] of yield ['AREA harvest'])
    {
      if (a.vec().y !== b.vec().y)
        {
          yield ['act harvest AREA must be flat:', area];
          continue;
        }
      const iter = yield ['block', a,b];
      for await (const c of iter())
        {
          const d = yield ['block', c.pos(0,-1,0)];
          if (c.id === 'air')
            switch (d.id)
              {
              case 'grass_block':
              case 'dirt':
                yield yield ['tool hoe'];
                yield ['Move', c];
                yield yield ['click', d];
                continue;
              }
          else if (d.id === 'farmland')
            {
              const st = (yield ['blockdata', c.id])[0];
              const st0 = st.states?.[0];
              if (st0?.name === 'age' && st0.values[st0.values.length-1] == c.meta)
                {
                  yield ['Move', c.pos(0,0.1,0)];
                  yield yield ['dig', c];
                }
//              else return console.error('HARVEST', c.id, st);
            }
        }
    }
  yield ['act HARVEST ok'];
} catch (e) {
  yield [`act HARVEST fail: ${e}`];
//  throw e;
}

yield ['act HARVEST done'];
yield yield ['AGAIN harvest'];

return ['seed'];

