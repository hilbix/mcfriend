// validsign sign by moving to the sign
//
// Returns the sign if valid, else nothing

this.invalid ??= {};

if (validSign(_[0]))
  return _[0];

const s	= _[0];
const known = invalid[`${s}`];

if (!known)
  yield ['act checking', s];

const t = yield ['SPOT', 5, s];
if (t !== false)
  yield ['tp', t ?? s];
yield ['wait', 30];

const b = yield ['sign', s];
if (!b.valid)
  {
    if (!known)
      yield ['act', s, 'not valid'];
    invalid[`${s}`] = true;
    return; // 'sign is not valid';
  }

//const x=toJ(s.full);
//const y=toJ(b.full);
//if (x !== y)
//  throw `sign has changed!?! ${x} != ${y}`;


return b;

