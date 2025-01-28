#!/usr/bin/env nodejs
'use strict';
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

const _PARM_ = require('./globals.js');

// 'chat message messagestr'	// last ist best
const DEBUG	= 'goal_updated' // entityUpdate entityAttributes entitySpawn entityEquip' //entityMoved' //'blockUpdate' //blockUpdate itemDrop'
'login spawn end kicked error whisper'
const TRACE	= (...a) => { try { throw new Error() } catch (e) { console.error(a,e) } };

const mineflayer	= require('mineflayer');
const v3		= require('vec3');
//const pathfinder = require('mineflayer-pathfinder');
//const pvp = require('mineflayer-pvp');
//const autoeat = require('mineflayer-auto-eat');
const IMPORTS = Promise.all(Object.entries(
  { 'mineflayer-pathfinder': ['pathfinder', (B,_) =>
    {
      _ = _.default ?? _;
      B.PATHFINDER	= _;
      const m		= new _.Movements(B, B.mcData);
      m.canDig		= false;
      m.allow1by1towers	= false;
      m.allowFreeMotion	= true;
      m.canOpenDoors	= true;
      B.pathfinder.setMovements(m);
    }]
  , 'mineflayer-auto-eat': ['loader', (B,_) =>
    {
      // forbid low quality and possibly poisonous food
      const bannedFood = Object
        .values(B.registry.foods)
        .filter(_ => _.effectiveQuality < 10.0 || ['gold', 'suspicious'].some(x => _.name.includes(x)))
        .map(_ => _.name);
      B.autoEat.setOpts(
        { minHunger: 19
        , offhand: true
        , bannedFood
        });
    }]
  }).map(([k,v]) => import(k).then(_ => { console.log(`loaded: ${k}`); return [_,v,k] }))
  );
//const IMPORTS = void 0;

// currently only supports '*', not '?' or similar
const patternMatch = m =>
  {
    m	= m.split('*');

    const f = m[0];

    if (m.length === 1) return _ => _ === f;

    const e = m[m.length-1];

    if (m.length === 2)
      if (f === '')
        return e === '' ? () => true : _ => _.endsWith(e);
      else if (e === '')
        return _ => _.startsWith(f);

    // f and e are nonempty

    m.shift();
    m.pop();

    return _ =>
      {
        // check the start
        if (!_.startsWith(f)) return false;
        _ = _.substr(f.length);

        // check the middle
        for (const x of m)
          {
            const i = indexOf(_, x);
            if (i < 0) return false;
            _	= _.substr(i + x.length);
          }

        // check the end
        return _.endsWith(e);
      };
  };

/*
//
// miniBotLib
//

const ERR = _ => (...e) => { D('ERR', e); console.error(...e); Chat('E', _, ...e) }


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
*//*

//
// Implementation
//

const SETS =
  { sleep: 1
  };

// If these return a Promise (thenable), the next function will not be called until the Promise resolves or throws:
// T	tasks
// QB	bot callbacks
// QW	world callbacks
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
      // https://github.com/PrismarineJS/node-minecraft-data/blob/master/doc/api.md
              console.warn('V', B.version);

      //console.warn('DATA', DUMP(this.data,1));
      this._	= PO(this);
      this.nr	= ++Run.runcount;
      this.tasks= {};

//      for (const s of B.inventory.slots) if (s) console.log(s.slot, s.count, s.name);


  //
  // signs
  //

  // register chunk to scan and scan it asynchronously
  chunk_scan(_)
    {
      if (this.chunksinit)
        for (const c of Object.keys(B.world.async.columns??{}))
          {
            this.chunksinit	= void 0;
            const [x,z] = c.split(',').map(_ => _|0);
            this.chunk_scan({x:x*16, z:z*16});
          }
      const x = _.x|0;
      // y probably 0
      const z = _.z|0;
//      console.log('cc:', x,z);

      D('chunkscan', x,z);
      D('chunkscan(ok)', x,z);
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
      if (!this.signchange) return;
      this.signchange	= void 0;
      this.act();
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
          if (!this.signs[p]) continue;
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
  Sget = false;
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
      D('chat', s);
      console.log('chat', s);
      Chat(...s);
      return this;
    }

  tick()
    {
      D('tick');
      this.tick_autosleep();
//      this.tick_autoattack();
    }
  async tick_autosleep()
    {
      D('tick as');
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
      D('do dig');
//      const b = B.blockAt(p);
//      if (!b) return yield `location not loaded: ${p}`;

      goNear(b.position);
      await MOVE();

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
      D('do sleep');
      if (this._sleep) return;
      this._sleep = 1;
      for (const bed of this.iter_signs('sleep'))
        {
          yield `trying to sleep near ${bed[0]}`;
          goNear(bed[2].position);
          await MOVE();

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
  Qtask(task, ...a)
    {
      D('q task', a);
      this.chat(`${task}`, this.nr);
      const t = this.tasks[task]	??= [];
      t.push({});
    }

  QBdiggingCompleted(_)	{ this.digok('o', _) }
  QBdiggingAborted(_)	{ this.digok('k', _) }
  digok(fn, block)
    {
      const p = POS(block.position);
      const d = this.digs[p];
      if (d)
        {
          delete this.digs[p];
          d[fn](block);
        }
    }

  QBgoal_reached(..._)	{ this.moved('o', _) }
  QBpath_stop(..._)	{ this.moved('k', _) }
  moved(fn, _)
    {
      console.warn('MOVED', fn, _);
      const p = this._move;
      this._move	= void 0;
      if (p)
        p[fn](_);
    }
  move()		{ return this._move ??= PO() }

  // chat message
  // apparently "str" is truncated and missing the last character
  QBweatherUpdate(..._)		{ T.add(this.tick()) }
  QBtime(..._)			{ T.add(this.tick()) }
  QBchunkColumnLoad(_)		{ T.add(this.chunk_scan(_)) }
  QWblockUpdate(..._)		{ console.log('WBU', _) }
  QBblockUpdate(orig, now)
    {
      if (isSign(now) || isSign(orig)) T.add(this.sign(now));
      orig.name === now.name || IGN(orig) & IGN(now) & 4 || console.log('BBU', POS(orig.position), orig.name, now.name);
    }

  //
  // Grief
  //
  QBentityEatingGrass(x)
    {
      console.log('grass', ENTITY(x));
    }
  QBhealth(..._)
    {
      console.log('health', _);
      if (B.food === 20)
        B.autoEat.disableAuto();
      else
        B.autoEat.enableAuto();
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
  *Aautosleep(c)
    {
      state.autosleep = !c.length;
      yield `autosleep = ${state.autosleep}`;
    }
  *Arun(c)
    {
      console.error(eval(c.join(' ')));
    }
  // sleep	run to "sleep" sign and try to sleep in bed
  async *Bsleep()
    {
      if (this._sleep) return yield 'already sleeping';
      yield* this.doSleep()
    }
  *Bstop(c)
    {
      if (c.length)
        B.pathfinder.setGoal(null);
      else
        B.pathfinder.stop();
    }
  Cget(c)
    {
      return this.get(c);
    }
  async *get(c)
    {
      if (!c.length)
        {
          c.push('cooked_chicken');
          c.push('bread');
        }
//      yield 'test 123';
//      console.error('get not yet implemented', B.autoEat.foods);
      for (const s of B.inventory.slots)
        for (const x of c)
          if (s.name === x || s.displayName === x)
            return;
      yield 'need food';
      for (const x of c)
        {
//      yield `${s.slot}: ${s.count} ${s.name} ${s.displayName}`;
        }
    }

  //breath is too buggy! QBbreath(..._) { const x = inc('breath'); track('oxygenLevel', console.log, 'breath', x); }
  };

//async function bot1()
//{
//  const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id ?? mcData.itemsByName.planks.id)[0]
//  await bot.craft(plankRecipe, 1, null)
//  const stickRecipe = bot.recipesFor(mcData.itemsByName.sticks.id)[0]
//  await bot.craft(stickRecipe, 1, null)
//  bot.chat('Crafting Sticks finished')
//}
*/

