//

try {
  const r = yield ['CRAFT', _];
  if (r) return ['act craft ok', r, _];
} catch(e) {
  return ['act craft fail', e];
}
if (!_.length)
  yield ['in 50 craft'];
return ['act craft end', _];

