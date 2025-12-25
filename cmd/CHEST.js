// locate signs near chests


const r = [];
const signs = yield ['sign', _];
if (!signs) return;

for (const s_ of signs)
  {
    const s = yield ['validsign', s_];
    if (!s) continue;
//    yield ['act sign', s, yield ['locate', s]];

    const d = (yield ['block', s, 6]).filter(_ => _.container);
    if (d.length === 1)
      r.push([d[0],s]);
    else
      yield ['note Invalid', s, s.valid];
  }
return r;

