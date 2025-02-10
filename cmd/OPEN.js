// Open a box
//
// If nothing to open, then everything is closed again

this.open ??= void 0;
this.last ??= void 0;

const box = _[0];
const pos = box && (yield ['locate', box])?.id;

if (pos === last && open) return open;

try {
  if (open)
    yield yield ['close', open];
} catch (e) { console.error(e) }

open = void 0;
last = pos;

if (!box) return;

const dist = yield ['dist', box];
if (dist > 3)
  yield yield ['TP', box];


for (let i=10; --i>=0; )
  try {
    yield yield ['wait'];
    return open = yield ['open', _];
  } catch (e) {
    yield ['act open', e];
    console.error('open fail', _);
  }

console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
