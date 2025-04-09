// Teleport player to the given sign
//
// returns babble (ignore if not wanted)

this.hist	??= [];

const pos	= yield ['pos', src];
//hist		= hist.filter(_ => pos.

const have = [];

//if (!_.length)

return (yield* check(_)) || (yield* check(['note', 'store', 'get', 'overflow', 'toomuch', 'destroy'], _)) || (yield* sel()) || ['act not found', _];

function* sel()
{
  // TODO create selector of options
  // for now just jump to the first thing found
  if (have.length)
    return yield* jump(have[0][0]);
}

function* check(t, ..._)
{
  for (const a of t)
    {
      const s	= yield ['sign', a, ..._];
      if (!s?.length) continue;

      if (s.length === 1)
        return yield* jump(s[0]);

      have.push(s);
    }
}

function* jump(_)
{
  yield yield ['say /tp', src._, (yield ['locate', _]).id];
  return ['act to', _, have.flat().length];
}

