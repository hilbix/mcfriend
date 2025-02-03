//

for (;;)
  {
    const x = yield ['Attack', _];
    if (x !== void 0) return x;
    await sleep(500);
    yield yield ['torch'];
    await sleep(100);
  }

