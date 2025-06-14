// Open a box
//
// If nothing to open, then everything is closed again

this.open ??= void 0;
this.last ??= void 0;

const box = _[0];

if (box === last && open) return open;

try {
  if (open)
    yield yield ['close', open];
} catch (e) { console.error(e) }

open = void 0;
last = void 0;

if (!box) return;

yield ['Move', box, 3];

for (let i=10; --i>=0; )
  try {
    yield yield ['wait'];
    open = yield ['open', _];
    last = box;
    return open;
  } catch (e) {
    yield ['verbose open', e];
    console.error('open fail', _);
  }

yield ['note OPEN FAILED', _];

console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
console.error('OPEN FAILED', _);
