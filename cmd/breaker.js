// breaker breaks around the sign.
//
// breaker3 is the sign to break 3 high
// breaker is the sign to break everything around of the sign (except blocks around the sign)

const signs = yield ['sign breaker', _];
if (!signs) return ['act missing breaker signs'];

let ok = false;
for (const _ of signs)
  {
    yield yield ['act breaker', `${_}`];
    const q = yield ['SPIRAL', _];		// check the sign
    if (!q) continue;
    try {
      ok |= yield ['DIGGER', q, _.text[3]];
    } catch (e) {
      console.error('ERR', e);
    } finally {
      console.error('END');
      await q.end();
      console.error('ENDED');
    }
  }

if (ok && !_.length)
  yield [ 'in 1 breaker' ];

