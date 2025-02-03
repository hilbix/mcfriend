//	fill chests marked 'put' with inventory items

function* put(item, where)
{
  const c = yield ['CHEST', 'put', where];
  if (!c?.length) return;

  yield ['act',c,c.id];

  yield yield ['Move', c, 1];
  const r = yield ['open', c];

  const h = yield ['have', item];
  try {
    yield ['put', r, item, h];
  } catch (e) {
  }
  yield ['close', r];
  return true;
}

yield ['PUT'];

const a = yield ['CHEST', 'take'];
if (!a?.length) return yield 'nothing to take?';

for (const c of a)
  {
    yield yield ['Move', c, 1];
    const r = yield ['open', c];
    let ok = 1;
    for (const i of r.items())
      {
        if (!i.id) continue;
// solved with:
//	/execute as @a run attribute @s minecraft:generic.luck base set 666
//	/execute as @a if     data entity @s Attributes[{Name:"minecraft:generic.luck",Base:666d}] run tellraw @p [{"selector":"@s"}]
//	/execute as @a unless data entity @s Attributes[{Name:"minecraft:generic.luck",Base:666d}] run tellraw @p [{"selector":"@s"},"=",{"entity":"@s","nbt":"Attributes[{Name:'minecraft:generic.luck'}].Base"}]
//        if (i.id.startsWith('wooden_') || i.id === 'stick') continue;	// safty issue, as wooden_* and sticks have other meaning at my server
        try {
          yield yield ['take', r, i, i.count];
        } catch (e) {
          yield yield ['close', r];
          yield yield ['act ERROR', e];
          yield yield ['PUT'];
          ok = 0;
          break;
        }
      }
    if (ok)
      yield ['close', r];
  }

yield ['act TAKE done'];

