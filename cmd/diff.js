//

function* kv(fn)
{
  const r	= {};
  const l	= [].concat(_);


  do
    {
      const x	= l.shift() ?? '';
      const v	= yield* fn('set', `${x}:`);

      const s	= x.split(':');
      const e	= s.pop();
      r[x]	= v;

      if (v !== true)
        for (const k of v.split(' '))	// this should be single value or array, but leave this to future
          l.push(`${x}:${k}`);

    } while (l.length);
  return r;
}

// TODO: if not given or '*', diff to all!
const t	= _.shift();
if (!t) return 'need other bot name to diff';

const a	= yield* kv(function*(..._) { return fromJ(yield ['return', t, _]) });
const b	= yield* kv(function*(..._) { return yield _ });

const all = {};

for (const _ in a) if (a[_] === true) all[_] = true;
for (const _ in b) if (b[_] === true) all[_] = true;

let diff = 0;
for (const _ of Object.keys(all).sort())
  {
    if (a[_] === b[_]) continue;
    diff++;
    if (_ in b)
      yield yield ['act -', _];
    if (_ in a)
      yield yield ['act +', _];
  }

return yield ['act DIFF:', diff, 'differences to', t];

