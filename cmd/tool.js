// equip a tool

const tool = _[0];

const isTool = _ => _?.id?.endsWith(`_${tool}`);

if (isTool(yield ['hand'])) return;

for (let wtf;; wtf=true)
  {
    const w = Array.from(yield ['invs']).filter(isTool);
    if (w.length)
      return ['equip hand', w[0]];
    if (wtf)
      throw `missing ${tool}`;
    yield ['supply', `*_${tool}`];
  }

