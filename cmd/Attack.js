//	attack the nearest enemies
// (currently has no parameters)

this.last ??= void 0;
this.wait ??= 0;
this.backoff ??= 0;

function* find(_) { const e = yield ['nearest', {type:'hostile'}, _]; if (e.id) return e }

const e = void 0
  ?? (yield* find({name:'witch'}))
  ?? (yield* find({name:'pillager'}))
  ?? (yield* find({name:'creeper'}))

if (!e)
  {
    const t = yield ['set auto:attack:again'];
    if (t !== '')
      {
        const b = yield ['set auto:attack:backoff'];
        yield yield ['in', (t|0)+backoff, 'attack'];
        backoff += b|0;
      }
    return ['act no enemy found'];
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

