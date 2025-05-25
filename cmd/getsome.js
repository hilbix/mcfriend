// getsome items..
//
// returns the first item found (or fetched)

for (const item of _)
  if (yield ['have', item])
    return item;

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

