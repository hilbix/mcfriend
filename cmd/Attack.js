//	attack the nearest enemies
// (currently has no parameters)

this.last ??= void 0;

function* find(_) { const e = yield ['nearest', {type:'hostile'}, _]; if (e.id) return e }

const e = void 0
  ?? (yield* find({name:'witch'}))
  ?? (yield* find({name:'pillager'}))
  ?? (yield* find({name:'creeper'}))

if (!e) return 'no enemy found';
if (!e.hostile) return ['act WTF? not hostile', e.id, e];

if (!(yield ['hand']).weapon)
  {
    const w = Array.from(yield ['invs']).filter(_ => _.weapon).sort((a,b) => a.dur < b.dur);
    if (!w.length) return 'I have no weapon';
    yield yield ['equip', 'hand', w[0]];
  }

const p = yield [`locate`, e];
if ((yield ['dist', e]) >= 2)
  yield yield ['Move', p, 1, e.id !== last ? e : null];
if (e.id !== last)
  yield yield ['act attacking', e, p];
last = e.id;
yield yield ['attack', e];

