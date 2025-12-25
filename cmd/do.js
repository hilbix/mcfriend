
this.hist ??= [];

const cmd =_.map(_ => 'string' !== typeof _ || _[0]!=='$' ? _ : Array.from(_.substr(2)).reduce((a,_) => a[_], hist[_[1]|0][0]));

if (`${cmd[0]}` === `${parseInt(cmd[0])}`)
  {
    const n = parseInt(cmd.shift());
    if (n>1)
      yield ['in 1 do', n-1, cmd];
    return yield ['in 0', cmd];
  }

const r = yield cmd;
hist.unshift([r, cmd]);
if (hist.length>10) hist.pop();
//console.error('res', r);
return [ 'act result', yield* dump('res', r), 'cmd:', (yield* dumper([], cmd)).map(_ => _[1])];

function* dump(...a)
{
  const n = yield* dumper(...a);
  for (const i in n)
    yield ['act', i, n[i].join(': ')];
  return n.length;
}

function* dumper(p, _, n=[])
{
  if (Array.isArray(_))			for (const i in _) yield* dumper(`${p}[${i}]`, _[i], n);

  else if ('object' !== typeof _)	n.push([p, toJ(_), 'N', typeof _]);

  else if (_.toString)
    {
      const t = `${_}`;
      switch (t)
        {
//        case '[object Generator]':	for (const x of _)	yield* dumper(`${p}!`, x, n);
        default:			n.push([p, _, 'S', _.toString(), typeof _]);
        }
    }

//  else for (const k in _())		yield* dumper(`${p}`, _, n);
  else for (const k in _)		yield* dumper(`${p}.${k}`, _[k], n);

  return n;
}

