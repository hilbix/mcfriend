//

yield ['act ATTACK start'];

for (;;)
  {
    yield ['PUT'];
    yield ['drop'];
    yield ['supply'];
    const x = yield ['Attack', _];
    if (x !== void 0)
      return ['act ATTACK done', x];
    yield ['wait'];
    yield yield ['torch'];
    yield ['wait',2];
  }

