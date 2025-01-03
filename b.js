#!/usr/bin/env nodejs
'use strict';
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

const PARM = require('./globals.js');
//const State = require('./State.js');

// 'chat message messagestr'	// last ist best
const DEBUG	= 'goal_updated path_reset' //'blockUpdate' //'entityGone entityDead blockUpdate itemDrop'
'login spawn end kicked error whisper'

const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer
const v3 = require('vec3');
const pathfinder = require('mineflayer-pathfinder');
//const pvp = require('mineflayer-pvp');
//const autoeat = require('mineflayer-auto-eat');
const DELAYED = Promise.all(['mineflayer-auto-eat'].map(_ => import(_)));	// require() does not work with those
//const DELAYED = void 0;

/*
//
// miniBotLib
//

const ERR = _ => (...e) => { D('ERR', e); console.error(...e); Chat('E', _, ...e) }

const BOO = _ => _===true ? 'Y' : _===false ? 'N' : `${_}`;

const DUMP = (_,d) =>
  d <= 0 ? '...' :
  Array.isArray(_) ? `[${_.map(_ => DUMP(_,d-1)).join(',')}]` :
  _ && 'object' === typeof _ ? `{${Object.keys(_).map(k => `${toJ(k)}:${DUMP(_[k],d-1)}`).join(',')}}` :
  toJ(_);

// this starts moving without blocking
// returns truish (goal) if moving else void 0
const goNear = (_,max=3) =>
  {
    D('goNear', _);
    if (B.entity.position.distanceTo(_) <= max) return;
    const goal = new pathfinder.goals.GoalNear(_.x, _.y, _.z, max);
    B.pathfinder.setGoal(goal, false);	// sync void 0
    return goal;
//    return B.pathfinder.goto(goal);
  };
const MOVE = goal => { D('move', goal); return (goal ??= B.pathfinder.goal) && B.pathfinder.goto(goal) };

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

//
// Initialize Bot
//
// Put up HTTP access (limited, but it works somehow)

//
// Load and keep the state
//


//
// Runtime Helpers
//


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
  QBstartedAttacking() { this._attack = 1 }
  QBstoppedAttacking() { this._attack = 0 }
  QBattackedTarget()	{ console.log('attack', _) }
//  async tick_autoattack()
//    {
//      D('tick aa');
//      if ((state.autoattack|0)<1 || this._attack) return ++this._attack;
//      console.log('AA');
//      const e = bot.nearestEntity(_ => _.type==='hostile' && _.position.distanceTo(B.entity.position) <= state.autoattack);
//      if (e)
//        {
//          B.pvp.attack(e);
//          this._attack = -10;
//          Chat('attacking', e.name);
//        }
//    }
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
  QBmessagestr(str, who, data)	{ console.log('CHAT:', toJ(who), str); data?.json && this.runwant(data.json.translate, () => MJ(data)) }
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
  QBentityGone(x)
    {
      D('QB ent gone');
      if (IGN(x) & 2) return;
      console.log('gone', ENTITY(x));
    }
  QBentityDead(x)
    {
      D('QB ent dead');
      if (IGN(x) & 1) return;
      console.log('dead', ENTITY(x));
    }
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
  async QBwhisper(src, cmd)
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
  *Aautoattack(c)
    {
      if (c.length)
        state.autoattack = c[0]|0;
      yield `autoattack = ${state.autoattack}`;
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
      yield* this.get(c);
      try {
        await B.autoEat.eat();
      } catch (e) {
        yield `eating failed (food=${B.food}): ${e}`;
      }
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
//  const mcData = require('minecraft-data')(bot.version)
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
  signal()		{ const w = this.w; this.w = void 0; w?.o() }
  add(..._)		{ this.dump && X(`${this.name}${this.q.length} `); this.q.push(this.a.concat(_)); this.signal() //; console.log(this._, _)
                        }
  addX(..._)		{ console.log(_); return this.add(..._) }
  };

const isBed	= _ => B.isABed(_);
const isSign	= _ => _?.name.endsWith('_sign');
const isTree	= _ => _?.name.endsWith('_log');
const isDirt	= _ => _?.name.endsWith('dirt');

const OpLevel = Enum('ADMIN', 'USER');

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

class Abi	// per spawn instance for bot
  {
  constructor(_)
    {
      this._		= _;
      this.signs	= OB();
    }
  get state()	{ return this._.state }
  get chat()	{ return (..._) => this._.Chat(..._) }

  // register or deregister a sign
  // should be only called for blocks which are signs or previously were signs
  // (see isSign())
  Sign(d)
    {
    //    Chat('sign', POS(d.position));
      const s = this.state.sign;
      const p = POS(d.position);
      D('sign', p);
      const a = s[p];
      const del = () =>
        {
          D('sign:del', p, a);
          if (!a) return;
    //      this.inc('sign', 'removed');
          delete s[p];
          this.state.sign = s;
          this.chat('-sign', p, a);
          this.signs[p] = 0;
          D('sign:del(ok)');
         };

      if (!isSign(d)) return del();

      const t = d.signText.split('\n');
      const n = t[0].split(' ');
      if (n.shift() !== PARM.NAME) return del();

      const b = [n.join(' '), t[0], t[1], t[2]];
      if (toJ(a) !== toJ(b))
        {
    //      this.inc('sign', b ? 'changed' : 'new');
          s[p]	= b;
          state.sign = s;	// save state
          this.chat('+sign', p, b, ...(a ? [a] : []));
        }
    //  else if (this.signs[p]?.length) this.inc('sign', 'done'); else this.inc('sign', 'known');

      this.signs[p] = [];
      this.signchange = true;
      D('sign(ok)', p);
    }
  };

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

class Bot	// global instance for bot
  {
  IGN(_)	{ this.state.IGNORE[_.name] | this.state.IGNORE[_.displayName] }
  Chat(...s)
    {
      DD('chat', s);
      const _ = s.map(_ => `${_}`).join(' ');
      console.log('SAY:', _);
      this.out.addX(() => this.B.chat(_));
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

  constructor(PARM)
    {
      this.nr	= 0;

      const B = this.B = mineflayer.createBot({ host:PARM.HOST || '127.0.0.1', port:PARM.PORT || 25565, username:PARM.NAME ?? 'Bot', hideErrors:false });
      Wrap(B, 'emit',  LogOnce('emit'));		// DEBUG to see what emit() are available
      //B.settings.enableServerListing = false;		// does not work

      DEBUG.split(' ').forEach(_ => B.on(_, (...a) => console.log('D', _, ...(a.map(_ => DUMP(_, 2))))));

      // initialize the bot as soon as it is online the first time
      B.once('spawn', () =>
        {
          DD('firstspawn', 'start');
          B.loadPlugin(pathfinder.pathfinder);
//          B.loadPlugin(autoeat.plugin);
//          B.loadPlugin(pvp.plugin);
          DELAYED &&
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

          this.Chat(`Web on http://${PARM.WEBHOST}:${PARM.WEBPORT}/`);
          mineflayerViewer(B,
            { port:PARM.WEBPORT
            , host:PARM.WEBHOST
            , viewDistance: 20
//            , firstPerson:true	// warning, this is permanent!
            });
          DD('firstspawn', 'end');
        });

      // keep the state
      const State = require('./State.js');
      this._save = () => State.save();

      B.once('end', () => { DD('END'); this.stop(); State.save().finally(() => process.exit()) });

      this.in	= new Q('I');
      this.chunk= new Q('C', (..._) => this.chunks(..._));
      this.out	= new Q('O');
      this.scan	= new Q('S');

      this.state	= State(PARM.NAME);		// No load state on spawn, the last write might be delayed

      // Register all Bot events in Run
      for (const k of allKeys(Object.getPrototypeOf(this)))
        {
          if (!k?.startsWith) continue;
          const on = k.startsWith('M_') ? B : k.startsWith('W_') ? B.world : void 0;	// Luckily we are not in PHP.
          if (!on) continue;
//          on.on(k.substring(2), this[k].bind(this));
          on.on(k.substring(2), (..._) => { D(k, _); this[k](..._) });
        }
    }

  getop(_)
    {
      if (_ === 'Server' || _ === void 0) return {server:true, admin:true, user:true, player:true};
      switch (this.state.op[_])
        {
        case OpLevel.ADMIN: return {admin:true, user:true, player:true}
        case OpLevel.USER:  return {user:true, player:true}
        default: return {player:true}
        }
    }
  chunk_init(_)		// Should be separate task!
    {
      if (_.chunks) return;
      for (const c of Object.keys(this.B.world.async.columns??{}))
        {
          if (!_.chunks) console.log('DID');
          _.chunks	= true;
          this.chunk.add(...c.split(',').map(_ => (_*16)|0));
        }
      if (_.chunks) console.log('DONE');
    }
  async chunks(_,x,z)
    {
      if (!_.chunks)
        {
          this.chunk ??= OB();
          this.out.addX(() => this.chunk_init(_));
        }
      for (let a=16; --a>=0; )
        this.scan.add(x => this.chunk_scan(_, x, z), x+a);
    }
  async chunk_scan(_,x,z)
    {
      for (let b=16; --b>=0; )
        {
          await Sleep();
          const l = z+b;
          for (let c=320; --c>=-64; )
            {
              const d = this.B.blockAt(v3(x, c, l));
              if (d?.name.endsWith('_sign')) this.in.add(_ => _.Sign(d));
            }
        }
    }
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

  M_time()			{ D('time') }				// each second
  M_physicsTick()		{ D('tick') }				// each tick (20 per second)
  M_blockPlaced(orig, now)	{                           this.IGN(orig) & this.IGN(now) & BITS.PLACE  || console.log('P', orig.name, now.name) }
  M_blockUpdate(orig, now)	{ orig.name === now.name || this.IGN(orig) & this.IGN(now) & BITS.UPDATE || console.log('U', orig.name, now.name) }
  M_entityGone(x)		{ this.IGN(x) & BITS.GONE || console.log('G', this.ENTITY(x)) }
  M_entityDead(x)		{ this.IGN(x) & BITS.DEAD || console.log('D', this.ENTITY(x)) }
  M_chunkColumnLoad(_)		{ this.chunk.add(_.x|0, _.z|0) }
  M_whisper(src, cmd)
    {
      console.error('WHISPER', src, cmd);
      if (src === this.B.player.username) return;
      const c = cmd.split(' ').filter(_ => _);
      if (c[0] === '') return;
      c[0] = c[0].toLowerCase();
      this.out.add(() => this.cmd(c, src));
    }
  async cmd(_, c, src)
    {
      const u = this.getop(src);
      //console.warn('TELL:', src, ...c, u);
      const a = u.server ? (_ => this.Chat(_)) : (_ => this.B.whisper(src, _));
      const c0 = c[0];
      const r = async (_) =>
        {
          const f = `${_}${c0}`;
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
/*
      const r = async (p) =>
        {
          const f = `${p}${c0}`;
          if (!(f in this)) return;
          for await (const x of this[f](c.slice(1), src, a))
            if (x !== void 0)
              a(x);
          return true;
        };
*/
  async M_spawn(..._)
    {
      // halt the previous runtime
      this.stop();
      const nr = ++this.nr;

      this.Chat('start', nr);

//      Write('DATA.json', toJ(DATA));

      // wait for current state to stabilize
      const state	= this.state	= await this.state;
      if (!state.sign)	state.sign	= {};
      if (!state._)	state._ 	= {};

      await this._save();

      await DELAYED;	// make sure all plugins are loaded

      // Instantiate Bot's runtime for this connection
      const r = await this.start();

      console.error('FLW', FLW);

      // This instance probably was replaced by another connection
      this.Chat('stop', nr, r);
    }

  //
  // Stop and Start the bot
  //

  stop()	{ this.api	= this._	= void 0 }
  start()	{ return this._ ??= this._start() };
  async _start()
    {
      let	o;

      const api	= this.api	= new Abi(this);

      const r	= [this.in, this.out, this.chunk, this.scan];
      const x	= [], y = [];
      let p = 65;
      do
        {
          const a = r.map((_,i) =>
            {
              if (x[i]) return y[i];
              if (i && x[0]) return;	// process nothing else if incoming queue is active
              const o = x[i] = _.next();
              if (!o) return _.wait();	// wait for something to happen on the queue
              return y[i] = Promise.resolve(api).then(_ => o[0](_, ...o.slice(1))).catch(THROW).finally(() => { x[i]=y[i]=void 0 });
            });
          //console.warn('RUN', x);

          X(`${x.map((_,i) => _ ? String.fromCodePoint(p+i)+r[i].debug : '').join('') || '@'}`);
          await Promise.any(a);
          p	= 162 - p;
        } while (this.api === api);
    }
  };

new Bot(PARM).start();

