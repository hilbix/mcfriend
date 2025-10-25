// breaker breaks around the sign.
//
// breaker3 is the sign to break 3 high
// breaker is the sign to break everything around of the sign (except blocks around the sign)

const signs = yield ['sign breaker3'];
if (!signs) return ['act missing breaker signs'];

for (const _ of signs)
  {
    yield yield ['act breaker', _.text[2]];
    const [iter, ok] = yield ['SPIRAL', _, 3];	// check the sign
    yield yield ['DIGGER', iter, ok, _.text[3]];
  }

