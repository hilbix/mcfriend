// empty chests marked 'take'

this.track ??= {};

yield ['note TAKE start'];

yield ['CACHE clear'];
yield ['PUT'];

const a = yield ['CHEST', _.length ? _ : 'take'];
if (!a?.length) return yield ['act no signs with', _];

let had = false;

for (const [c,s] of a)
  {
    const t = c.container;
    if (!t) continue;

    yield ['Move', s, 1];
    const r	= yield ['OPEN', c];
    if (!r) continue;

    const i	= r.items().filter(yield* itemFilter(s.text[3]));

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
            yield yield ['take', r, e, e.count];	// For unknown reason this crashes outside this sandbox
            yield ['AGAIN take 0'];	// reset backoff
	    had = true;
          }
      else
        {
//          ok	= 'drop';
          if (yield ['slot', t])	// filled slot?
            {
              yield yield ['take', t];	// take out
              yield ['AGAIN take', 0];	// reset backoff
	      had = true;
            }
        }
    } catch (e) {
      console.error('TAKE', e);
      yield yield ['act ERROR', e];
    }
    yield ['OPEN'];			// close r
    yield yield ['wait', 10];
    yield yield [ok];
  }

if (!_.length)
  return ['note TAKE done', yield ['AGAIN take']];
if (had)
  return ['in 10 take', _];

