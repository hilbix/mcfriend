// DIGGER queue [ITEMS]

let next;

const	q = _.shift(_);

const items= yield ['item', _];
if (!items || !items.length) throw `WTF? no items ${_}`;
const want = Object.fromEntries(items.map(_ => [_.id,true]));

let it = [];
try {
  it	= yield ['item', _.map(_ => `_${_}`)];
} catch (e) {
}
const ign = Object.fromEntries(it.map(_ => [_.id,true]));

let did = false;
let n=50;
let m=1000;
while (--m>=0 && n>=0 && (next = yield* q()))
  {
    if (want[next.id])
      {
        yield ['BREAKER', next];
        n--;
        did = true;
        continue;
      }
    yield* q.ok(next);

    if (!ign[next.id])
      {
	ign[next.id] = 1;
        yield ['report', {pos:next}, next, _];
      }
  }

q.end();

return did || m<0;

