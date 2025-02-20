//	check which items to keep (not ready yet)


this.keep ??= {};

for (const i of _)
  {
    const id	= i.id;
    if (!id)		continue;	// nothing is not valid

    console.error(keep[id]);
    const k	= keep[id]	??= ((yield [`set item:${id}:keep`]) ?? false);
    const h	= (yield ['have', id])|0;
    return k;
  }

