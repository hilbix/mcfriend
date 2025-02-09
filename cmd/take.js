//	fill chests marked 'put' with inventory items

this.track ??= {};

yield ['CACHE clear'];
yield ['PUT'];

//const a = yield ['chest', 'D'];
const a = yield ['CHEST', 'take'];
if (!a?.length) return yield 'no signs with "take"?';

/*
yield 'TAKE START';
for (const c of a)
  {
    yield yield ['TP', c];
    try {
    const x = yield ['open', c];
    const i = x.items();
    console.log(x, i);
    yield yield ['close', x];
    } catch (e) {
      yield ['act error:', e];
    }
  }
yield 'TAKE END';

return;
*/

for (const [c,s] of a)
  {
    const t = c.container;
    if (!t) continue;

//    yield yield ['Move', c, 1];
    yield yield ['TP', s];
    const r = yield ['OPEN', c];
    if (!r) continue;

    const i = r.items();
    let ok	= 'PUT';
    try {
      if (t === true)
        for (const e of i)
          {
            if (!e.id) continue;
            // /execute as @a run attribute @s minecraft:generic.luck base set 666
            // /execute as @a if     data entity @s Attributes[{Name:"minecraft:generic.luck",Base:666d}] run tellraw @p [{"selector":"@s"}]
            // /execute as @a unless data entity @s Attributes[{Name:"minecraft:generic.luck",Base:666d}] run tellraw @p [{"selector":"@s"},"=",{"entity":"@s","nbt":"Attributes[{Name:'minecraft:generic.luck'}].Base"}]
            // make following hack no more needed:
            //if (i.id.startsWith('wooden_') || i.id === 'stick') continue;	// safty issue, as wooden_* and sticks have other meaning at my server
            yield yield ['take', r, e, e.count];
          }
      else
        {
//          ok	= 'drop';
          if (yield ['slot', t])	// filled slot?
            yield yield ['take', t];	// take out
        }
    } catch (e) {
      console.error('TAKE', e);
      yield yield ['act ERROR', e];
    }
    yield yield ['wait', 10];
    yield yield ['OPEN'];	// close r
    yield yield [ok];
  }

yield yield ['act TAKE done'];

