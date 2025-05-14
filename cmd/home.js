// Send the bot home
// (and optionally say something)

if (_.length) yield ['act', _];
for (let i=0; ++i<=100; yield ['wait', i])
  {
    // find all home signs
    const p = yield ['sign home'];
    if (!p?.length) return yield 'cannot find sign home';

    // find a valid one
    const v = p.filter(_ => _.valid);
    if (v.length)
      {
        yield ['Move', v[0]];
        return
      }

    // else find a random one
    const d = p.filter(_ => _._.dim === dimension);
    if (!d.length) break;

    // else try to move to a random (nearest?) one
    console.log('no valid home yet', d.map(_ => _.vec));

    yield ['Move', d[0]];
  }

yield ['Move', yield ['pos', 0,64,0]];

return yield ['act no valid home in this', dimension];

