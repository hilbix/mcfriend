// Teleport player to the given sign
//
// returns babble (ignore if not wanted)

this.last	??= {};

const have = [];

return (yield* check(_)) || (yield* check(['store', 'get', 'overflow', 'toomuch', 'destroy', 'note'], _)) || (yield* sel()) || ['act not found', _];

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
  return ['act to', _];
}

