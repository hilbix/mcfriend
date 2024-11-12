#!/usr/bin/env nodejs
'use strict';

// 'chat message messagestr'	// last ist best
const DEBUG	= 'goal_reached goal_updated path_reset path_stop' //'blockUpdate' //'entityGone entityDead blockUpdate itemDrop'
'login spawn end kicked error whisper'

// CONFIG

const NAME = process.argv[1].split('/').pop().split('.').shift();
const WEBPORT = (process.argv[2]||0) || 8080;
const PORT = (process.argv[3]|0) || 25565;
const HOST = process.argv[4] ?? '127.0.0.1';
const WEBHOST = process.argv[5] ?? '127.0.0.1';

// requires

const fs = require('fs');
const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer
const v3 = require('vec3');
const pathfinder = require('mineflayer-pathfinder');
const DELAYED = Promise.all(['mineflayer-auto-eat'].map(_ => import(_)));	// require() does not work with those


//
// MiniLib
//

const fsCB	= (fn,a,b) =>	// FS promises (my Node is too old)
  {
    const f = fs[fn];
    if (!f) throw `huh? ${fn}`;
    a ??= [];
    b ??= [];
    return (..._) => new Promise((o,k) => f.call(fs, ...a, ..._, ...b, (e,_) => e ? k(e) : o(_)));
  }
const Read	= fsCB('readFile', [], ['utf8']);
const Write	= fsCB('writeFile');
const Rename	= fsCB('rename');

const isFunction= _ => 'function' === typeof _;
const isArray	= Array.isArray;
const isObject	= o => typeof o === 'object' && (Object.getPrototypeOf(o || 0) || Object.prototype) === Object.prototype;
const isObjectOrNull = _ => isObject(_ ?? {});
const isObjectOrFalse = _ => isObject(_ || {});
const isString	= _ => 'string' === typeof _;

const NOP	= () => void 0;
const fromJ	= JSON.parse;
const toJ	= JSON.stringify;
const OB	= (..._) => Object.assign(Object.create(null), ..._);	// Object without prototype
const PO	= (..._) =>
  {	// Promise Object: ._ = args; _.p = Promise; _.o = ok (for return); _.k = ko (for error)
    const r = {_};
    r.p	= new Promise((o,k) => { r.o=o; r.k=k });
    return r;
  };
const Sleep	= _ => new Promise(o => setTimeout(o, _));
const mkArr	= _ => Array.isArray(_) ? _ : [_];
const mkMatch	= _ => _.length && Object.fromEntries(_.map(_ => [_,true]));
const allKeys	= _ =>
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
const LogOnce	= name =>
  {
    const was = new Set();
    return (..._) =>
      {
        const s = mkArr(_[0]);
        if (was.has(s[0])) return _;
        was.add(s[0]);
        console.log(name, s.join(' '), _.length-1);
        return _;
      }
  };

// Wrap a function such, that we can change the arguments with some callback
// cb(...a) { return a }	// must return array of arguments to apply
const Wrap	= (ob,fn,cb) =>
  {
    const orig = ob[fn];
    const FPA = Function.prototype.apply;
    ob[fn] = function (...a) { return FPA.call(orig, this, cb(...a)) }
    return ob;
  };

class RunQueue
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
              await this._p.p;
              continue;
            }
          const [t,a] = this._.shift();
//          console.log('Run', prefix, this._.length, t, a.length);
          try {
            const f = `${prefix}${t}`;
            const x = await r[f](...a);
//            console.log('RunOK', f, x);
          } catch (e) {
            l([`${t} ERR:`, `${e}`], ...a);
          }
        }
//      console.log('Run(end)');
    }
  };

class AsyncQueue
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

//
// Globals
//

let	RUN, state;	// RUN: There can be only one bot runner
const	Q = new RunQueue();

const IGN = _ => state.IGNORE[_.name]|state.IGNORE[_.displayName];

// Bot called B
const B = mineflayer.createBot({ host:'127.0.0.1', port:PORT, username:NAME, hideErrors:false });
Wrap(B, 'emit',  LogOnce('emit'));	// DEBUG to see what emit() are available

//B.settings.enableServerListing = false;	// does not work


//
// miniBotLib
//

const Chat = (...s) => { const _ = s.map(_ => `${_}`).join(' '); console.log('SAY:', _); return B.chat?.(_) };		// it may happen too early
const ERR = _ => (...e) => { console.error(...e); Chat('E', _, ...e) }

const isBed	= _ => B.isABed(_);
const isSign	= _ => _?.name.endsWith('_sign');
const isTree	= _ => _?.name.endsWith('_log');
const isDirt	= _ => _?.name.endsWith('dirt');

const BOO = _ => _===true ? 'Y' : _===false ? 'N' : `${_}`;
const POS = _ => _ && `${_.x|0},${_.y|0},${_.z|0}`;
const a2v = _ => _?.length === 3 && v3(...(_.map(parseFloat)));
const p2v = _ => _ && a2v(_.split(','));

