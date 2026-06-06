// Place a double chest with a sign
// with bot placed at the given position.
//
// TP to the middle position where to place it in front of the bot
// then call this with the direction x=-2 .. 2 (0 is same as +2)

const p = yield ['pos'];
yield ['act DC pos', p];

function get(_)
{
  const a = _|0;
  switch (a)
    {
    case -1:
    case +1: return [void 0,a];
    default:
    case +2: return [1];
    case -2: return [-1];
    }
 }

const [x,y] = get(_.shift());

try {
  for (let z=0; p.y+z<319; z++)
    {
      const p0	= yield ['block', p.pos(  x??y        , z, -(y??-x))];
      const p1	= yield ['block', p.pos(x==void 0 && y, z, y==void 0 && x)];
      const p2	= yield ['block', p.pos(-(x??-y)      , z,   y??x)];
      const c	= yield ['chesty', p1, p2];

//yield ['act 0', toJ({x,y}), p0];
//yield ['act 1', c[0], p1];
//yield ['act 2', c[1], p2];

      BUG('DC a', c);
      if (c[0] === 'R' && c[1] === 'L')
        {
          if (isSign(p0))
            continue;	// sign placed and chests (probably) OK

          if (isAir(p0))
            return yield ['PLACE', 'jungle_sign', p0, p1];
          yield ['BREAKER', p0];
          break;
        }

      // make tabula rasa if sign position alread filled
      if (!isAir(p0))
        {
          yield ['BREAKER', p0, p1, p2];
          break;
        }

      // we now either AIR P1 P2 where P1 and P2 are
      // either air or something which is wrongly placed

      if (isAir(p1))
        yield ['PLACE chest', p1];	// Place P1 onto P2
      else
        {
          yield ['BREAKER', p1];	// wrongly placed
          break;
        }
      if (isAir(p2))
        yield ['PLACE chest', p2, p1];	// Place P2 onto P1
      else
        yield ['BREAKER', p2];		// wrongly placed

      break;
    }

//  yield ['act ok'];
} catch(e) {
  console.error(e);
  yield ['act ERR', `${e}`];
}

