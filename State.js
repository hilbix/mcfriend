'use strict';
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.
//
// Load and keep the state
//

function Tracked(change, ...init)
{
  let lock, dirt;
  const _ = OB(...init);
  const __ = OB();
  Object.entries(([k,v]) => __[k] = toJ(v));
  const call = async () => change(_);
  const upd = () =>
    {
      if (lock || !dirt) return;
      dirt = 0;
      lock = 1;
      call().finally(() => upd(lock=0));
    }
  return new Proxy(_,
    { get(o,k)		{ return o[k] }
    , set(o,k,v)	{ const j = toJ(v); if (__[k] === j) return true; __[k]=j; _[k]=v; upd(dirt=1); return true }
    });
}

async function State(name)
  {
    let  dirt, run, out;
    const tmp	= `${name}.tmp.json`;
    const dat	= `${name}.state.json`;
    const retry	= () => Sleep(1000).then(save);		// if write fails, it is retried each second until it succeeds
    const save	= () =>
      {
        //console.warn('save dirt', dirt !== false);
        if (!dirt) return;
        //console.warn(dirt);
        run ||=
          Write(tmp, out=dirt)
            .then(() => Rename(tmp, dat))
            .then(() => { if (out === dirt) dirt=false; console.log('saved', dat) }, ERR`write ${dat}`)
            .finally(() => run=false)
            .then(retry, retry);
        return run;
      }
    State.saves.push(save);
    const _	= await Read(dat).then(fromJ).catch(_ => ERR`read ${dat}`(_)) || (fromJ(dirt='{}'));
    for (const x of ['IGNORE','op'])
      if (!(x in _))
        _[x] = {};
    await save();

    return Tracked(_ => retry(dirt=toJ(_)), _);
  };
State.saves	= [];
State.save	= () => Promise.allSettled(State.saves.map(_ => _())).then(_ => _.filter(_ => _.status === 'rejected'));

module.exports=State;

