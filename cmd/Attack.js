//	attack the nearest enemies
// (currently has no parameters)

this.last ??= void 0;
this.wait ??= 0;

function* nearest(_) { const e = yield ['nearest', _]; if (e.id) return e }
function* find(...a) { for (const name of a) { const e = yield* nearest(name === '.' ? [] : {name}); if (e !== void 0) return e } }

const e = yield* find(...(_.length ? _ : ['phantom','witch','pillager','creeper','slime','zombie','skeleton']));

if (!e)
  {
    yield yield ['supply'];
    if (_.length)
      return `no enemy found ${_}`;

    const w = yield ['AGAIN attack'];
    yield yield ['home'];
    return `no enemy found ${w} ${_}`;
  }
//if (!e.hostile) return ['act WTF? not hostile', e.id, e];

yield ['AGAIN attack 0'];	// reset waiting backoff

if (!(yield ['hand']).weapon)
  {
    const w = Array.from(yield ['invs']).filter(_ => _.weapon).sort((a,b) => a.dur < b.dur);
    if (!w.length)
      {
        if (++wait>5)
          return 'failed to fetch weapon';
        yield 'Need weapon';
        yield yield ['tool', 'sword'];
        yield ['in 1 attack']
        return 'no weapon';
      }
    yield yield ['equip hand', w[0]];
  }
wait = 0;

const p = yield [`locate`, e];
if ((yield ['dist', e]) >= 2)
  yield yield ['Move', p, 1, e.id !== last ? e : null];
if (e.name !== last)
  yield yield ['act attacking', e, p];
last = e.name;
yield yield ['attack', e];

