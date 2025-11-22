// locate signs near chests

const signs = yield ['sign', _];
if (!signs) return;

let ok=0, bad=0, oth=0;

for (const s of signs)
  {
//    if (!s.valid) continue;
//    yield ['act sign', s, yield ['locate', s]];

    const d = (yield ['block', s, 6]).filter(_ => _.container);
    if (d.length === 1)
      ok++;
    else if (d.length === 0)
      oth++;
    else
      {
        yield ['act invalid:', s, s.valid];
	bad++;
      }
  }

yield ['act signs chest', ok, 'other', oth, 'bad', bad];
