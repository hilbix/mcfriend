#!/usr/bin/env nodejs
'use strict';
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

// imports

const fs = require('fs');

// 'chat message messagestr'	// last ist best
globalThis.DEBUG	= 'goal_updated path_reset' //'blockUpdate' //'entityGone entityDead blockUpdate itemDrop'
'login spawn end kicked error whisper'

// CONFIG

globalThis.FLW = [];
globalThis.D = (..._) => { FLW.push(_); if (FLW.length>40) FLW.shift() };
globalThis.DD = (..._) => { console.log(_); D(..._) }

module.exports =
  { NAME	: process.argv[6] || process.argv[1].split('/').pop().split('.').shift()
  , WEBPORT	: (process.argv[2]||0) || 8080
  , PORT	: (process.argv[3]|0) || 25565
  , HOST	: process.argv[4] || '127.0.0.1'
  , WEBHOST	: process.argv[5] || '127.0.0.1'
  };

//
// MiniLib
//

globalThis.THROW	= (_,...a) =>
  {
    console.error(_, ...a);
    const x = [];
    while (a.length)
      x.push(_.shift(), a.shift());
    x.push(_.shift());
    if (_.length) throw `WTF? ${x} ${_}`;
    console.error(...x);
    throw x.join(' ');
  };
globalThis.fsCB	= (fn,a,b) =>	// FS promises (my Node is too old)
  {
    const f = fs[fn];
    if (!f) throw `huh? ${fn}`;
    a ??= [];
    b ??= [];
    return (..._) => new Promise((o,k) => f.call(fs, ...a, ..._, ...b, (e,_) => e ? k(e) : o(_)));
  };
globalThis.Read	= fsCB('readFile', [], ['utf8']);
globalThis.Write	= fsCB('writeFile');
globalThis.Rename	= fsCB('rename');

globalThis.isFunction= _ => 'function' === typeof _;
globalThis.isArray	= Array.isArray;
globalThis.isObject	= o => typeof o === 'object' && (Object.getPrototypeOf(o || 0) || Object.prototype) === Object.prototype;
globalThis.isObjectOrNull = _ => isObject(_ ?? {});
globalThis.isObjectOrFalse = _ => isObject(_ || {});
globalThis.isString	= _ => 'string' === typeof _;

globalThis.map_get	= (m,k,fn,...a) => { if (m.has(k)) return m.get(k); const v=fn(...a); m.set(k,v); return v }

globalThis.NOP	= () => void 0;
globalThis.fromJ	= JSON.parse;
globalThis.toJ	= JSON.stringify;
globalThis.OB	= (..._) => Object.assign(Object.create(null), ..._);	// Object without prototype
globalThis.PO	= (..._) =>
  {	// Promise Object: ._ = args; _.p = Promise; _.o = ok (for return); _.k = ko (for error)
    const r = {};
    if (_.length) r._ = _;
    r.p	= new Promise((o,k) => { r.o=o; r.k=k });
    return r;
  };
globalThis.Sleep	= _ => new Promise(o => setTimeout(o, _));
globalThis.Relax	= _ => Sleep().then(_);
globalThis.mkArr	= _ => Array.isArray(_) ? _ : [_];
globalThis.mkMatch	= _ => _.length && Object.fromEntries(_.map(_ => [_,true]));
globalThis.allKeys	= _ =>
  {
    const ret = new Set();
    do
      {
        Object.getOwnPropertyNames(_).forEach(_ => ret.add(_));
      } while ((_ = Object.getPrototypeOf(_)) && _ !== Object.prototype);
    return ret;
  };

// Create a named logger function which only shows lines once according to the first arg.
// log = LogOnce('something');
// log('this', argscountshown..);	// same as log(['this'], argscountshown..)
// log(['that','some', 'string'], argscountshown..);
// log(['this'], argscountnotshown..);	// suppressed, as 'this' already was the first arg
// log('that', argscountnotshown..);	// suppressed, as 'that' was the first array entry of the first arg
// log('some', argscountshown..);	// not suppressed, as 'some' was never the first entry yet (it was the second of the array)
// log([[]], ..);			// undefined behavior
globalThis.LogOnce	= name =>
  {
    const was = new Set();
    return (..._) =>
      {
        const s = mkArr(_[0]);
        if (was.has(s[0])) return _;
        was.add(s[0]);
        const x = s.join(' ');
        console.log(name, x, _.length-1);
        D('Log', name, x);
        return _;
      }
  };

// Wrap a function such, that we can change the arguments with some callback
// cb(...a) { return a }	// must return array of arguments to apply
globalThis.Wrap	= (ob,fn,cb) =>
  {
    const orig = ob[fn];
    const FPA = Function.prototype.apply;
    ob[fn] = function (...a) { return FPA.call(orig, this, cb(...a)) }
    return ob;
  };

globalThis.Enum = (..._) =>			// Enum('a','b','c').c === 3
  {
    const c = class {};
    _.forEach((_,i) => c[_] = i+1);
    return c;
  };
globalThis.Symbols = (..._) =>		// like Enum
  {
    const c = class {};
    _.forEach((_,i) => c[_] = Symbol(_));
    return c;
  };

globalThis.RunQueue = class RunQueue
  {
  constructor()
    {
      this._	= [];
      this._p	= void 0;
    }
  _signal() { const p = this._p; this._p = void 0; p?.o() }
  add(name, ..._)	{ return this._add(name, _) }
  _add(name, _)
    {
      D('Qadd', name, _);
//      console.log('A', name, _.length);
      this._.push([name, _]);
      this._signal();
      return this;
    }
  Q(name)
    {
      const f = (..._) => { this._add(name, _); return f };
      return f;
    }
  async Run(r, prefix)
    {
      prefix	??= '';
      const l	= LogOnce(`Q${prefix}`);

      while (r.OK())
        {
          if (!this._.length)
            {
//              console.log('Run', prefix, this._.length);
              this._p ??= PO();
//              console.log('P', this._p);
              D('Q', 'wait');
              await this._p.p;
              D('Q', 'cont');
              continue;
            }
          const [t,a] = this._.shift();
//          console.log('Run', prefix, this._.length, t, a.length);
          D('Q', 'got', t, a);
          try {
            const f = `${prefix}${t}`;
            const x = await Relax(() => r[f](...a));
            D('Q', 'ran', t, a, x);
//            console.log('RunOK', f, x);
          } catch (e) {
            D('Q', 'err', t, a, e);
            l([`${t} ERR:`, `${e}`], ...a);
          }
        }
      D('Q', 'bye');
//      console.log('Run(end)');
    }
  };

globalThis.AsyncQueue = class AsyncQueue
  {
  constructor(start, stop)
    {
      this._	= void 0;
      this._a	= start;
      this._b	= stop;
      this.cnt	= 0;
    }
  add(fn, ...a)
    {
      if (!this._)
        {
          this._	= Promise.resolve();
          this._a();
        }
      this.cnt++;
      const p = this._ = this._.then(() => new Promise(_ => setTimeout(_))).then(() => fn(...a));
      p.finally(() => { if (!(--this.cnt % 1000)) console.log(this.cnt, this._ === p); if (this._ === p) { this._ = void 0; this._b() } });
      return this;
    }
  };

globalThis.T = {add:_=>_};	// XXX REMOVE XXX workaround for a marker that here is something to do for now

