// Teleport player to the given sign
//
// returns babble (ignore if not wanted)

this.hist	??= [];

//const pos	= yield ['pos', src];
//hist		= hist.filter(_ => pos.

const have = [];

let last = _[_.length-1];
if (last === `${parseInt(last)}`)
  last = _.pop()|0;
else
  last = void 0;

return (yield* check(_)) || (yield* check(['note', 'fill', 'get', 'store', 'put', 'overflow', 'craft', 'made', 'toomuch', 'destroy'], _)) || (yield* sel()) || ['act not found', _];

function* sel()
{
  // TODO create selector of options
  // for now just jump to the first thing found
  if (!have.length) return;
  if (last !== void 0 && have[last])
    return yield* jump(have[last]);
  for (const s of have)
    if (s.valid)
      return yield* jump(s);
  return yield* jump(have.shift());
}

function* check(t, ..._)
{
  for (const a of t)
    {
      const s	= yield ['sign', a, ..._];
      if (!s) continue;

//      if (s.length === 1) return yield* jump(s[0]);

      for (const x of s)
        {
          yield ['act', have.length, x.valid ? 'O' : '?', x];
          have.push(x);
        }
    }
}

function* jump(_)
{
  yield yield ['say /tp', src._, (yield ['locate', _]).id];
  return ['act to', _, have.flat().length];
}

