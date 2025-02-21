// x,y,z delta: move to location
// TODO: implement a working pathfinder (mineflayer-pathfinder has issues)

return yield ['TP', _];


// Er hängt im arrive anscheinend (so genau bin ich mir da nicht sicher)

const act = (...a) => _[2] === null ? void 0 : a;

const d = yield ['dist', _];
if (d<2) return act('act already there!');

// XXX TODO XXX !FOLLOWING SHOULD BE REPLACED!
if (_[2] !== null)
  yield act('act moving', Math.ceil(d), 'to', _);

try {
  yield yield ['move', _];
  yield yield ['arrive'];
} catch (e) {
  yield `OOPS: ${e}`;
  console.error(e);
}

const t = yield ['dist', _];
if (t<=1+(_[1]|0))
  return act('act arrived at',_)

yield act('act distance', ((t*10)|0)/10, 'teleporting to', _);
yield ['tp', _];
return ['weit 20'];

