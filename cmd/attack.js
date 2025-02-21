//

yield ['act ATTACK start'];

yield yield ['PUT'];

for (;;)
  {
    yield yield ['drop'];
    yield yield ['supply'];
    const x = yield ['Attack', _];
    if (x !== void 0)
      return ['act ATTACK done', x];
    yield ['wait'];
    yield yield ['torch'];
    yield ['wait',2];
  }