const	X	= _ => process.stdout.write(_);
const	BITS	= Object.fromEntries('DEAD GONE UPDATE PLACE 4 5 6 DROP 8 9 10 11 12 13 14 15'.split(' ').map((_,i) => [_, 1<<i]));
const	POS	= _ => _ && `${_.x|0},${_.y|0},${_.z|0}`;
const	a2v	= _ => _?.length === 3 && v3(...(_.map(parseFloat)));
const	p2v	= _ => _ && a2v(_.split(','));

const	BOO	= _ => _===true ? 'Y' : _===false ? 'N' : `${_}`;

const	DUMP	= (_,d) =>
  d <= 0 ? '...' :
  Array.isArray(_) ? `[${_.map(_ => DUMP(_,d-1)).join(',')}]` :
  _ && 'object' === typeof _ ? `{${Object.keys(_).map(k => `${toJ(k)}:${DUMP(_[k],d-1)}`).join(',')}}` :
  toJ(_);

class Q
  {
  constructor(_,...a)	{ this._ = _; this.q = []; this.a = a; this.c = 0 }
  get debug()
    {
      if (++this.c < 25) return '';
      if (this.c < 50 && this.q.length % 25) return '';
      this.c	= 0;
      return this.q.length;
    }

  get length()		{ return this.q.length }
  get trace()		{ this.dump = true; return this }
  get name()		{ return this._ }
  get args()		{ return this.a }
  set args(a)		{ this.a = [].concat(a) }

  next()		{ return this.q.shift() }
  wait()		{ return this._w ??= this._wait().finally(() => this._w = void 0) }
  async _wait()		{ while (!this.q.length) await (this.w ??= PO()).p }
  signal()		{ const w = this.w; this.w = void 0; w?.o(); return this }
  add(..._)		{ this.dump && X(`${this.name}${this.q.length} `); this.q.push(this.a.concat(_)); return this.signal() //; console.log(this._, _)
                        }
  addX(..._)		{ console.error('addX', this._, _); return this.add(..._) }
  };

const isBed	= _ => B.isABed(_);
const isSign	= _ => _?.name.endsWith('_sign');
const isTree	= _ => _?.name.endsWith('_log');
const isDirt	= _ => _?.name.endsWith('dirt');

const VAL	= _ =>
  {
    switch (_[0])
      {
      case '+':
      case '-':
      case '=':
        return [_[0], _.slice(1)]
      }
    return ['+',_]
  };