const ENTITY = _ =>
  {
    let item = '';
    if (_.displayName === 'Item')
      {
        const m = _.metadata[8];
        item = `${m.itemCount}:${m.itemId} ${toJ(B.mcData.items[m.itemId].displayName)}`;
      }
    return `${POS(_.position)} ${_.entityType} ${_.displayName} ${item}`;
  };

const DUMP = (_,d) =>
  d <= 0 ? '...' :
  Array.isArray(_) ? `[${_.map(_ => DUMP(_,d-1)).join(',')}]` :
  _ && 'object' === typeof _ ? `{${Object.keys(_).map(k => `${toJ(k)}:${DUMP(_[k],d-1)}`).join(',')}}` :
  toJ(_);

const goNear = async (_,max=4) =>
  {
    if (B.entity.position.distanceTo(_) <= max) return;
    const goal = new pathfinder.goals.GoalNear(_.x, _.y, _.z, max);
    return B.pathfinder.setGoal(goal, true);
//    return B.pathfinder.goto(goal);
  };

const MESS = _ =>
  {
    const r = [];
    const run = _ =>
      {
        if (_ === void 0) return;
        //console.warn('M', DUMP(_, 1));
        if (isArray(_))
          {
            for (const x of _)
              {
                run(x);
                r.push(' ');
              }
            return;
          }
        if ('object' === typeof _)
          {
            r.push(_.translate);
            if (_.json) return run(_.json);
            if (_.with) return run(_.with);

            r.push(_['']);
            r.push(_.text);
            return run(_.extra);
          }
        console.error('WTF M', typeof _, _);
      }
    run(_);
    return r.join('');
  }

/*
      const extract = (a,_) =>	// yes, this is a bit weird
        {
          if (_ === void 0) return a;
          //console.warn('EXT', _, typeof _);
          if (isArray(_))
            for (const x of _)
              extract(a,x);
          if (_.json)
            return extract(a,_.json);
          if ('object' !== typeof _)
            {
              a.push(_);
              return a;
            }
          if ('translate' in _)
            return extract([_.translate], _.with);
          if ('' in _)
            a.push(_['']);
          if ('text' in _)
            {
              if (_.text === '')
                return extract(a,_.extra);
              a.push(extract([_.text], _.extra));
            }
          return a;
        }
*/

// Try to convert a _.json Minecraft Object into some usable object
const MJ = j =>
  {
    if (!j?.json)
      throw `no Minecraft JSON object: ${toJ(j)}`;

    const arr = _ =>
      {
        if (!isArray(_))
          throw `Minecraft JSON object bug, not array: ${toJ(_)}`;
        return _.filter(_ => !('' in _)).map(parse);
      };
    const obj = _ =>
      {
        if (!isArray(_))
          throw `Minecraft JSON object bug, not object: ${toJ(_)}`;
        //console.log('OBJ+', _.length);
        const o = {};	// or OB() ?
        for (const x of _)
          {
            //console.warn('OBJ', x);
            if (('' in x) && Object.keys(x).join('')==='' && x['']==='}' && x === _[_.length-1]) continue;
            if (x.text !== '')
              throw `Minecraft JSON object bug, nonempty text: ${toJ(x)}`;
            if (!isArray(x.extra))
              throw `Minecraft JSON object bug, no array extra: ${toJ(x.extra)}`;
            if (!( x.extra.length === 4 || (x.extra.length === 6 && x.extra[4]?.[''] === ',' && x.extra[5]?.[''] === ' ') )
                || x.extra[1]?.[''] !== ':'
                || x.extra[2]?.[''] !== ' '
               )
              throw `Minecraft JSON object bug, invalid extra ${x.extra.length}: ${toJ(x.extra)}`;
            const k = parse(x.extra[0]);
            const v = parse(x.extra[3]);
            o[k] = v;
          }
        //console.log('OBJ-', _.length);
        return o;
      };
    const str = _ =>
      {
        if (!isArray(_))
          throw `Minecraft JSON object bug, not string: ${toJ(_)}`;
        const s = [];
        for (const x of _)
          {
            if (('' in x) && Object.keys(x).join('')==='' && x['']==='"' && x === _[_.length-1]) continue;
            s.push(x.text);
            if (x.extra)
              s.push(str(x.extra))
          }
        return s.join('');
      };
    const val = (s,_) =>	// values are also returned as string, as MC uses somthing like 0.0d for numbers
      {
        //console.warn('VAL', s, _);
        if (_ === void 0) return s;
        if (!isArray(_)) 
          throw `Minecraft JSON object bug, not val: ${toJ(_)}`;
        const r = [s];
        for (const x of _)
          {
            const p = parse(x);
            if (!isString(p))
              throw `Minecraft JSON object bug, not vals: ${toJ(x)}`;
            r.push(p);
          }
        return r.join('');
      };
    const parse = _ =>
      {
        if (_ === void 0) throw `cannot parse Minecraft JSON object: ${toJ(j)}`;
        //console.warn('parse', _);
        if (isString(_))
          return _;
        if (isArray(_))
          return _.map(parse);
        if (('' in _) && Object.keys(_).join('')==='')
          switch (_[''])
            {
            case 'null': return null;	// I do not know if this exists
            case '{}':	return {};
            case '[]':	return [];	// I do not know if this exists
            default:	return _[''];
            }
        if (_.json)
          return parse(_.json);
        if (_.translate)
          return [_.translate].concat(parse(_.with ?? []));
        if (_.text === '[')
          return arr(_.extra);
        if (_.text === '{')
          return obj(_.extra);
        if (_.text === '"')
          return str(_.extra);
        if (_.text === '' && _.extra)
          return parse(_.extra);
        return val(_.text, _.extra);
      };
    return parse(j.json);
  };

