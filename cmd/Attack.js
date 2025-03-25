//	attack the nearest enemies
// (currently has no parameters)

this.last ??= void 0;
this.wait ??= 0;

function* nearest(_) { const e = yield ['nearest', _]; if (e.id) return e }
function* find(...a) { for (const name of a) { const e = yield* nearest(name === '.' ? [] : {name}); if (e !== void 0) return e } }

const e = yield* find(...(_.length ? _ : ['phantom','witch','pillager','creeper','zombie','skeleton','cave_spider','spider','slime','ghat','magma_cube']));

if (!e)
  {
//    yield yield ['supply'];
    if (_.length)
       return last=['home no enemy', _];

    const w = yield ['AGAIN attack'];
    yield yield ['home'];
    return last=`no enemy ${w} ${_}`;
  }
//if (!e.hostile) return ['act WTF? not hostile', e.id, e];

yield ['AGAIN attack 0'];	// reset waiting backoff

if (!(yield ['hand']).weapon)
  {
    const w = Array.from(yield ['invs']).filter(_ => _.weapon).sort((a,b) => a.dur < b.dur);
    if (!w.length)
      {
        if (++wait>5)
          return last='failed to fetch weapon';
        yield 'Need weapon';
        yield yield ['tool', 'sword'];
        yield ['in 5 attack']
        return last='no weapon';
      }
    yield yield ['equip hand', w[0]];
  }
wait = 0;

const p = yield [`locate`, e];
if ((yield ['dist', e]) >= 2)
  yield yield ['Move', p, 1, e.id !== last ? e : null];
if (e.name !== last)
  yield yield ['act ATTACK', e, p];
last = e.name;
yield yield ['attack', e];

