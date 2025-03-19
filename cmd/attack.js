//

//yield ['act ATTACK start'];

yield yield ['PUT'];

for (let cnt=0;; cnt++)
  {
    yield yield ['drop'];
    yield yield ['supply'];
    if (!(yield ['have *sword']))
      yield yield ['CRAFT stone_sword'];
    const x = yield ['Attack', _];
    if (x !== void 0)
      return ['act ATTACK done', cnt, x];
    yield ['wait'];
    yield yield ['torch'];
    yield ['wait',2];
  }

