// Place a block
//
// This (ab)uses low level Mineflayer internals to do it right
//
// yield ['PLACE', item, dest, ref, orient]
//
// item=	item name, will be fetched if not in inv
// dest=	position to put
// ref=		block to click on to place (default: block below dest)
// orient=	orientation (default: from ref)
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
        console.error('ON', _);
        const r = check(..._);
        console.error('ON:', r);
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
// ref		Block to put things on
// ori		Block/Pos etc. or Vec3 for facing
async function* place_block(dest, ref, ori)
{
  const b	= yield ['block', dest];
  const r	= yield ['block', ref];
  const delta	= b.sub(r);
  delta.x	= 0.5 + delta.x * 0.5;
  delta.y	= 0.5 + delta.y * 0.5;
  delta.z	= 0.5 + delta.z * 0.5;
  if (delta.y === 0.5) delta.y = 0.25;	// lower half
  yield ['act placing', b, 'onto', r, 'facing', ori, 'with', delta];

  const e	= ev(`blockUpdate:${b._vec}`, (o,n) => { if (!o || !n || o.type !== n.type) return [o,n] }, 5000);
  await B._genericPlace(r._, ori, { delta, swingArm:'right' });
  const [o, n] = await e;

  yield ['act have', o?.type, n?.type, o?.location, n?.location];
  if (!o && !n) return;
  if (o?.type === n?.type) {
    throw new Error(`No block has been placed : the block is still ${o?.name}`)
  } else {
    B.emit('blockPlaced', o, n)
  }
}

const B		= __ABI__.B;
const item	= yield ['item', _.shift()];
const dest	= yield ['block', _.shift() ]
const ref	= yield ['block', _.shift() ?? dest.pos(0,-1,0) ]
const ori	= _.shift() ?? ref;
//const opt	= _.reduce((a,_) => Object.entries(_).reduce((a,[k,v]) => { a[k]=v; return a }, a), {});

const p		= yield ['pos'];
const i		= yield ['getsome', item];
yield ['TP', p];

yield ['equip hand', i.type];
await B.setControlState('sneak', true);
yield ['wait', 10];

yield* place_block(dest, ref, isMy(ori) ? ori.sub(dest) : ori);

await B.setControlState('sneak', false);
yield ['wait', 10];

