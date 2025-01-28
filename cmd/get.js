// get something out of a storage box
// 1. locate the sign with the box
// 2. open the box
// 3. take thing out of box

const signs = yield ['sign', 'get', _]
if (!signs.length) return ['act no sign found for', _]

//console.error('GET', signs);

for (const s of signs)
  {
    yield yield ['Move', s];
  }


/*
      // future: autoget
      if (!c.length) c=Object.keys(this.state.get||{});
      if (!c.length) return yield `please state what to get`;
*/
