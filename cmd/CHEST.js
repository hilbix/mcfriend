// locate signs near chests


const r = [];
const signs = yield ['sign', _];
if (!signs) return;

const w = signs.length;
//yield ['act CHEST?', w, _];

for (const s_ of signs)
  {
    const s = yield ['validsign', s_];
    if (!s) continue;

    //yield ['act sign', s, yield ['locate', s]];
    //yield ['act sign', s, _];

    const t = yield ['SPOT', 5, s];
    if (t !== false)
      yield ['tp', t ?? s];
    yield ['wait', 3];

    const bs = yield ['block', s, 6];
    const d = bs.filter(_ => _.container);
    if (d.length === 1)
      r.push([d[0],s]);
    else
      yield ['act Invalid', d.length, s, s.valid, bs];
  }
//yield ['act CHEST', w, r.length, _];
return r;

