// Teleport player to the given sign
//
// returns babble (ignore if not wanted)

this.hist	??= [];

//const pos	= yield ['pos', src];
//hist		= hist.filter(_ => pos.

const have = [];

const isi = _ => _ === `${parseInt(_)}`;

if (_.length === 3 && isi(_[0]) && isi(_[1]) && isi(_[2]))
  return yield* jump(yield ['block', [_]]);

let last = _[_.length-1];
if (isi(last))
  last = _.pop()|0;
else
  last = void 0;

return (yield* check(_)) || (yield* check(['note', 'fill', 'get', 'store', 'put', 'overflow', 'craft', 'made', 'toomuch', 'destroy'], _)) || (yield* sel()) || ['act not found', _];

function* sel()
{
  // TODO create selector of options
  // for now just jump to the first thing found
  if (!have.length) return;
  for (const s of have)
    console.error(`# ${s}`);

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
          yield ['act', have.length, x.valid ? 'O' : '?', x.text[0], x.text[2], x.text[3], x._vec];
          have.push(x);
        }
    }
}

function* jump(_)
{
  const b = yield ['SPOT', 2, _];
  yield yield ['say /tp', src._, (yield ['locate', b || _]).id];
  return ['act to', _, have.flat().length];
}

