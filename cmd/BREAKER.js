// BREAKER block..
//
// break given block

for (const b of _)
  {
    const p	= yield ['SPOT', 5, b];
    if (b)
       yield ['Move', b];
    const {x,y,z} = b.vec();
    yield ['say /execute run fill',x,y,z,x,y,z,'air destroy'];
    yield yield ['wait'];
  }

