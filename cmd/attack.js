//

for (;;)
  {
    yield ['drop'];
    const x = yield ['Attack', _];
    if (x !== void 0) return x;
    yield ['wait'];
    yield yield ['torch'];
    yield ['wait',2];
  }