//
// Initialize Bot
//
DEBUG.split(' ').forEach(_ => B.on(_, (...a) => console.log('D', _, ...(a.map(_ => DUMP(_, 2))))));

// Put up HTTP access (limited, but it works somehow)
B.once('spawn', () =>
  {
    B.loadPlugin(pathfinder.pathfinder);
    DELAYED.then(_ =>
      {
        _.forEach(_ => B.loadPlugin(_.loader ?? _));
        // forbid low quality and possibly poisonous food
        const bannedFood = Object.values(B.registry.foods).filter(_ => _.effectiveQuality < 10.0 || ['gold', 'suspicious'].some(x => _.name.includes(x))).map(_ => _.name);
        B.autoEat.setOpts(
          { minHunger: 19
          , offhand: true
          , bannedFood
          });
        console.log('asynchronous plugins loaded');
      });

    B.mcData	= require('minecraft-data')(B.version);
    const m = new pathfinder.Movements(B, B.mcData);
    m.canDig = false;
    m.allow1by1towers = false;
    m.allowFreeMotion = true;
    B.pathfinder.setMovements(m);

    Chat(`Web on http://${WEBHOST}:${WEBPORT}/`);
    mineflayerViewer(B,
      { port:WEBPORT
      , host:WEBHOST
      , viewDistance: 20
//      , firstPerson:true	// warning, this is permanent!
      });
  });


//
// Load and keep the state
//

B.once('end', () => { RUN?.stop(); State.save().finally(() => process.exit()) });

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

//
// Runtime Helpers
//

// We want to have the bot implementation at the very end.
// Hence we cannot access the class here, so we need to delay this
function run(klass)
{
  state	= State(NAME);			// No load state on spawn, the last write might be delayed

  // Register all Bot events in Run
  for (const k of allKeys(klass.prototype))
    {
//      console.log('K', k);
      if (!k?.startsWith) continue;
      // B.world.on() seems not to work correctly.
      const on = k.startsWith('TB') ? B : k.startsWith('TW') ? B.world : void 0;	// Luckily we are not in PHP.
      if (!on) continue;
      const q = Q.Q(k.substring(1));
      on.on(k.substring(2), (..._) => { q(..._) });				// make sure the return value is void 0
    }

  // After spawn, the bot needs to boot up again to re-detect the world etc.
  // Hence a new runtime must be spawned each time we connect.
  B.on('spawn', async () =>
    {
      // halt the previous runtime
      RUN?.stop();

//      Write('DATA.json', toJ(DATA));

      // wait for current state to stabilize
      state	= await state;
      if (!state.sign)	state.sign={};
      if (!state._)	state._={};
      await State.save();

      await DELAYED;	// make sure all plugins are loaded

      // Instantiate Bot's runtime for this connection
      const bot	= new klass();

      // This instance probably was replaced by another connection
      Chat('stop', bot.nr, await bot.P);
    });

  // from here everything runs asynchronously
}

// track('event', 'list of bot vars')
// increments event counter
// displays changes in the 'list of bot vars'
const track = (_=>_())(() =>
  {
    const count = OB(), track = OB();
    return (emit, states) =>
      {
        const c = count[emit] = (count[emit]|0)+1;
        const s = states.split(' ').map(_ => B[_]);
        const o = track[emit];
        if ((track[emit] = toJ(s)) === o) return s;
        count[emit]	= 0;
        console.log(emit, states, s, c);
        return s;
      };
  });


//
// Implementation
//

const Enum = (..._) =>
  {
    const c = class {};
    _.forEach((_,i) => c[_] = i+1);
    return c;
  };

const SETS =
  { sleep: 1
  };