// Try to convert a _.json Minecraft Object into some usable object
const MJ = j =>
  {
    D('MJ', j);
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

//const OpLevel	= Enum('ADMIN', 'USER');

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

class CTX
  {
  #abi; #filename;

  constructor(abi, filename)
    {
      this.#abi		= abi;
      this.#filename	= filename;
      this.console	= console;			// output vm's console to our console here
      this.sleep	= Sleep;
    }
  }

class Pos
  {
  get id()		{ return this._ ? POS(this._) : '(unknown)' }
  toString()		{ return `Pos ${POS(this._)}` }
  constructor(x,y,z)	{ this._ = x instanceof v3.Vec3 ? x : a2v([x,y,z]) }
  *locate()		{ return this }
  };

class Entity
  {
  get id()		{ return this._?.id }
  toString()		{ return this._ ? `Entity ${this._.displayName ?? this._.name}` : '(no entity)' }
  constructor(entity)	{ this._ = entity; }
  *locate()		{ return this.pos ??= new Pos(this._.position) }
  get hostile()		{ return this._?.type==='hostile' }
  };

class Player
  {
  get id()		{ return this._?.id }
  toString()		{ return `Player ${this._} ${this.pos ?? ''}` }
  constructor(name)	{ this._ = name }	// player can be out of sight
  async *locate(abi)
    {
      if (this.pos) return this.pos;

      const pos	= abi.B.players[this._]?.entity?.position;
      if (pos) return this.pos = new Pos(pos);

      yield `cannot see ${this._}`;

      const d	= await abi.data(['commands.data.entity.query', this._], ['No','entity','was','found'], 'get entity', this._, 'Pos');
      return this.pos = new Pos(d[2]);

//      t	= d[2].map(_ => parseInt(_));	// why does .map(parseInt) not work?
    }
  };

class Item
  {
  get id()		{ return this._?.id }
  toString()		{ return this._ ? `Item ${this._.displayName}` : '(no item)' }
  constructor(item)	{ this._ = item }
  // following must be improved:
  get weapon()		{ return this._ && this._?.name.endsWith('_sword') }
  get axe()		{ return this._ && this._?.name.endsWith('_axe') }
 }

class Sign
  {
  get id()		{ return this._?.id }
  toString()		{ return this._ ? `Sign ${this._.text.slice(2,4).join(':')}` : '(no sign)' }
  constructor(sign)	{ this._ = sign }
  *locate()		{ return this.pos ??= new Pos(this._.pos) }
 }

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

class Abi	// per spawn instance for bot
  {
  constructor(_)
    {
      this._		= _;
      this.vmctx	= OB();
      this.signs	= OB();
      this.actcache	= [];
      //this.stat		= OB();
      //this.digs		= OB();
      this.want		= OB();
      this.autostart('init');
    }
  autostart(c)
    {
      this._autostart?.abort(c||'(undefined)');
      const abort = this._autostart = new AbortController();
      return this.run(['AUTO', this._.nr], this._.src(), abort);
    }
  get B()	{ return this._.B }
  get state()	{ return this._.state }
  get chat()	{ return (..._) => this._.Chat(..._) }

  async *Move(..._)
    {
      const d = this.B.entity.position.distanceTo(_[0]);
      if (!this._.goNear(..._))
        {
          console.error(`${POS(_[0])} vs. ${POS(d)}`);
          return _[2] ?? (yield `Already there!`);
        }
      if (d>5)
        yield `moving to ${POS(_[0])} ${_[2]||''}`;
      try {
        const x = await this._.MOVE();
        if (d>5)
          yield `arrived at ${POS(_[0])} ${_[2]||''}: ${x} ${POS(this.B.entity.position)}`;
      } catch (e) {
        console.error(e);
        this.B.chat(`/tp ${_[0].x} ${_[0].y} ${_[0].z}`);
        yield `teleported to ${POS(_[0])} ${_[2]||''}`;
      }
    }

  // list:	array or value
  // val:	value (key) to search for in list
  inList(list, val)
    {
      const h	= new Set();
      const l	= mkArr(list);
      h.add(val);		// do not descend into self
      do
        {
          const n = l.shift();		// get first element
          if (n === void 0) continue;	// void elements do not count
          if (n === val) return true;	// FOUND!
          if (h.has(n)) continue;	// already visited, so ignore
          h.add(n);			// mark visited
          const x	= this.state.set?.list[n];
          if (x)
            l.push(...Object.keys(x));	// expand the list values
        } while (l.length);
    }

  chunk_init()		// Should be separate task!
    {
      if (this.chunks) return;
      for (const c of Object.keys(this.B.world.async.columns??{}))
        {
          if (!this.chunks) console.log('DID');
          this.chunks	= true;
          this._.chunk.add(...c.split(',').map(_ => (_*16)|0));
        }
      if (this.chunks) console.log('DONE');
    }
  async chunks(x,z)
    {
      if (!this.chunks)
        {
          this.chunk ??= OB();
          this._.out.addX(Abi.prototype.chunk_init);
        }
      for (let a=16; --a>=0; )
        this._.scan.add(this.chunk_scan, x+a, z);
    }
  async chunk_scan(x,z)
    {
      for (let b=16; --b>=0; )
        {
          await Sleep();
          const l = z+b;
          for (let c=320; --c>=-64; )
            {
              const d = this.B.blockAt(v3(x, c, l));
              if (d?.name.endsWith('_sign')) this._.in.add(this.Sign, d);
            }
        }
    }
  // register or deregister a sign
  // should be only called for blocks which are signs or previously were signs
  // (see isSign())
  Sign(d)
    {
//      Chat('sign', POS(d.position));
      const s = this.state.sign;
      const p = POS(d.position);
      D('sign', p);
      const a = s[p];
      const del = () =>
        {
          D('sign:del', p, a);
          if (!a) return;
//          this.inc('sign', 'removed');
          delete s[p];
          this.state.sign = s;		// not redundant: save state
          this.chat('-sign', p, a);
          this.signs[p] = 0;
          D('sign:del(ok)');
         };

      if (!isSign(d)) return del();

      const t = d.signText.split('\n');
      const n = t[0].split(' ');

      if (!this.inList(n.shift(), this._.botname)) return del();

      const b = [n.join(' '), t[0], t[1], t[2]];
      if (toJ(a) !== toJ(b))
        {
//          this.inc('sign', b ? 'changed' : 'new');
          s[p]	= b;
          this.state.sign = s;	// save state
          this.chat('+sign', p, b, ...(a ? [a] : []));
        }
//      else if (this.signs[p]?.length) this.inc('sign', 'done'); else this.inc('sign', 'known');

      this.signs[p] = [];
      this.signchange = true;
      D('sign(ok)', p);
    }

  runcmd(c, src)
    {
      const abort = new AbortController();
      return (
        [ () =>				// start function
          {
            const r = this.run(c, src, abort);
            //console.error('RUNNER start', r); r.then(_ => console.error('RUNNER stop', _));
            return r;
          }
        , _ => abort.abort(_)		// stop function
        ]);
    }

  async run(c, src, abort)
    {
      try {
        return await this.yielder(src, await this.cmdload(src, c), abort?.signal|0);
      } catch (e) {
        if (e.code !== 'ENOENT')
          src.tell(`error: ${e}`);
        else
          src.tell(`unknown command: ${c[0]}`);
      }
    }
  async cmdload(src, c)
    {
      const load = async (_) =>
        {
          const filename = `cmd/${_}.js`;		// XXX TODO XXX cache code and implement permisions
          const code	= await Read(filename);
          return {filename,code}
        }
      return this.vmrun(load, src, ...c);
    }
  async vmrun(load, src, cmd, ...a)
    {
      if (/[^A-Za-z0-9]/.test(cmd)) throw new Error(`invalid name: ${cmd}`);

      const {filename,code}	= await load(cmd);

      const vm	= require('vm');
      const ctx	= this.vmctx[filename] ??= vm.createContext(new CTX(this, filename));
      const fn	= vm.runInContext(`(async function*(src,arg0,_) {'use strict';\n${code}\n});`, ctx, {filename,lineOffset:-1});
      const it	= fn.call(ctx, src, cmd, a);		// this returns the iterator, but does not start it yet
      it.filename	= filename;
      return it;
    }
  async yielder(src, iter, abort)
    {
//      TRACE('YIELDER', src._, iter);
      let _, v, err;
      for (const iters = [iter]; iters.length; )
        {
          if (iters.length > 20) throw 'stack overflow';
          const iter= iters[0];

          if (this !== this._.abi || abort.aborted) err = 1;
          try {
//            if (iters.length>1) console.warn('DOa', iters.length, err, v);
//console.error('ITER', iter);
            _		= await (err ? iter.throw(v ?? (abort.aborted && abort.reason || new Error('abort'))) : iter.next(v));	// get the next command (or error)
//            if (iters.length>1) console.warn('DOb', iters.length, `${_.done} ${_.value}`);
            err	= void 0;
          } catch (cause) {
            // present the error of the script prominently into our console
            console.warn('----------------------', iter.filename);
            console.error('FAIL:', iters.length, iter.filename, cause);
            console.warn('----------------------', iter.filename);

            v		= cause;
            err	= true;
            iters.shift();
            continue;							// next iter
          }

          try {
            _		= await _;

            v		= _.value;
            if (_.done)
              {
                iters.shift();						// iterator ended
                if (iters.length) continue;				// return value to previous iterator
              }

            if (v === void 0) continue;					// ignore empty yields

            if (isString(v))						// talk to the originator
              {
                src.tell(v);
                v	= void 0;					// no reply
                continue;
              }

            // split the command into arguments
            const c	= v.map(_ => isString(_) ? _.split(' ').filter(_ => _!='') : _).flat();
            v		= void 0;					// default no reply

            console.log('DO', iters.length, toJ(c.map(_ => `${_}`)));

            // try to locate a local function here
            const c0	= c[0];
            const f	= `C${c0}`;
            if (f in this)
              {
                iters.unshift(this[f](c.slice(1), src));		// push execution of local function
//                console.log('DO:', iters.length, f, c, v, _, err);
                continue;
              }
            if (c0)
              {
                try {
                  // TODO XXX TODO: Perhaps this is wrong.
                  // Perhaps we want to run the other script in OUR context, not in ITS context
                  // but leave this to the future
                  iters.unshift(await this.cmdload(src, c));		// push execution of subcommand
                  continue;
                } catch (cause) {					// cmdload failed
                  if (cause.code !== 'ENOENT')
                    throw new Error(`bad command: ${c0}`, {cause});	// propagate the parsing or read error
                }
              }
            // Propagate the error to the command.
            // Note that the error does not resemble the position in the VM,
            // it resembles our position here of the new Error()!
            // I consider this a bug, as the real location of the error (the wrong yield)
            // vanishes this way!
            // But I cannot help with this, AFAICS this is probably a bug in the JavaScript Standard.
            throw new Error(`unknown command: ${c0}`);
          } catch (cause) {
//            console.warn('DOerr', iters.length, cause);
            v	= cause;
            err	= true;							// use iter.throw to propagate the error
          }
        }

//      console.warn('DOend', err, v);
      if (err)
        throw v;							// propagate the error: usually bad/unknown command
      return v;								// propagate the result (can this be something else than void 0?)
    }

  // commands for processing via yielder, all must be iterators and can be async if needed
  *Cact(c,src)
    {
      const t=c.join(' ');
      if (t in this.actcache) return;
      if (this.actcache.length>20) this.actcache.shift();
      this.actcache.push(t);
      src.tell(t);
    }
  *Cautostart(c,src)	{ this.autostart(c.join(' ')) }
  *Crun(c,src)		{ this._.run.add(...this.runcmd(c, src)) }
  *Csay(c)		{ this.chat(...c) }
  *Cequip([d,i])	{ return i ? this.B.equip(i._,d) : this.B.unequip(d) }
  *Cattack(c)		{ return this.B.attack(c[0]._) }

  *Cwho(c,src)		{ return new Player(src._) }
  *Cplayer(c,src)	{ return new Player(c[0] ?? src._) }
  *Cpos(c,src)		{ return new Pos(...c) }
  async *Clocate(c,src)	{ return yield* c[0].locate(this) }
  *Ctp(c)		{ const p = (yield* c[0].locate())._; return this.B.chat(`/tp ${p.x|0} ${p.y|0} ${p.z|0}`) }
  *Cdist(c,src)		{ return this.B.entity.position.distanceTo((yield* c[0].locate())._) }
  *Cbot()		{ return new Player(this._.botname) }
  *Chand()		{ return new Item(this.B.itemInHand) }
  *Cinv(c)		{ return new Item(this.B.inventory.slots[c[0]]) }
  *Cinvs(c)
    {
      const match = this.matcher(c);

      return (function*(B)
        {
          for (const _ of B.inventory.slots)
            if (match(_))
              yield new Item(_);
        })(this.B);
    }
  *Cnearest(c)		// get the nearest entity
    {
      //console.error('NEAREST', c);
      return new Entity(this.B.nearestEntity(this.matcher(c)));
    }
  *Centities(c)		// list all entities of a given match (like 'type','hostile')
    {
      const me	= B.entity;
      const match = this.matcher(c, _ => _ !== me);

      return (function*(B)
        {
          for (const _ of Object.values(B.entities))
            if (match(_))
              yield new Entity(_);
        })(this.B);
    }
  *Csign(c)
    {
      const type = c.shift();
      const match = ({text,pos}, d) =>
        {
          const t = text[3];
          for (const x of c)
            if (t.includes(x))
              return t;
        }

      const signs = this.find_sign(type, match);
      // .id	this.state.sign[.id] (id is stringified position)
      // .text	texts (lines) of sign
      // .stat	sign status
      // .valid	sign loaded and correct
      // .pos	position of sign
      // .block	block of sign
      // .dist	distance to bot
      // .match	return of match() function or true

      if (!signs.length) return;
      return signs.map(_ => new Sign(_));
    }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Assorted helpers, may vanish
  ////////////////////////////////////////////////////////////////////////////////////////////////

  matcher(c, fn)
    {
      const m = [];
      if (fn)
        m.push(fn);
      for (let neg; c.length; )
        {
          const x = c.shift();
          // note that x has a NULL prototype, as it is from another context
          if ('object' === typeof x)		Object.entries(x).forEach(([k,v]) => m.push(neg ? _ => _[k] !== v : _ => _[k] === v));
          else if (isFunction(x))	m.push(neg ? _ => !x(_) : _ => x(_));
          else if (isString(x))		m.push(neg ? _ => !_[x] : _ => _[x]);
          else neg = !x;		// true or false, following must be true or false, default true
        }
      return x => m.every(_ => _(x));
    }


  // create match object for items and blocks
  // with wildcards '*' it creates a list of matching Minecraft blocks and items
  match(..._)
    {
      _ = _.flat();
      if (!_.length) return () => true;
      const m = OB();
      while (_.length)
        {
          const a = _.shift();
          if (a.includes('*'))
            {
              this._.match(a).forEach(b => _.push(b));
              constinue;
            }
          m[a] = true;
          if (!a.includes(':'))
            {
              m[`minecraft:${a}`] = true;
              m[`:${a}`] = true;
            }
        }
      return _ => m[_];
    }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Currently still proxied stuff
  ////////////////////////////////////////////////////////////////////////////////////////////////

  // set list[:sublist] [+-=]value
  *Cset(c)
    {
      let d	= this.state;
      let m	= 'set';
      const p	= [];
      if (c.length)
        {
          const n	= c.shift().split(':');
          do
            {
              if (!(m in d))
                return yield `missing entry ${p.join(':')}`;
              d		= d[m];
              m		= n.shift();
              p.push(m);
            } while (n.length);
          if (c.length)
            {
              const v	= d[m] ?? {};
              const o	= toJ(v);
              do {
                const [m,x]	= VAL(c.shift());
                switch (m)
                  {
                  case '-':	delete v[x];	break;
                  case '=':	v = {[x]:{}};	break;
                  case '+':	v[x] ??= {};	break;
                  }
              } while (c.length);
              if (toJ(v) === o)
                return yield `${p.join(':')} unchanged`;
              d[m]		= v;
              this.state.set	= this.state.set;	// save state change
              return yield `${p.join(':')} updated`;
            }
        }
      const x = p.join(':');
      if (!(m in d))
        return yield `missing entry ${x}`;
      return Object.keys(d[m]).sort().join(' ');
    }

  // drop		drop all (default)
  // drop name..	drop all of the given names or displayName
  // This does never drop anything which is IGN.keep
  async *Cdrop(c)
    {
      const test = this.match(c);
      for (const i of this.B.inventory.items())
        {
          if (this._.search('IGN', i.name,        'keep')) continue;
          if (this._.search('IGN', i.displayName, 'keep')) continue;
          console.error(i);
          if (!test(i.name) && !test(i.displayName)) continue;
          yield `dropping ${i.count} ${i.name} ${i.displayName}`;
          await this.B.tossStack(i);
        }
    }




  ////////////////////////////////////////////////////////////////////////////////////////////////
  // This shall vanish ASAP
  ////////////////////////////////////////////////////////////////////////////////////////////////

  *Cmove(c)		{ this._.goNear((yield* c[0].locate())._, c[1]|0) }
  *Carrive(c)		{ return this._.MOVE() }		// automatically awaited









  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Old or unsorted stuff
  ////////////////////////////////////////////////////////////////////////////////////////////////

  // yields:
  // .id	this.state.sign[.id] (id is stringified position)
  // .text	texts (lines) of sign
  // .stat	sign status
  // .valid	sign loaded and correct
  // .pos	position of sign
  // .block	block of sign
  get known_signs()
    {
      const self = this;
      return function*(...type)
        {
          const match = this.match(type);
          for (const [k,s] of Object.entries(this.state.sign))
            {
              if (!s) continue;		// deleted
              if (!match(s[2])) continue;

              const x = self.signs[k];

              const v = p2v(k);
              const b = this.B.blockAt(v);

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
  // find sign with given type and optional match type
  // returns:
  // .id	this.state.sign[.id] (id is stringified position)
  // .text	texts (lines) of sign
  // .stat	sign status
  // .valid	sign loaded and correct
  // .pos	position of sign
  // .block	block of sign
  // .dist	distance to bot
  // .match	return of match() function or true
  find_sign(type, match)
    {
      const r = [];
      for (const s of this.known_signs(type))
        {
          const d	= s.dist = this.B.entity.position.distanceTo(s.pos);
          if ((s.match = match ? match(s, d) : true) !== void 0)
            r.push(s);
        }
      return r.sort((a,b) => a.dist < b.dist);
    }

  data(match, mismatch, ...data)	// Minecraft /data command with response via this.want[match[0]]
    {
      data.unshift('/data');
      this.B.chat('');
      this.B.chat(data.join(' '));
      if (!match?.length) return;

      const m = match => _ => match.filter((m,i) => _[i] !== m).length;
      return this.addwant(10000, match[0], m(match), mismatch?.length ? m(mismatch) : () => true).p;
    }
  addwant(timeout, match, ok, ko, ...args)
    {
      const p = PO();
      const s = this.want[match] ??= new Set();
      const r = { f:_ => { ok(...args, _) || p.o(_); ko(...args, _) || p.k(_) } };	// it seems to be undocumented what return value p.o() has.  It seems to be void 0, which is what I need here!
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
  // help	shows all help keywords
  // help kw	shows all known works according to keyword
  // help cmd	all allowed tells, can be restricted to admin|user|player
  // help sign	lists all known sign processors
  async *Chelp(c,t)
    {
      const u	= this._.src(t);
      const r	= new Set();
      const cmd	= _ => (...a) =>
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
       dump('cmd')('C');
       dump('sign')('S');

//     if (u.admin)  dump('cmd','admin') ('A');
//     if (u.user)   dump('cmd','user')  ('B');
//     if (u.player) dump('cmd','player')('C');
//     if (u.player) dump('sign')        ('S');

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
      yield* this.get(c);
      try {
        await B.autoEat.eat();
      } catch (e) {
        yield `eating failed (food=${B.food}): ${e}`;
      }
    }

  //
  // Listing
  //
  async *Clist(c)
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
      yield* dump(this.state,0);
    }
  *Lsign(c)
    {
      const test =
        { '?': _ => !_.valid
        , '!': _ => _.valid
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
      for (const {id,text,valid} of this.known_signs(...c))
        yield `${valid?'ok':'??'} ${text.join(',')} ${id}`;
    }
  *Linv(c)
    {
      for (const s of this.B.inventory.slots)
        if (s)
          yield `${s.slot}: ${s.count} ${s.name} ${s.displayName}`;
    }

  };

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

async function StartWeb(_)
{
  const chat = _.chat;
  const state = (await _.state).set?.conf?.web;
  if (!state || !state.enabled) return chat('no WEB: conf:web not enabled');

  const key	= _ => _ ? Object.keys(_)[0] : void 0;
  const host	= key(state.host) || '127.0.0.1';
  const port	= key(state.port) || 8080;

  const viewer	= require('./Viewer.js');
  //const viewer	= require('prismarine-viewer').mineflayer;
  //return `URL http://${host}:${port}/`;
  return viewer(_.B,
    { host
    , port
    , viewDistance: 20
      , firstPerson:true	// warning, this is permanent!
    })
    .then(_ => `WEB at ${_}`, e => { console.error(e); return `WEB failed: ${e}` })
    .then(chat);
}

class Bot	// global instance for bot
  {
  // XXX TODO XXX GET RID OF THESE:
  #match;

  IGN(_)	{ return false; this.state.IGNORE[_.name] | this.state.IGNORE[_.displayName] }
  get chat()	{ return (...a) => this.Chat(...a) }
  Chat(...s)
    {
//      DD('chat', s);
      const _ = s.map(_ => `${_}`).join(' ');
      console.log('SAY:', _);
      this.say.add(_);
    }
  ENTITY(_)
    {
      let item = '';
      if (_.displayName === 'Item')
        {
          const m = _.metadata[8];
          item = ` ${m.itemCount}x${m.itemId} ${toJ(this.B.mcData.items[m.itemId].displayName)}`;
        }
      return `${POS(_.position)} ${_.entityType} ${toJ(_.displayName)}${item}`;
    }
  isWeapon(item)
    {
//      const d = item?.nbt?.value?.Damage; if (!d) return;
      if (!item?.name?.endsWith('sword')) return;
//      console.error('Weapon', item.name, item);
      return true;
    }

  // XXX TODO XXX GET RID OF pathfinder:
  // this starts moving without blocking
  // returns truish (goal) if moving else void 0
  goNear(_,max=3)
    {
      D('goNear', _);
      if (this.B.entity.position.distanceTo(_) <= max) return;
      const goal = new this.B.PATHFINDER.goals.GoalNear(_.x, _.y, _.z, max);
      this.B.pathfinder.setGoal(goal, false);	// sync void 0
      return goal;
  //    return this.B.pathfinder.goto(goal);
    };
  MOVE(goal)
    {
      D('move', goal);
      if (!goal)
        goal = this.B.pathfinder.goal;
      if (goal)
        {
          const r = this.B.pathfinder.goto(goal);
//          console.error('MOVE', r);
          return r;
        }
    };

  // XXX TODO XXX refactor
  // This should be encapsulated into some Mincraft Data class

  // wildcard matching of items etc. the bot knows of
  match(m, ...what)
    {
      if (!this.mcData)	return [];
      if (!what.length)	what	= ['item','block'];
      return this.#match[`${toJ(m)} ${toJ(what)}`] ??= (pattern =>
        {
          const o = OB();
          for (const _ of what)
            for (const a in Object.keys(mcData[`${_}sByName`]))
              if (pattern(a)) o[a] = true;
          return Object.freeze(Object.keys(o).sort());
        })(patternMatch(m));
    }

  // XXX TODO XXX  cleanup!
  constructor(username, host, port)
    {
      this.nr		= 0;
      this.#match	= new Map();

      // Setup Bot (=us)
      username ??= 'Bot';
      host ??= '127.0.0.1';
      port ??= 25565;

      this.botname		= username;;

      const B = this.B = mineflayer.createBot({ host, port, username, hideErrors:false });

      // DEBUG
      Wrap(B, 'emit',  LogOnce('emit'));		// DEBUG to see what emit() are available
      //B.settings.enableServerListing = false;		// does not work
      DEBUG.split(' ').forEach(_ => B.on(_, (...a) => console.log('D', _, ...(a.map(_ => DUMP(_, 2))))));

      //CURRENT.chat	= (..._) => this.Chat(..._);

      // keep (load) the state
      const State = require('./State.js');
      this._save = () => State.save();

      this.state	= State(this.botname);		// No load state on spawn, the last write might be delayed

      // initialize Bot as soon as it is online the first time
      B.once('spawn', () =>
        {
          DD('firstspawn', 'start');
//          B.loadPlugin(pathfinder.pathfinder);
//          B.loadPlugin(pvp.plugin);
          IMPORTS &&
          IMPORTS
          .then(_ => _.map(async ([_,p,k]) =>
            {
              B.loadPlugin(p[0] ? _[p[0]] : _);	// HACK
              p[1] && await (p[1](B, _));
              console.log(`initialized: ${k}`);
            }))
          .then(_ => console.log(`${_.length} asynchronous plugin(s)`));

          B.mcData	= require('minecraft-data')(B.version);

          StartWeb(this);
          DD('firstspawn', 'end');
        });

      // save state when Bot ends
      B.once('end', () => { DD('END'); this.stop(); State.save().finally(() => process.exit()) });

      // Initialize queues, processed by ._start()
      // - Queues run in parallel
      // - Only one (the top) entry of the queue runs asynchronously
      // in (the first queue) has priority:
      // - other queue DO NOT starts new entries while an entry of .in executes
      // - executing entries are run in parallel until they finish
      this.in	= new Q('I');
      this.chunk= new Q('C', Abi.prototype.chunks);
      this.say	= new Q('T', _ => this.B.chat(_));
      this.out	= new Q('O');
      this.scan	= new Q('S');
      this.run	= new Q('R');

      // Register all events on Bot and World
      // Run the functions immediately and asynchronously, so nothing piles up
      // World (W_) does not work yet, dunno why
      for (const k of allKeys(Object.getPrototypeOf(this)))
        {
          if (!k?.startsWith) continue;

          const on = k.startsWith('M_') ? B : k.startsWith('W_') ? B.world : void 0;	// Luckily we are not in PHP.
          if (!on) continue;
//          on.on(k.substring(2), this[k].bind(this));
          // Register event
          on.on(k.substring(2), (..._) => { D(k, _); this[k](..._) });
        }
    }

  ////////////////////////////////////
  // get a qualified src object
  ////////////////////////////////////

  // XXX TODO XXX caching
  src(_)
    {
      _ ??= 'Server';
      const server	= _ === 'Server';
      const perm	= Object.keys(this.state.user?.[_] ?? {});
      return (
        { _
        , server
        // false:	disallowed
        // null:	unknown (dest)
        // void 0:	unknown (default)
        , perm:	server ? () => true : (what,dest) =>
          {
            const p	= Object.keys(this.state[what]?.[dest] ?? {});
            if (!p.length)	return null;	// dest has no perm
            if (!perm.length)	return false;	// not allowed (dest has perm)

            return this.perm(p,perm);
          }
        , tell:	server ? this.B.chat : (m => this.out.add(() => this.B.whisper(_, m)))
        });
    }

  // XXX TODO XXX encapsulate searching into state wrapper
  search(...name)
    {
      let k = this.state.set;
      for (const _ of name.join(':').split(':'))
        {
//          console.error('SEARCH', name, k);
          k	= k[_];
          if (!k) return;
        }
      return k;
    }
  search_ns(what, sel, ...names)
    {
      const v = [];
      for (const x of names)
        {
          v.push(x);
          if (!x.includes(':'))
            {
              v.push(`:${x}`);
              v.push(`minecraft:${x}`);
            }
        }
      for (const x of v)
        {
          const r = this.search(what, x, ...sel);
          if (r) return r;
        }
    }
  search_e(entity, ...sel)	{ return this.search_ns('entity', sel, entity.name, entity.displayName) }
  search_i(item,   ...sel)	{ return this.search_ns('item',   sel,   item.name,   item.displayName) }

  // XXX TODO XXX GET RID OF THESE:
  // stoppable iterator run queue
  runner(src, fn)
    {
      let x;
//      TRACE('RUNNER', src._, fn);
      return new Promise(o => this.run.add(
        () =>
          {	// start function
            const r = x ?? this.abi.yielder(src, fn, _ => x=_);
            console.error('RUNNER start', r);
            r.then(_ => console.error('RUNNER stop', _));
            o(r);
            return r;
          },
        () => x = x?.throw() || false)			// stop function	WTF TODO XXX
        );
    }
  async yielder(src, fn, _)
    {
      try {
        const f = fn(src);
        _?.(f, src);	// callback to populate iterator
        for await (const x of f)
          if (x !== void 0)
            src.tell(x);
      } catch (e) {
        console.error(e);
        src.tell(`fail: ${e}`);
      }
    }

  // XXX TODO XXX refactor into cmd/

  // n=0: last line of front (default)
  // n=1: first line of back
  // n=4: last line of back
  async setSign(p, x, n)
    {
      //console.warn('setSign', p, x, n);

      D('setSign', p);
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
//              this.data([], 'modify block', ...p.split(','), `${n?'back':'front'}_text.messages[`, (n || 4)-1, '] set value', toJ(j));
              this.Chat(`/data modify block ${p.split(',').join(' ')} ${n?'back':'front'}_text.messages[${(n || 4)-1}] set value ${toJ(j)}`);
              if (!isArray(this.signs[p])) this.signs[p] = [];
              this.signs[p][n] = x;
//              console.log(p, b.signText);	Sign text is not updated yet!
              return this;
            }
        }
      // failed to set sign, update block and return void 0
      this.Chat('failed to set sign at', p, x);
      this.sign(b);
    }

/* No more needed:
  M_startedAttacking() { this._attack = 1 }
  M_stoppedAttacking() { this._attack = 0 }
  M_attackedTarget()	{ console.log('attack', _) }
*/

  // XXX TODO XXX Get rid of pathfinder in future, perhaps
  M_path_reset(...a)
    {
      const g = this.B.pathfinder.goal;
      switch (a[0])
        {
        case 'stuck':
          this.B.pathfinder.setGoal(null);
          console.error(`teleporting to ${POS(g)}`);
          this.Chat(`/tp ${g.x} ${g.y} ${g.z}`);
          return;
        }
      console.error('PATH', a)
    }

  // XXX TODO XXX are these still needed?
  M_soundEffectHeard(n,p,v,s)	{ console.log('ESND', n,p,v,s) }
  M_hardcodedSoundEffectHeard(i,c,p,v,s)	{ 0 && console.log('HSND', i,c,p,v,s) }
  M_time()			{ D('time') }				// each second
  M_physicsTick()		{ D('tick') }				// each tick (20 per second)
  M_blockPlaced(orig, now)	{                           this.IGN(orig) & this.IGN(now) & BITS.PLACE  || console.log('P', orig.name, now.name) }
  M_blockUpdate(orig, now)	{ orig.name === now.name || this.IGN(orig) & this.IGN(now) & BITS.UPDATE || console.log('U', orig.name, now.name) }
//  M_entityGone(x)		{ this.IGN(x) & BITS.GONE || console.log('G', this.ENTITY(x)) }
//  M_entityDead(x)		{ this.IGN(x) & BITS.DEAD || console.log('D', this.ENTITY(x)) }

  ////////////////////////////////////////////////////
  // Signals which are specially processed
  ////////////////////////////////////////////////////

  // XXX TODO XXX solve differently
//  M_entitySpawn(x)
//    {
//      if (x.type !== 'hostile') return;
//      if (this.run.length) return;
//      if (this.run.active) return;
//      const a = this.search_e(x, 'auto:attack') ?? this.search('auto:attack');
//      if (!a) return;
//      console.error('HERE');
//      console.error('HERE');
//      console.error('HERE');
//      console.error('HERE');
//      this.runner(this.src(), () => this.abi._attack(Object.keys(a)));
//    }
  // XXX TODO XXX make this generic to subscribe to certain messages with a timeout
  M_messagestr(str, who, data)
    {
      console.log('CHAT:', toJ(who), str);
      data?.json && this.abi.runwant(data.json.translate, () => MJ(data))
    }

  M_chunkColumnLoad(_)		{ this.chunk.add(_.x|0, _.z|0) }
  M_whisper(src, cmd)
    {
//      console.error('WHISPER', src, cmd);
      if (src === this.B.player.username) return;
      const c = cmd.split(' ').filter(_ => _);
      if (c[0] === '') return;

      c[0] = c[0].toLowerCase();

      src = this.src(src);
      if (/[^a-z]/.test(c[0])) return src.tell(`invalid command: ${c[0]}`);
      this.run.add(...this.abi.runcmd(c, src));
    }

  // Bot starts playing
  async M_spawn(..._)
    {
      // halt the previous runtime
      this.stop();
      const nr = ++this.nr;

      this.Chat('start', nr);

//      Write('DATA.json', toJ(DATA));

      // wait for current state to stabilize
      const state	= this.state	= await this.state;

      // Init State
      if (!state.sign)	state.sign	= {};
//      if (!state._)	state._ 	= {};

      await this._save();

      await IMPORTS;	// make sure all plugins are loaded

      // Instantiate Bot's runtime for this connection
      const r = await this.start();

      console.error('FLW', FLW);

      // This instance probably was replaced by another connection
      this.Chat('stop', nr, r);
    }

  //
  // Stop and Start the bot
  //

  stop()	{ this.abi = this._ = void 0 }
  start()	{ return this._ ??= this._start() };
  async _start()
    {
      let	o;

      const abi	= this.abi	= new Abi(this);

      // XXX TODO XXX: Queues should be autodetected
      const r	= [this.in, this.run, this.say, this.out, this.chunk, this.scan];	// .in must be first, followed by .run
      const x	= [], y = [];
      let p = 65;
      // XXX TODO XXX: Priorities shall be implicite
      do
        {
          // stop the current this.run if another shows up
          while (r[1].length>1) r[1].next()[1]();
          if (r[1].length && x[1])
            {
//              console.error('runstop', x[1], x[1][0], x[1][1]);
              x[1][1]();
            }

          const a = r.map((_,i) =>
            {
              if (x[i]) return y[i];	// something still running in this queue
              if (i && x[0]) return;	// start nothing else while .in queue is active
              const o = x[i] = _.next();
              if (!o) return _.wait();	// wait for new entries to arrive in queue
              r[i].active = true;
              return y[i] = Promise.resolve(abi)
                .then(_ => o[0].apply(_, o.slice(1)))
//                .then(_ => { if (i===1) console.error('RUN', o[0], _); return _ })
                .catch(THROW)
//                .then(_ => { if (i===1) console.error('RETURN', _); return _ })
//                .finally(() => { if (i===1) console.error('RUN inactive', o[0]) })
                .finally(() => { r[i].active=false; x[i]=y[i]=void 0 });
            });
//          console.warn('RUN', x);

          X(`${x.map((_,i) => _ ? String.fromCodePoint(p+i)+r[i].debug : '').join('') || '@'}`);
          await Promise.any(a);
          p	= 162 - p;
        } while (this.abi === abi);
    }
  };

// XXX TODO XXX get rid of _PARM_
new Bot(_PARM_.NAME, _PARM_.HOST, _PARM_.PORT);

