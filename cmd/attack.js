//

//yield ['act ATTACK start'];

function* torch(type)
{
  yield yield ['torch', type === 'slime' ? 'jungle_button' : void 0];
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
    if (!(yield ['have torch']) || !(yield ['have jungle_button']))
      {
        yield yield ['drop'];
        yield yield ['home'];
        yield yield ['supply'];
      }
    (yield ['have *sword']) || (yield yield ['CRAFT stone_sword']);

    const x = yield ['Attack', _];
    if (Array.isArray(x))
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
    yield yield* mix(x);
  }

