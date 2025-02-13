// Suppply BOT with certain standard items
//
// [item=count...] like 'get item=count', but if only fetches until count is reached

if (!_.length)
  _	= '*_sword *_axe torch=64'.split(' ');

for (const x of _)
  {
    const [t,c]	= x.split('=');
    const n = (c|0) || 1;

    for (const x of yield ['item', t])
      {
        const h = yield ['have', t];
        if (h >= n) break;
        const d = n-h + n/2;
        yield yield [`get ${x.id}=${d|0}`]
      }
  }

