// locate trees, cut and replant them
// Needs a sign: "tree"

yield ['act TREE start'];

try {
  const signs = yield ['sign tree'];
  if (!signs) return;

  let count = 0;
  for (const s of signs)
    {
      if (!s.valid) continue;
      count++;

      const g	= yield ['locate', s];
      const q	= (yield ['block', g, 3, 3]);
      const l	= q.filter(_ => _.id?.endsWith('_log'));	// logs
      const k	= q.filter(_ => _.id?.endsWith('_sapling'));	// saplings

      if (!l.length)
        {
          const _	= s._.block.getSignText()[0].split('\n')[3].split(' ');
          const x	= _.shift()|0;
          const y	= g.vec().y;
          const z	= _.shift()|0;
          const n	= _.shift()|0;	// not used
          const t	= _.join(' ');	// should not happen
          if (!t) continue;

          const l	= {jungle:2}[t]??1;
          const i	= `${t}_sapling`;

          if (k.length >= l*l) continue;

          yield yield ['PUT'];
          yield yield ['supply', `${i}=${l*l}`];
          yield ['Move', s];

          const c	= Array.from(yield ['invs']).filter(_ => _.id === i);
          if (c.reduce((a,_) => a + _.count, 0) < l*l) throw `WTF? out of ${i}`;
          const j	= c[0].type;

          let had;
          for (let a=l; --a>=0; )
            for (let b=l; --b>=0; )
              {
                const u	= yield ['block', yield ['pos', x+a, y, z+b]];
                if (u.id === i) continue;

                if (u.id !== 'air')
                  {
                    // XXX TODO XXX break block?
                    continue;
                  }

                had	= true;
                yield yield ['equip hand', j];
                yield yield ['place', u];
              }
          if (!had) continue;
          yield yield ['in 1 tree'];
          return ['act tree plant', s];
        }

      const type	= l[0].id.slice(0,-4);

      const d = [], x = [], z = [];
      for (const _ of l)
        {
          const r = yield ['block', _.pos(0, -1, 0)];
          switch (r.id)
            {
            default: 	throw `tree ${_} ${_.pos()} not rooted: ${r.id}`;
            case 'dirt':	break;
            case 'coarse_dirt':	break;
            }
          d.push([yield ['dist',_], _]);
          const v = _.pos().vec();
          x.push(v.x);
          z.push(v.z);
        }
      const num = (a,b) => a - b;
      d.sort(([a],[b]) => a-b);
      x.sort(num);
      z.sort(num);

      //yield ['act tree', x[0], z[0], s];

      yield yield ['PUT'];
      yield yield ['axe'];
      yield ['Move', s];

      yield yield ['setSign', s, 0, x[0], z[0], l.length, type];
      yield yield ['dig', l[0]];

  //    yield yield ['PUT'];

//      yield ['AGAIN tree'];
      yield yield ['in 1 tree'];
      return ['act tree harvest', s];
    }
  yield ['act TREE done:', count];
} catch (e) {
  yield [`act TREE fail: ${e}`];
}

yield ['AGAIN tree'];
return ['PUT'];

