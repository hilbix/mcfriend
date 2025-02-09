//	attack the nearest enemies
// (currently has no parameters)

this.last ??= void 0;
this.wait ??= 0;
this.backoff ??= 0;

function* hostile(_) { const e = yield ['nearest', _]; if (e.id) return e }
function* find(...a) { for (const name of a) { const e = yield* hostile(name === '.' ? [] : {name}); if (e !== void 0) return e } }

const e = yield* find(...(_.length ? _ : ['phantom','witch','pillager','creeper']));

if (!e)
  {
    yield yield ['supply'];
    if (_.length)
      return ['act no enemy found', _];
    const t = yield ['set auto:attack:again'];
    const w = (t|0)+backoff;
    if (t !== '')
      {
        yield yield ['in', w, 'attack'];
        backoff += (yield ['set auto:attack:backoff'])|0;
      }
    return ['act no enemy found', w/1000, _];
  }
if (!e.hostile) return ['act WTF? not hostile', e.id, e];
backoff = 0;

if (!(yield ['hand']).weapon)
  {
    const w = Array.from(yield ['invs']).filter(_ => _.weapon).sort((a,b) => a.dur < b.dur);
    if (!w.length)
      {
        yield 'I have no weapon';
        if (++wait>5)
          return 'failed to fetch weapon';
        yield yield ['Weapon', 'sword'];
        return ['Attack', _]
      }
    yield yield ['equip', 'hand', w[0]];
  }
wait = 0;

const p = yield [`locate`, e];
if ((yield ['dist', e]) >= 2)
  yield yield ['Move', p, 1, e.id !== last ? e : null];
if (e.id !== last)
  yield yield ['act attacking', e, p];
last = e.id;
yield yield ['attack', e];

