//

for (const a of ['store', 'get', 'overflow', 'toomuch', 'destroy', 'note'])
  {
    const s	= yield ['sign', a, _];
    if (!s?.length) continue;

    if (s.length === 1)
      {
        yield yield ['act to', s.map(_ => `${_}`)];
        return ['say /tp', src._, (yield ['locate', s[0]]).id];
      }
  }

return ['act not found', _];

