// locate signs near chests

const signs = yield ['sign', _];
if (!signs) return;

for (const s of signs)
  {
//    if (!s.valid) continue;
    yield ['act sign', s, yield ['locate', s]];

    const d = (yield ['block', s, 6]).filter(_ => _.container);
    if (d.length === 1)
      yield ['act sign', s, 'at', yield ['locate', s], s.valid];
    else
      yield ['act invalid:', s, s.valid];
  }

