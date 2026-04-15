// Place a block
//
// This (ab)uses low level Mineflayer internals to do it right
//
// yield ['PLACE', dest, dir, opt..]
//
// dest=	block to put
// ref=		reference to click on (defines block rotation)
//
// More options possibly follow

// Stolen from mineflayer/lib/plugins/place_block.js

function onceWithCleanup (emitter, event, { timeout = 0, checkCondition = undefined } = {}) {
  const task = createTask()

  const onEvent = (...data) => {
    if (typeof checkCondition === 'function' && !checkCondition(...data)) {
      return
    }

    task.finish(data)
  }

  bot.addListener(event, onEvent)

  if (typeof timeout === 'number' && timeout > 0) {
    // For some reason, the call stack gets lost if we don't create the error outside of the .then call
    const timeoutError = new Error(`Event ${event} did not fire within timeout of ${timeout}ms`)
    sleep(timeout).then(() => {
      if (!task.done) {
        task.cancel(timeoutError)
      }
    })
  }

  task.promise.catch(() => {}).finally(() => emitter.removeListener(event, onEvent))

  return task.promise
}

function ev(B, ev, check, timeout)
{
  let x;
  x.p	= new Promise((o,k) => x = {o,k});

  const on = (..._) =>
    {
      const r = check(..._);
      if (r) x.o(r);
    };

  B.addListener(ev, on);
  x.p.finally(() => B.removeListener(ev, on));

  sleep(timeout).then(x.k);
  return x.p;
}

async function await_block(bot, dest, oldBlock)
{
  let newBlock = bot.blockAt(dest)
  if (oldBlock.type === newBlock.type)
    [oldBlock, newBlock] = await ev(bot, `blockUpdate:${dest}`, (o,n) => { if (!o || !n || o.type !== n.type) return [o,n] });

  // blockUpdate emits (null, null) when the world unloads
  if (!oldBlock && !newBlock) {
    return
  }
  if (oldBlock?.type === newBlock.type) {
    throw new Error(`No block has been placed : the block is still ${oldBlock?.name}`)
  } else {
    bot.emit('blockPlaced', oldBlock, newBlock)
  }
}

const B		= __ABI__.B;
const dest	= _.shift();
const ref	= _.shift();
//const opt	= _.reduce((a,_) => Object.entries(_).reduce((a,[k,v]) => { a[k]=v; return a }, a), {});

const before	= yield ['block', dest];
const delta	= dest.sub(isMy(ref) ? (yield ['locate', ref]) : ref)._vec;

await B._genericPlace(ref, delta, { delta, swingArm:'right' });
await await_block(B, dest, before);

