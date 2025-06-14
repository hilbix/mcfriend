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
//      mix	= home;
      break;

    case 'overworld':
      mix	= torch;
      end	= home;
      break;
  }

const s = yield ['sign attack'];

yield yield ['PUT'];

for (let cnt=0;; cnt++)
  {
//    if (!(yield ['have *sword']))
    if (!(yield ['have torch']))
      {
        yield yield ['drop'];
        yield yield ['home'];
        yield yield ['supply'];
        (yield ['have *sword']) || (yield yield ['CRAFT stone_sword']);
      }
    const x = yield ['Attack', _];
    if (x !== void 0)
      {
        yield* end();
        yield ['note ATTACK done', cnt, x];
        const g = s?.pop();
        if (!g) break;
        yield ['Move', g];
        yield ['wait 100'];
        continue;
      }
    yield ['wait'];
    yield yield* mix();
  }

