// automatically mark empty chestsigns
//
// signs		jump to first empty sign
// signs N		jump to Nth empty sign after first
// signs list		list first empty sign
// signs N list		list Nth sign after first
// signs fix BOTS store	make line one and two

let n		= _[0]|0;
if (`${n}` === _[0])
  _.shift();
else
  n		= void 0;

let check	= function*(_) { return true }
let tag		= '\n\n\n';
let end		= function*(_) { return yield ['JUMP', _] };

this.cache	??= {};

switch (_[0])
  {
  case 'list':	end	= function*(_,c) { return yield ['act', _, yield* dump(c), toJ(inf) ]	};
                check	= function*(_) { return   yield* chest(_)	};
  default:	cache	= void 0;
                break;
  case 'fix':	end	= function*(_) { return ['act', _, toJ(inf)]	};
                check	= fix;
                if (_.length === 1)
                  _	= ['fix', 'BOTS', 'store'];
                break;
  case 'bug':	check	= function*(_) { return !(yield* chest(_))	};
                cache	= void 0;
                break;
  }

n ??= 0;
this.cache	??= { };

const inf	= { cache:Object.keys(cache).length};

for await (const a of yield ['osign'])
  {
    if (a.full[0] !== tag || cache[a]) continue;
    const c = yield* check(a);
    if (!c) continue;

    if (c === 1) cache[a] = true;

    // check for chest type
    //yield ['act', n, a, c];
    if (!n--) return yield* end(a,c);
  }

return yield ['act', _, 'END'];

function* chest(s)
{
  const d = (yield ['block', s, 6]).filter(_ => _.container);
//  yield ['act chest', d.length];
  if (d.length === 1)
    return d[0];
}

function* items(c)
{
  const r = yield ['OPEN', c];
  if (!r) return;

  const o = OB();
  for (const i of r.items())
    {
      if (i.empty) continue;
      o[i.id] ??= 0;
      o[i.id] += i.n;
    }
  yield ['OPEN'];
  return o;
}

function* dump(c)
{
  const i = yield* items(c);
  if (!i) return;

  for (const [k,v] of Object.entries(i))
    yield ['act', c, k, v];
}

function* fix(c)
{
  yield ['verbose signs fix', c];
  const b	= yield* chest(c);
  if (!b)
    {
      yield ['verbose signs fail', c];
      return;
    }

  const i = yield* items(b);
  if (!i)
    {
      yield ['act signs items?', b];
      return 1;
    }

  const e	= Object.entries(i);
  if (!e.length)
    {
      inf.empty = 1+(inf.empty|0);
      return 1;
    }

  if (e.length > 1)
    {
      inf.wtf = 1+(inf.wtf|0);
      yield ['act WTF?', c, e.length];
      return true;
    }
  yield ['act', c, _.slice(1), e[0][0]];
  if (_.length === 3)
    {
      inf.done = 1+(inf.done|0);
      const p = c._.pos;
      const l = [ _[1], _[2], e[0][0], ''];
      for (const k in l)
        yield ['say /data modify block', p.x,p.y,p.z, `front_text.messages[${k}] set value ${toJ(toJ({text:l[k]}))}`];
//      yield ['close', yield ['open', c]];
      yield ['click', c];
      yield ['wait', 5];
      yield ['close'];
      yield ['click', c];
      yield ['wait', 5];
      yield ['close'];
    }
  else
    inf.had = 1+(inf.had|0);
  return true;
}