// If these return a Promise (thenable), the next function will not be called until the Promise resolves or throws:
// T	tasks
// TB	bot callbacks
// globals:
// state	then current state (Proxy object automatically keeping state)
class Run extends Enum('ADMIN', 'USER')
  {
  static runcount = 0;

  // .stat staticstics
  inc(..._)
    {
      let s	= this.stat;
      while (_.length)
        s	= (s[_.shift()] ?? OB());
      s._	= (s.val|0) + 1;
      s.__	= (s.inc|0) + 1;
      return this;
    }

  // Constructor
  constructor()
    {
      super();
      this.stat = OB();
      this.digs	= OB();
      this.want = OB();
      RUN?.stop();
      RUN	= this;
      // https://github.com/PrismarineJS/node-minecraft-data/blob/master/doc/api.md
      console.warn('V', B.version);

//      this.data	= require('minecraft-data')(B.version);
      //console.warn('DATA', DUMP(this.data,1));
      this._	= PO(this);
      this.nr	= ++Run.runcount;
      this.tasks= {};

      Q.add('task', 'start');

      this.signs	= OB();
      this.chunks	= new AsyncQueue(() => this.checksigns(1), () => this.checksigns());

//      for (const s of B.inventory.slots) if (s) console.log(s.slot, s.count, s.name);

      // this must come last
      Q.Run(this, 'T');

//      this.time();
    }

  //
  // signs
  //
  // TODO:
  //
  block_scan_start()	// unused
    {
      const p = B.entity.position;
      return this.block_scan(p.x|0, p.y|0, p.z|0);
    }
  // register chunk to scan and scan it asynchronously
  chunk_scan(_)
    {
      const x = _.x|0;
      // y probably 0
      const z = _.z|0;

      if (!this.chunks)
        {
          this.chunks = Promise.resolve();
          Chat('start to scan chunks');
        }
      for (let a=16; --a>=0; )
        {
          this.chunks.add(x =>
            {
              for (let b=16; --b>=0; )
                {
                  const l = z+b;
                  for (let c=320; --c>=-64; )
                    {
                      const v = v3(x, c, l);
                      const d = B.blockAt(v);
                      if (!d?.name.endsWith('_sign')) continue;
                      this.sign(d);
                    }
                }
            }, x+a);
        }
    }
  // check if signs are still present or lost while offline
  checksigns(start)
    {
      if (start) return Chat('chunk scan started');
      Chat('chunk scan ended');
      for (const p of Object.keys(state.sign))
        {
          if (p in this.signs) continue;	// sign found
          const d = B.blockAt(p2v(p));
          if (d)
            this.sign(d);
          else
            console.log('not loaded', p);
        }
      this.act();
    }
  // register or deregister a sign
  // should be only called for blocks which are signs or previously were signs
  // (see isSign())
  sign(d)
    {
//      Chat('sign', POS(d.position));
      const s = state.sign;
      const p = POS(d.position);
      const a = s[p];
      const del = () =>
        {
          if (!a) return;
          this.inc('sign', 'removed');
          delete s[p];
          state.sign = s;
          this.chat('-sign', p, a);
          this.signs[p] = 0;
         };

      if (!isSign(d)) return del();

      const t = d.signText.split('\n');
      const n = t[0].split(' ');
      if (n.shift() !== NAME) return del();

      const b = [n.join(' '), t[0], t[1], t[2]];
      if (toJ(a) !== toJ(b))
        {
          this.inc('sign', b ? 'changed' : 'new');
          s[p]	= b;
          state.sign = s;	// save state
          this.chat('+sign', p, b, ...(a ? [a] : []));
        }
      else if (this.signs[p]?.length)
        this.inc('sign', 'done');
      else
        this.inc('sign', 'known');

      this.signs[p] = [];
    }
  // n=0: last line of front (default)
  // n=1: first line of back
  // n=4: last line of back
  async setSign(p, x, n)
    {
      //console.warn('setSign', p, x, n);

      if (n<1 || n>4 || n !== n|0) n=0;
      const v = p2v(p);
      const b = B.blockAt(v);
      const s = state.sign[p];
      if (!s) throw `WTF no sign at ${p}`;
      if (isSign(b))
        {
          const t = b.signText.split('\n');
          if (t[0] === s[1] || t[1] === s[2] || t[2] === s[3])
            {
              //console.warn('setSign', p, x, n);
              const j = toJ({text:x});
//	      this.data([], 'modify block', ...p.split(','), `${n?'back':'front'}_text.messages[`, (n || 4)-1, '] set value', toJ(j));
              Chat(`/data modify block ${p.split(',').join(' ')} ${n?'back':'front'}_text.messages[${(n || 4)-1}] set value ${toJ(j)}`);
              if (!isArray(this.signs[p])) this.signs[p] = [];
              this.signs[p][n] = x;
//              console.log(p, b.signText);	Sign text is not updated yet!
              return this;
            }
        }
      // failed to set sign, update block and return void 0
      Chat('failed to set sign at', p, x);
      this.sign(b);
    }


  // yields "pos", state.sign, signblock, 4th line (which is for bot)
  get known_signs()
    {
      const self = this;
      return function*(...type)
        {
          const test = mkMatch(type);
          for (const [k,s] of Object.entries(state.sign))
            {
              if (!s) continue;		// deleted
              if (test && !test[s[2]]) continue;

              const x = self.signs[k];

              const v = p2v(k);
              const b = B.blockAt(v);

              let ok=false;
              if (isSign(b))
                {
                  const t = b.signText.split('\n');
                  ok = t[0] === s[1] && t[1] === s[2] && t[2] === s[3];
                }
              yield { id:k, text:s, stat:x, valid:ok, pos:v, block:b }
            }
        }
    }
  get iter_signs()
    {
      const self = this;
      return function*(...type)
        {
          const test = mkMatch(type);
          for (const [k,x] of Object.entries(self.signs))
            {
              //console.warn('?', k, x, state.sign[k]);
              if (!x) continue;		// ignore: disabled
              const s = state.sign[k];
              if (!s) continue;		// ignore: not usable

              const v = p2v(k);
              const b = B.blockAt(v);
              if (!b) continue;		// ignore: chunk not loaded

              if (!isSign(b))
                {
                  console.log('sign missing', k);
                  self.signs[k] = false;	// disable missing sign
                  continue;
                }

              // verify sign text
              const t = b.signText.split('\n');
              //console.warn(t, s);
              if (t[0] !== s[1] || t[1] !== s[2] || t[2] !== s[3]) continue;
              if (test && !test[s[2]]) continue;
              yield [k,s,b, x.length ? x[0] : t[3]];
            }
        }
    }
  *Bact()
    {
      yield this.act();
    }
  act()
    {
      if (this._acting) return 'already acting';
      this._acting = this._act().finally(() => this._acting = void 0);
    }
  async _act()
    {
      Chat('start acting');
      for (const [p,s,b,l] of this.iter_signs())
        {
          const x = s[2];
          const c = `S${x}`;
          const f = this[c];
          if (f === void 0)
            Chat('unknown sign', x);
          else if (!f)
            continue;
          else
            try {
             Chat('running sign', x);
             const v = p2v(p);
             for await (const m of this[c](p,s,b,l))
               Chat(m);
             continue;
            } catch (e) {
              Chat('sign',p,x,'failed:', `${e}`);
            }
          this.signs[p] = false;
        }
      Chat('end acting');
    }
  Ssleep = false;
  Snote = false;
  async *Ssort(p,s)
    {
      yield `sort ${p} ${s}`;
    }
  // tree	chop down the tree near sign
  // for now only jungle trees are supported and this also needs datapack timber
  // TODO incomplete
  async *Stree(p, s, b, l)
    {
      yield `tree ${p} ${s} ${b} ${l}`;
      // detect what to do (based on l)

      // initalize tree
      // for now only 2x2 jungle trees are supported
      const t = this.find(p, isTree, 4,0,4);
      if (!t)
        return console.log('no tree found at', p);
      if (t.length !== 4)
        return yield 'not a 2x2 tree';
      let n=0;
      for (const x of t)
        {
          //console.warn(x);
          const d = x[1].offset(0, -1, 0);
          const b = B.blockAt(d);
          if (!isDirt(b))
            return yield `not dirt ${POS(d)}`;
          this.setSign(p, POS(x[1]), ++n);
        }
      // remember the coordinates on the back of the sign
      yield `tree ${p}`;

      this.setSign(p, `${t[0][0]}`);
      yield* this.doDigBlock(t[0][2]);
    }
  // locate a certain block b (checked by fn(b))
  // starting at p with dx,dy,dz blocks away
  find(p,fn,dx,dy,dz,n)
    {
      const a = p2v(p);
      a.x	-= dx;
      a.y	-= dy;
      a.z	-= dz;
      dx	*= 2;
      dy	*= 2;
      dz	*= 2;
      const r = [];
      for (let x=dx+1; --x>=0; )
        for (let y=dy+1; --y>=0; )
          for (let z=dz+1; --z>=0; )
            {
              const b = B.blockAt(a.offset(x,y,z));
              if (!fn(b)) continue;
              const c = b.position;
              r.push([a.distanceTo(c), c, b]);
            }
      //console.warn('find', r.length);
      r.sort((a,b) => b[0]-a[0]);
      if (r.length)
        return n ? r.slice(0,n) : r;
    }

  //
  // Operations
  //

  stop()	{ if (RUN === this) RUN = void 0; this._.o('stopped'); return this }
  OK()		{ return RUN === this }
  get P()	{ return this._.p }
  chat(...s)
    {
      console.log('chat', s);
      Chat(...s);
      return this;
    }

  tick()
    {
      this.tick_autosleep();
    }
  async tick_autosleep()
    {
      const ok	= B.time.isDay && (B.thunderState < 1.0 || B.rainState < 1.0);
//      console.log('time', ok, state.autosleep);
      if (ok)
        this._sleep = false;
      else if (state.autosleep)
        for await (const x of this.doSleep())
         this.chat(x);
    }
  async *doDigBlock(b)
    {
//      const b = B.blockAt(p);
//      if (!b) return yield `location not loaded: ${p}`;
      await goNear(b.position);

      const ok = B.canDigBlock(b);
      if (!ok) return yield `cannot dig ${b.displayName} at ${POS(b.position)}`;

      console.warn('dig', b);
//      const x = PO();
//      this.digs[POS(b.position)] = x;
      await B.dig(b);
//      await x.p;
    }

  async *doSleep()
    {
      if (this._sleep) return;
      this._sleep = 1;
      for (const bed of this.iter_signs('sleep'))
        {
          yield `trying to sleep near ${bed[0]}`;
          await goNear(bed[2].position);
          const b = B.findBlock({ matching:isBed, maxDistance:5 });
          try {
            if (!b) throw 'cannot sleep, no bed';
            await B.sleep(b);
            console.log('sleeping');
            return yield 'now sleeping';
          } catch (e) {
            this._sleep = 0;
            return yield `sleep fail ${e}`;
          }
        }
      this._sleep = 0;
      // nothing found
      yield 'no bed found';
    }

  //
  // Tasks and Events
  //
  Ttask(task, ...a)
    {
      this.chat(`${task}`, this.nr);
      const t = this.tasks[task]	??= [];
      t.push({});
    }

  TBdiggingCompleted(_)	{ this.digok(_, 'o') }
  TBdiggingAborted(_)	{ this.digok(_, 'k') }
  digok(block, fn)
    {
      const p = POS(block.position);
      const d = this.digs[p];
      if (d)
        {
          delete this.digs[p];
          d[fn](block);
        }
    }

  TBmessagestr(str, who, data)	// chat message
    {
      // apparently "str" is truncated and missing the last character
      console.log('CHAT:', toJ(who), str);
      //console.warn('MESS:', MESS(data));
      //console.warn('MESS:', MESS(data.json.with));
      if (data?.json)
        this.runwant(data.json.translate, () => MJ(data));
    }
  TBweatherUpdate(..._)
    {
      this.tick();
      track('weather', 'rainState thunderState');
    }
  TBtime(..._)
    {
      this.tick();
//      track('time', 'timeOfDay');
    }
  TBchunkColumnLoad(_)
    {
      this.chunk_scan(_);
    }
  TBblockPlaced(orig, now)
    {
      if (IGN(orig) & IGN(now) & 8) return;
      console.log('BBP', POS(now.position), now.name);
    }
  TBblockUpdate(orig, now)
    {
      if (isSign(now) || isSign(orig))
        this.sign(now);
      if (orig.name === now.name) return;
      if (IGN(orig) & IGN(now) & 4) return;
      console.log('BBU', POS(orig.position), orig.name, now.name);
    }
  TWblockUpdate(..._)
    {
      console.log('');
      console.log('WBU', _);
      console.log('');
    }

  //
  // Grief
  //
  TBentityGone(x)
    {
      if (IGN(x) & 2) return;
      console.log('gone', ENTITY(x));
    }
  TBentityDead(x)
    {
      if (IGN(x) & 1) return;
      console.log('dead', ENTITY(x));
    }
  TBentityEatingGrass(x)
    {
      console.log('grass', ENTITY(x));
    }
  TBhealth(..._)
    {
      console.log('health', _);
      if (B.food === 20)
        B.autoEat.disableAuto();
      else
        B.autoEat.enableAuto();
    }

  //
  // Listing
  //
  async *Blist(c)
    {
      if (!c.length)
        {
          for (const k of allKeys(this))
            if (k.startsWith('L'))
              yield `list ${k.substr(1)}`;
          return;
        }
      const l = c.shift();
      const f = `L${l}`;
      if (!(f in this))
        return yield `unknown list: ${l}`;
      try {
        let n = 0;
        for await (const r of this[f](c))
          {
            n++;
            yield r;
          }
        yield `(${n} ${l})`;
      } catch (e) {
        yield `list ${l} error: ${e}`;
        console.error(e);
      }
    }
  *Lset(c)
    {
      function* dump(_,n)
        {
          if (isObject(_))
            {
              if (n >= c.length)
                for (const k in _)
                  yield k;
              else if (c[n] in _)
                yield* dump(_[c[n]], n+1);
              return;
            }
          //if (isArray(_))
            return yield toJ(_);;
        }
      yield* dump(state,0);
    }
  *Lop()
    {
      for (const [k,v] of Object.entries(state.op))
        yield `${v}: ${k}`;
    }
  *Lsign(c)
    {
      const test =
        { '?': _ => !_.ok
        , '!': _ => _.ok
        , '*': _ => true
        }[c[0]];
      if (test)
        {
          c.shift();
          const n = c.length ? 3 : 2;
          const list = {};
          for (const _ of this.known_signs(...c))
            if (test(_))
              list[_.text[n]] = 1+(list[_.text[n]]|0);
          for (const _ of Object.keys(list).sort())
            yield `${_} (${list[_]})`;
          return;
        }
      for (const {id,text,ok} of this.known_signs(...c))
        yield `${ok?'ok':'??'} ${text.join(',')} ${id}`;
    }
  *Linv(c)
    {
      for (const s of B.inventory.slots)
        if (s)
          yield `${s.slot}: ${s.count} ${s.name} ${s.displayName}`;
    }

  //
  // Commands (via whisper)
  //
  op(_)
    {
      if (_ === 'Server') return {server:true, admin:true, user:true, player:true}
      switch (state.op[_])
        {
        case Run.ADMIN: return {admin:true, user:true, player:true}
        case Run.USER: return {user:true, player:true}
        default: return {player:true}
        }
    }
  data(match, ...data)	// Minecraft /data command with response via this.want[match[0]]
    {
      Chat('/data', ...data);
      if (!match?.length) return;

      return this.addwant(10000, match[0], _ => match.filter((m,i) => _[i] !== m).length).p;
    }
  addwant(timeout, match, fn, ...args)
    {
      const p = PO();
      const s = this.want[match] ??= new Set();
      const r = { f:_ => fn(...args, _) || p.o(_) };	// it seems to be undocumented what return value p.o() has.  It seems to be void 0, which is what I need here!
      s.add(r);
      const t = setTimeout(p.k, 10000, `timeout: ${match}`);
      p.p.catch(console.error).finally(() => { console.warn('addwant finally'); s.delete(r); clearTimeout(t) });
      return p;
    }
  async runwant(match, get)
    {
      const _ = this.want[match];	// this is a Set()
      if (!_?.size) return;

      const arg = get(match, _);

      //console.warn(data.json.translate, _, arg);
      //console.warn('ARGS:', arg);
      for (const x of _)
        try {
          await x.f.call(_, arg);	// must remove itself when done
        } catch (e) {
          set.delete(x);		// something failed
          console.error(x.e = e);
        }
    }
  async TBwhisper(src, cmd)
    {
      if (src === B.player.username) return;
      const c = cmd.split(' ').filter(_ => _);
      if (c[0] === '') return;
      c[0] = c[0].toLowerCase();
      const u = this.op(src);
      console.warn('TELL:', src, ...c, u);
      const a = u.server ? Chat : (_ => B.whisper(src, _));
      const self = this;
      const c0 = c[0];
      const r = async (p) =>
        {
          const f = `${p}${c0}`;
          if (!(f in this)) return;
          for await (const x of this[f](c.slice(1), src, a))
            if (x !== void 0)
              a(x);
          return true;
        };
      try {
        const x = (u.admin  && await r('A'))
               || (u.user   && await r('B'))
               || (u.player && await r('C'))
               || `command ${c[0]} not understood`;
        if (x !== true)
          a(x);
      } catch (e) {
        console.error(e);
        a(`fail ${src} ${c}: ${e}`);
      }
    }
  *Asay(c)
    {
      console.warn('SAY:', c);
      Chat(...c);
    }
  // list op	to list ops
  // op		show usage
  // op admin name..	set names to admins
  // op user name..	set names to users
  // op other name..	set names to default (for now)
  *Aop(c)
    {
      let x;
      switch (c.shift())
        {
        default: return yield 'usage: op admin|user|other user..';
        case 'admin':	x = Run.ADMIN; break;
        case 'user':	x = Run.USER; break;
        case 'other':	x = 0; break;
        }
      const op = state.op;
      console.warn('op', x, c);
      for (const _ of c)
        {
          const was	= op[_];
          if (was === x)
            {
              yield `${_} unchanged`;
              continue;
            }
          op[_] = x;
          state.op = op;
          yield `${_} added`;
        }
    }
  // ign	list all igns
  // ign N	list all igns with N
  // ign N a b	set "a b" to N
  *Aign(c)
    {
      const s = state.IGNORE;
      if (!c.length)
        {
          const r = Object.entries(s).map(([k,v]) => `${k}: ${v}`).sort()
          for (const _ of r)
            yield _;
          return;
        }

      const m = c.shift();
      const n = m|0;
      if (`${n}` !== m) return yield 'first arg must be number';

      if (!c.length)
        {
          const r = Object.entries(s).filter(([k,v]) => (v&n) === n).map(([k,v]) => `${k}: ${v}`).sort()
          for (const _ of r)
            yield _;
          return;
        }

      const i = c.join(' ');
      const o = s[i];
      s[i] = n;
      state.IGNORE = s;
      yield `${i} now ${n ?? '(deleted)'} was ${o ?? '(unknown)'}`;
    }
  // NOT YET IMPLEMENTED
  *Aset(c)
    {
      while (c.length)
        {
          const x = c.shift();
          if (!(c in SETS))
            {
              yield `unknown ${c}`;
              continue;
            }
        }
    }
  // NOT YET IMPLEMENTED
  *Aunset(c)
    {
    }
  // will be removed when Aset() works
  *Aautosleep(c)
    {
     state.autosleep = !c.length;
     yield `autosleep = ${state.autosleep}`;
    }
  // sleep	run to "sleep" sign and try to sleep in bed
  async *Bsleep()
    {
      if (this._sleep) return yield 'already sleeping';
      yield* this.doSleep()
    }
  // drop		drop all (default)
  // drop name..	drop all of the given names or displayName
  // This does never drop anything which is ign 128
  async *Bdrop(c)
    {
      const test = mkMatch(c);
      for (const i of B.inventory.items())
        {
          if (IGN(i) & 128) continue;
          if (test && !test[i.name] && !test[i.displayName]) continue;
          yield `dropping ${i.count} ${i.name} ${i.displayName}`;
          await B.tossStack(i);
        }
    }
  *Bstop(c)
    {
      if (c.length)
        B.pathfinder.setGoal(null);
      else
        B.pathfinder.stop();
    }
  // come		run to player
  // come x y z		run to x y z
  // TODO:
  // come a		run to sign type a
  // come a b		run to sign type a with option b
  *Bcome(c,t,a)
    {
      const move = (_,c) =>
        {
          if (!_)
            return a(`I do not understand how to move to ${c}`);
          goNear(_);
          a(`moving to ${POS(_)}`);
        }
      if (c.length)
        return move(a2v(c), c);

       const p = B.players[t];
       const x = p?.entity?.position;
       if (x)
         return move(x, t);

        yield `I cannot see you ${t}`;

        this.data(['commands.data.entity.query', t], 'get entity', t, 'Pos')
        .then(_ => { const p = _[2].map(_ => parseInt(_)); move(v3(...p), p) });	// why does .map(parseInt) not work?
    }
  // help	shows all help keywords
  // help kw	shows all known works according to keyword
  // help cmd	all allowed tells, can be restricted to admin|user|player
  // help sign	lists all known sign processors
  async *Chelp(c,t)
    {
      const u = this.op(t);
      const r = new Set();
      const cmd = _ => (...a) =>
        {
          if (!c.length)
            a.forEach(_ => r.add(`help ${_}`));
          return c.filter(_ => a.includes(_)).length ? _ : NOP;
        }
      const dump = cmd(_ =>
        {
          for (const x of allKeys(this))
            if (x.startsWith(_))
              r.add(x.substr(_.length));
        });
     const list = cmd(_ => (c.length<2 ? _().map(([k,v,s]) => s)
                                       : _().filter(([k]) => c.includes(k)).map(([k,v])=>toJ(v))
                           ).forEach(_ => r.add(_)));

     if (u.admin)  dump('cmd','admin') ('A');
     if (u.user)   dump('cmd','user')  ('B');
     if (u.player) dump('cmd','player')('C');
     if (u.player) dump('sign')        ('S');

     list('food')(() => Object.values(B.registry.foods).map(_ => [_.name, _, `${(_.effectiveQuality * 10) | 0}: ${_.name}`]));

     const _ = Array.from(r).sort((a,b) => { const x=parseInt(a), y=parseInt(b); return isNaN(x) || isNaN(y) || x === y ? a<b ? -1 : a===b ? 0 : 1 : x-y });
     //console.warn('help', u, r);
     for (const x of _)
       yield x;
    }
  async *Cstate(c,t)
    {
      const f = B.pathfinder;
      yield `path move:${BOO(f.isMoving())} mine:${BOO(f.isMining())} build:${BOO(f.isBuilding())}`;
      yield `path think:${f.thinkTimeout} tick:${f.tickTimeout} search:${f.searchRadius}`;
      yield `food:${B.food|0} sat:${B.foodSaturation|0} oxy:${B.oxygenLevel|0} eat:${BOO(B.autoEat.enabled)}`;
      yield `pos: ${POS(B.entity.position)} health:${B.health}`;
    }
  async *Ceat(c)
    {
      await this.get(c);
      try {
        await B.autoEat.eat();
      } catch (e) {
        yield `eating failed (food=${B.food}): ${e}`;
      }
    }
  get(c)
    {
      if (!c.length)
        {
          c.push('cooked_chicken');
          c.push('bread');
        }
      console.error('get not yet implemented', B.autoEat.foods);
    }

  //breath is too buggy! TBbreath(..._) { const x = inc('breath'); track('oxygenLevel', console.log, 'breath', x); }
  };

run(Run);


//async function bot1()
//{
//  const mcData = require('minecraft-data')(bot.version)
//  const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id ?? mcData.itemsByName.planks.id)[0]
//  await bot.craft(plankRecipe, 1, null)
//  const stickRecipe = bot.recipesFor(mcData.itemsByName.sticks.id)[0]
//  await bot.craft(stickRecipe, 1, null)
//  bot.chat('Crafting Sticks finished')
//}

