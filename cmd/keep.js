// test 'KEEP.js'

yield yield ['home'];

const area = yield ['AREA keep'];
if (area?.length !== 1)
  return yield ['act WTF keep-area', area];

const keep	= area.shift();

yield* check_area();

async function* check_area()
{
  const x = yield ['block', keep.map(_ => _.pos(0,-1,0))];
  for await (const b of x())
    {
      ;
    }
}

