// DIGGER queue [ITEMS]

let next;

const	q = _.shift(_);

const items= yield ['item', _];
if (!items || !items.length) throw `WTF? no items ${_}`;

const want = Object.fromEntries(items.map(_ => [_.id,true]));

let n=10;
while (n>=0 && (next = yield* q()))
  {
    yield ['act DIGGER', n, next];
    if (want[next.id])
      {
        yield ['BREAKER', next];
        n--;
      }
    else
      yield* q.ok(next);
  }

q.end();

