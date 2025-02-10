// Suppply BOT with certain standard items
//
// [item=count...] like 'get item=count', but if only fetches until count is reached

if (!_.length)
  _	= '*_sword=1 *_axe=1 torch=64'.split(' ');

for (const x of _)
  {
    const [t,c]	= x.split('=');
    const n = (c|0) || 1;

    for (const x of yield ['item', t])
      {
        const h = yield ['have', t];
        if (h >= n) break;
        yield yield [`get ${x.id}=${n-h}`]
      }
  }

