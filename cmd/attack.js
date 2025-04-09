//

//yield ['act ATTACK start'];

function* torch()
{
  yield yield ['torch'];
  yield ['wait',2];
}

function* home()
{
  yield yield ['home'];
}

let mix = function*(){};
let end = mix;

switch (dimension)
  {
    case 'the_nether':
      end	= home;
      mix	= home;
      break;

    case 'overworld':
      mix	= torch;
      break;
  }

yield yield ['PUT'];

for (let cnt=0;; cnt++)
  {
    if (!(yield ['have *sword']))
      {
        yield yield ['drop'];
        yield yield ['supply'];
        yield (yield ['have *sword']) || (yield ['CRAFT stone_sword']);
      }
    const x = yield ['Attack', _];
    if (x !== void 0)
      {
        yield* end();
        return ['act ATTACK done', cnt, x];
      }
    yield ['wait'];
    yield yield* mix();
  }

