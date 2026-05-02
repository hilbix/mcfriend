// getsome items..
//
// returns the first item found (or fetched)

//const i = _.map(_ => isString(_) ? (yield ['item', _]) : _);

for (const item of _)
  if (yield ['have', item])
    return item;

yield ['home'];

if ((yield ['free']).length <= 2)
  yield ['put'];

for (const item of _)
  {
    yield [`get ${item.id}=${item.max}`];
    if (yield ['have', item])
      return item;
  }

for (const item of _)
  {
    yield yield ['CraftItem', item, 1];
    yield ['wait'];
    if (yield ['have', item])
      return item;
  }

