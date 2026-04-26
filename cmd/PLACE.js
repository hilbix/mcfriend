// Place a block
//
// This (ab)uses low level Mineflayer internals to do it right.
//
// yield ['PLACE', item, dest, ref]
//
// item=	item name, will be fetched if not in inv
// dest=	position where to put item
// ref=		reference (first letter, lowercase)
//		either block or North West East South Up Down (default: d)
//
// More options possibly follow

const nothing = () => {};

// compare onceWithCleanup() in node_modules/mineflayer/lib/promise_utils.js
function ev(ev, check, timeout)
{
  //console.error('EV', ev, check, timeout);
  let x;
  const p	= new Promise((o,k) => x = {o,k:_ => { console.error('cancel', _); k(_) }});

  const on = (..._) =>
    {
      try {
//        console.error('ON', _);
        const r = check(..._);
//        console.error('ON:', r);
        if (r) x.o(r);
      } catch (e) {
        console.error(e);
        x.k(e);
      }
    };

  const timeoutError = new Error(`Event ${ev} did not fire within timeout of ${timeout}ms`)
  sleep(timeout).then(() => x.k(timeoutError));

  B.addListener(ev, on);
  p.catch(nothing).finally(() => { x.k=nothing; B.removeListener(ev, on) });
  return p;
}

// Stolen from mineflayer/lib/plugins/place_block.js
// dest		Block to change
// ref		reference point
async function* place_block(dest, ref, p)
{
  const b	= yield ['block', dest];
  const r	= yield ['block', b.pos(ref)];
  const d	= b.sub(r);

  yield ['act PLACE', b, 'onto', r, 'with', ref._vec];

  yield ['TP', p.pos(0,b.sub(p).y+4,0)];
  const e	= ev(`blockUpdate:${b._vec}`, (o,n) => { if (!o || !n || o.type !== n.type) return [o,n] }, 5000);
  await B._genericPlace(r._, d, { swingArm:'right' });
  yield ['TP', p];
  try {
    const [o, n] = await e;
//    yield ['act have', o?.type, n?.type, o?.location, n?.location];
    if (!o && !n) return;
    if (o?.type === n?.type) {
      throw new Error(`No block has been placed : the block is still ${o?.name}`)
    } else {
      B.emit('blockPlaced', o, n)
    }
  } finally {
  }
}

const DIR =
  { w: [-1,  0,  0]
  , e: [ 1,  0,  0]
  , d: [ 0, -1,  0]
  , u: [ 0,  1,  0]
  , n: [ 0,  0, -1]
  , s: [ 0,  0,  1]
  };

function* dir(r, b)
{
  if (isMy(r))
    return r.sub(b);
  const d = DIR[_.shift()];
  if (d)
    return d;
  for (const a of yield ['block', dest, 6])
    if (!isAir(a))
      return a.sub(b);
  return DIR.d;
}

const B		= __ABI__.B;
const item	= yield ['item', _.shift()];
const dest	= yield ['block', _.shift() ];
const ref	= yield ['pos', yield* dir(_.shift(), dest)];

const p		= yield ['pos'];
const i		= yield ['getsome', item];

yield ['equip hand', i.type];
await B.setControlState('sneak', true);
yield ['wait', 1];

const ret	= yield* place_block(dest, ref, p);

await B.setControlState('sneak', false);
//yield ['wait', 10];

return ret;

