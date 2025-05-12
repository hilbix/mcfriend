//	attack the nearest enemies
// (currently has no parameters)

this.last ??= void 0;
this.wait ??= 0;

const nolava = fn => _ => !__ABI__.B.blockAt(_.position.offset(0,-1,0)).name.includes('lava');
function* nearest(..._) { const e = yield ['nearest', nolava, _]; if (e.id) return e }
function* find(a, ..._) { for (const name of a) { const e = yield* nearest(name === '.' ? [] : {name}, ..._); if (e !== void 0) return e } }
function find2(...a) { return find(a) }

const e = yield* find2(...(_.length ? _ : ['phantom','silverfish','witch','pillager','creeper','zombie','zombie_villager','skeleton','cave_spider','spider','ghast','magma_cube','slime']));

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

if (false)	// XXX deactivated
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
  yield ['Move', p, 1, e.id !== last ? e : null];
if (e.name !== last)
  yield yield ['act ATTACK', e, p];
last = e.name;
yield yield ['attack', e];

