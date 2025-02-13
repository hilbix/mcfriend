//

const e = {};

for (const x of yield ['entities', _.map(_ => [_, 'entities'])])
  (e[x.name] ??= []).push(x);

const o = Object.entries(e).sort(([a,A],[b,B]) => A.length > B.length ? -1 : A.length < B.length ? 1 : a>b ? -1 : a<b ? 1 : 0);
for (const [k,v] of o)
  {
    const p = yield ['locate', v[0]];
    yield [ 'act', v.length, v[0]._.type, v[0].hostile ? '*' : '-', k, p ];
//    if (x === 'player') for (const p of e[x]) console.log(p._.username, p._.UUID);
  }

