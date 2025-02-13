// equip an axe

const isAxe = _ => _?.id?.endsWith('_axe');

if (isAxe(yield ['hand'])) return;

for (let wtf;; wtf=true)
  {
    const w = Array.from(yield ['invs']).filter(isAxe);
    if (w.length)
      return ['equip hand', w[0]];
    if (wtf)
      throw 'missing axe';
    yield ['supply'];
  }

