// chop something (break only part)
// Needs two "chop"-signs to define the area

yield ['act CHOP start'];

try {
  for await (const [a,b] of yield ['AREA chop'])
    {
      if (a.vec().y !== b.vec().y)
        {
          yield ['act CHOP AREA must be flat:', area];		// for now
          continue;
        }

      let cnt	= 0;
      const trg	= a.text[3];
      const itm	= {};
      for (const _ of yield ['item', trg])
        itm[_.id] = true;

      yield ['tool axe'];

      const it	= yield ['block', a,b];
      for await (const c of it())
        {
          if (!itm[c.id]) continue;

          const d = yield ['block', c.pos(0,1,0)];
          if (c.id !== d.id) continue;

          cnt++;

          yield ['Move', c];
          yield yield ['dig', d];
        }
      yield ['act CHOP', cnt, trg];
    }
} catch (e) {
  yield [`act CHOP fail: ${e}`];
}

yield ['act CHOP done'];
return yield ['AGAIN chop'];

