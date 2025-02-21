// equip a tool
//
// If tool is missing, try to craft the stone variant of it

const tool = _[0];

const isTool = _ => _?.id?.endsWith(`_${tool}`);

if (isTool(yield ['hand'])) return;	// Tool already handy

for (let retry=2;; retry--)
  {
    const w = Array.from(yield ['invs']).filter(isTool);
    if (w.length)
      return yield ['equip hand', w[0]];	// Equip tool already in inventory
    if (wtf<0)
      break;
    yield ['supply', `stone_${tool}`];
  }

throw `missing ${tool}`;
