#!/usr/bin/env nodejs
'use strict';
// This Works is placed under the terms of the Copyright Less License,
// see file COPYRIGHT.CLL.  USE AT OWN RISK, ABSOLUTELY NO WARRANTY.

const _PARM_ = require('./globals.js');
const CON = (..._) => { console.error(..._); console.error(..._); console.error(..._) };
const CCON = (..._) => { CON(..._); return _[_.length-1] };

// return the first match which does not return void 0
const first = (arr,match,...a) =>
  {
    for (const _ of arr)
      {
        const r = match(_);
        if (r !== void 0) return r;
      }
  };
const notEmpty = a => a.length ? a : void 0;

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
  ).then(_ => B => _.map(async ([_,p,k]) =>
    {
      B.loadPlugin(p[0] ? _[p[0]] : _);	// HACK
      p[1] && await (p[1](B, _));
      console.log(`initialized: ${k}`);
    })
  );

//const IMPORTS = void 0;

// currently only supports '*', not '?' or similar
const patternMatch = m =>
  {
    m	= m.split('*');

    // XXX TODO XXX allow ** to match *

    const f = m.shift();

    if (!m.length) return _ => _ === f;	// no *

    const e = m.pop();

    if (!m.length)			// a single *
      if (f === '')
        return e === '' ? () => true : _ => _.endsWith(e);
      else if (e === '')
        return _ => _.startsWith(f);

    // either f and e are nonempty
    // or there is something in the middle

    return _ =>
      {
        // check the start
        if (!_.startsWith(f)) return false;
        _ = _.substr(f.length);

        // check the middle
        for (const x of m)
          {
            const i = _.indexOf(x);
            if (i < 0) return false;
            _	= _.substr(i + x.length);
          }

        // check the end
        // we could check in advance, but then '*e*e' would match 'e'
        return _.endsWith(e);
      };
  };

/*

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

  QBentityEatingGrass(x) { console.log('grass', ENTITY(x)) }
  QBhealth(..._)
    {
      console.log('health', _);
      if (B.food === 20)
        B.autoEat.disableAuto();
      else
        B.autoEat.enableAuto();
    }

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

  //breath is too buggy! QBbreath(..._) { const x = inc('breath'); track('oxygenLevel', console.log, 'breath', x); }
  };
*/

const	X	= _ => process.stdout.write(_);
const	POS	= _ => _ && `${_.x|0},${_.y|0},${_.z|0}`;
const	a2v	= _ => _?.length === 3 && v3(...(_.map(parseFloat)));
const	p2v	= _ => _ && a2v(_.split(','));

const	BOO	= _ => _===true ? 'Y' : _===false ? 'N' : `${_}`;

const	DUMP	= (_,d) =>
  d <= 0 ? '...' :
  Array.isArray(_) ? `[${_.map(_ => DUMP(_,d-1)).join(',')}]` :
  _ && 'object' === typeof _ ? `{${Object.keys(_).map(k => `${toJ(k)}:${DUMP(_[k],d-1)}`).join(',')}}` :
  toJ(_);

const INV	= _ => v3(-_.x, -_.y, -_.z);	// inverse vector (of course this is missing in Vec3!)
const DIR	= _ =>				// Minecraft directions
  {
    switch (_)
      {
      case 'u':	return v3( 0, 1,  0);		// up
      case 'd':	return v3( 0,-1,  0);		// down
      case 'w':	return v3(-1, 0,  0);		// west
      case 'e':	return v3( 1, 0,  0);		// east
      case 'n':	return v3( 0, 0, -1);		// north
      case 's':	return v3( 0, 0,  1);		// south
      }
    return v3(0,0,0);
  };


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
  peek()		{ return this.q[0] }
  wait()		{ return this._w ??= this._wait().finally(() => this._w = void 0) }
  async _wait()		{ while (!this.q.length) await (this.w ??= PO()).p }
  signal()		{ const w = this.w; this.w = void 0; w?.o(); return this }
  add(..._)		{ this.dump && X(`${this.name}${this.q.length} `); this.q.push(this.a.concat(_)); return this.signal() //; console.log(this._, _)
                        }
  addX(..._)		{ console.error('addX', this._, _); return this.add(..._) }
  get iter()		{ const q=this.q; return function*() { for (const x of q) yield x } }
  };

const isBed	= _ => B.isABed(_);
const isSign	= _ => _?.name.endsWith('_sign');
const isTree	= _ => _?.name.endsWith('_log');
const isDirt	= _ => _?.name.endsWith('dirt');

const isChesty	= _ => ChestType[_?.name];
const isChestyFn= _ => { const c = isChesty(_); return !c || isString(c) ? () => c : c };
const ChestType =
  { chest: _ =>
    {
      switch (_.getProperties().type)
        {
        case 'single':	return 'S';	// single chest type
        case 'left':	return 'D';	// double chest type
        }
    }
  , trapped_chest: _ =>
    {
      switch (_.getProperties().type)
        {
        case 'single':	return 'St';	// single chest type
        case 'left':	return 'Dt';	// double chest type
        }
    }
  , barrel:		'B'
  , brewing_stand:	'b'
  , ender_chest:	'e'
  , dispenser:		'di'
  , dropper:		'dr'
  , furnace:		'f'
  , blast_furnace:	'fb'
  , smoker:		'fs'
  , hopper:		'h'
  , minecart:		'm'
  , chest_minecart:	'mc'
  , furnace_minecart:	'mf'
  , hopper_minecart:	'mh'
  , tnt_minecart:	'mt'
  };

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
      this.toJ		= toJ;
    }
  }

class My
  {
  constructor(_)
    {
      this._ = _;
    }
  };
class Pos extends My
  {
  get id()		{ return this._ ? POS(this._) : '(unknown)' }
  toString()		{ return `Pos ${POS(this._)}` }
  constructor(x,y,z)	{ super(x instanceof v3.Vec3 ? x : x instanceof Pos ? x._ : a2v([parseFloat(x),parseFloat(y),parseFloat(z)])) }
  *locate()		{ return this }
  vec(x,y,z)		{ return x instanceof v3.Vec3 ? this._.plus(x) : this._.offset(x|0,y|0,z|0) }
  dir(_)		{ return this.vec(DIR(_)) }
  };

const HOSTILE = { hostile:true, mob:true };
class Entity extends My
  {
  get id()		{ return this._?.id }
  toString()		{ return this._ ? `Entity ${this._.displayName ?? this._.name}` : '(no entity)' }
  *locate()		{ return this._pos ??= new Pos(this._.position) }
  get hostile()		{ return HOSTILE[this._?.type] }
  get name()		{ return this._?.name }
  };

class Player extends My		// player can be out of sight, so it is initalized by name
  {
  get id()		{ return this._?.id }
  toString()		{ return `Player ${this._} ${this._pos ?? ''}` }
  async *locate(abi)
    {
      if (this._pos) return this._pos;

      const pos	= abi.B.players[this._]?.entity?.position;
      if (pos) return this._pos = new Pos(pos);

      yield `#cannot see ${this._}`;

      const d	= await abi.data(['commands.data.entity.query', this._], ['No','entity','was','found'], 'get entity', this._, 'Pos');
      return this._pos = new Pos(...d[2]);

//      t	= d[2].map(_ => parseInt(_));	// why does .map(parseInt) not work?
    }
  };

const target =
  { all:	'*'
  , Hammer:	''
  , Helm:	'*_helmet'
  , Hose:	'*_leggings'
  , Sword:	'*_sword'
  , SwordAxe:	'*_sword	*_axe'
  , Crossbow:	'crossbow'
  , Bow:	'crossbow	bow'
  , Boots:	'*_boots'
  , Angel:	'fishing_rod'
  , Dreizack:	'trident'
  , Mining:	''
  , Armor:	''
  , Container:	'chest hopper dropper dispenser barrel furnace *_box'
  };

const enchant =
  { All: 	{ mending:1,		unbreaking:3	}
  , Hammer:	{ breach:4,		density:5,	wind_burst:3			}
  , Helm:	{ aqua_affinity:1,	respiration:3	}
  , Hose:	{ swift_sneak:3 			}
  , Sword:	{ fire_aspect:2,	knockback:2,	looting:3	}
  , SwordAxe:	{ bane_of_arthropods:5,	sharpness:5,	smite:5,	sweeping_edge:3		}
  , Crossbow:	{ multishot:1,		piercing:4,	quick_charge:3			}
  , Bow:	{ flame:1,		infinity:1,	power:5,	punch:2		}
  , Boots:	{ feather_falling:4,	frost_walker:2,	depth_strider:3			}
  , Angel:	{ luck_of_the_sea:3,	lure:3,		soul_speed:3			}
  , Dreizack:	{ impaling:5,		loyalty:3,	riptide:3,	channeling:1	}
  , Mining:	{ efficiency:5,		fortune:3,	silk_touch:1			}	// pick shovel axe
  , Armor:	{ blast_protection:4,	protection:4,	thorns:3,	projectile_protection:4,	fire_protection:4		}
  , Container:	{ furnace:2 }
  };

const CONTAINER = { chest:true, hopper:true, dropper:true, dispenser:true, barrel:true, furnace:2};

class Item extends My
  {
  get id()		{ return this._?.name }
  toString()		{ return this._ ? `Item ${this._.displayName}` : '(no item)' }
  get type()		{ return this._?.type }
  get meta()		{ return this._?.metadata }
  get count()		{ return this._?.count }

  // following must be improved:
  get weapon()		{ return this._ && this._?.name.endsWith('_sword') }
  get axe()		{ return this._ && this._?.name.endsWith('_axe') }
 };

class Block extends My
  {
  get id()		{ return this._?.name }
  toString()		{ return this._ ? `Block ${this._.name}` : `(no block)` }
  *locate()		{ return this._pos ??= new Pos(this._.position) }
  pos(x,y,z)		{ return new Pos(this._.position.offset(x??0,y??0,z??0)) }
  get container()	{ return CONTAINER[this.id] }
  };
 
class Sign extends My
  {
  get id()		{ return this._?.block?.name }
  toString()		{ return this._ ? `Sign ${this._.text.slice(2,4).join(':')} ${POS(this._.pos)}` : '(no sign)' }
  *locate()		{ return this._pos ??= new Pos(this._.pos) }
  get valid()		{ return this._?.valid }
  get text()		{ return this._.text }
  };

class Container extends My
  {
  get id()		{ return this._?.name }
  toString()		{ return this._ ? `Container ${this._.name}` : `(no container)` }
  *locate()		{ return this._pos ??= new Pos(this._.position) }
  out()			{ const x = CONTAINER[this._.name]; return this.items().filter((_,i) => x === true || x.includes(i)) }
  items()		{ return this._.slots.slice(0, this._.inventoryStart).map(_ => new Item(_)) }
  put(i,n)		{ return this._.deposit(i.type, i.meta, n||null) }
  close()		{ return this._.close() }
  take(i,n)
    {
      try {
//        console.warn('withdraw', i, n);
        const r = this._.withdraw(i.type, i.meta, n||null)
//        console.warn('withdraw', i, n, r);
        return r;
      } catch (e) {
        console.error('WITHDRAW', e);
      }
    }
 };

class Survey
  {
  #id; #a; #d; #e; #r; #s;
  static #gid = 0;
  static #ln = OB();
  static *dump()
    {
      const n = Date.now();
      yield Survey.#gid;
      for (const [k,v] of Object.entries(this.#ln))
        {
          const d = v.data;
          console.log('dump', k, toJ(d));
          yield `${k} ${d.id} ${n-d.d} ${d.s}: ${toJ(d.a)} = ${d.r} (${d.e})`;
        }
    }
  get data() { return {id:this.#id, d:this.#d, a:this.#a, e:this.#e, r:this.#r, s:this.#s} }

  constructor(...a)
    {
      this.#id	= ++Survey.#gid;
      this.#a	= a;
      Survey.#ln[this.#id] = this;
      this.#s	= 'new';
      this.#d	= Date.now();
    }
  err(...a)	{ this.#e = a; this.#s = 'err' }
  end(...a)	{ this.#r = a; this.#s = 'end'; delete Survey.#ln[this.#id] }
  };

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

class Abi	// per spawn instance for bot
  {
  constructor(_)
    {
      this._		= _;
      this.vmctx	= OB();
      this.rem		= { sign:OB(), chest:OB() };
//      this.chg		= {};
      this.actcache	= [];
      //this.stat		= OB();
      //this.digs		= OB();
      this.want		= OB();
      this.listcache	= OB();

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

  // search entry in list
  findList(val)		{ return this.listcache[val] ??= Object.keys(this.state.set.list).filter(_ => this.inList(_,val)) }
  // list:	array or value
  // val:	value (key) to search for in list
  inList(list, val)
    {
      const neg=`!${val}`;			// allow !item to inhibit list for this item, takes precedence
      let ok = false;
      for (const _ of this.theList(list))
        {
//          console.error('inList', _, val);
          if (_ === neg)
            return false;
          if (_ === val)
            ok	= true;
        }
      return ok;
    }
  // expand the list
  *theList(list)
    {
      const l	= mkArr(list);
      const h	= new Set();
      do
        {
          const n	= l.shift();	// get first element
          if (n === void 0) continue;	// void elements do not count
          yield n;			// return element
          for (const _ of this._.match(n))
            yield _;
          if (h.has(n)) continue;	// already visited, so ignore
          h.add(n);			// mark visited
          const x	= this.state.set?.list?.[n];
          if (x)
            l.push(...Object.keys(x));	// expand the list values
        } while (l.length);
    }

  chunk_init()		// Should be a separate task!
    {
      if (this.got_chunks) return;
      for (const c of Object.keys(this.B.world.async.columns??{}))
        {
          this.got_chunks	= true;
          this._.chunk.add(...c.split(',').map(_ => (_*16)|0));
        }
    }
  async chunks(x,z)
    {
      if (!this.got_chunks)
        {
          this.chunk ??= OB();
          this._.out.add(this.chunk_init);
        }
      for (let a=16; --a>=0; )
        this._.scan.add(this.chunk_scan, x+a, z);
    }
  async chunk_scan(x,z)
    {
      for (let b=16; --b>=0; await Sleep())
        {
          const l = z+b;
          for (let c=320; --c>=-64; )
            {
              const d = this.B.blockAt(v3(x, c, l));
              if (isSign(d))   this._.in.add(this.Sign,  d);
              if (isChesty(d)) this._.in.add(this.Chest, d);
            }
        }
    }
  // register or deregister something we want to track
  remember(d, type, check)
    {
      if (!check) return;
      const s = this.state[type];
      const p = POS(d.position);
      D(type, p);
      const a = s[p];
      const del = () =>
        {
          D(`${type}:del`, p, a);
          if (!a) return;
//          this.inc(type, 'removed');
          delete s[p];
          this.state[type] = s;		// not redundant: save state
          this.chat(`-${type}`, p, a);
          this.rem[type][p] = 0;
          D(`${type}:del(ok)`);
         };

      const b = check(d);
      if (!b) return del();

      if (toJ(a) !== toJ(b))
        {
//          this.inc('sign', b ? 'changed' : 'new');
          s[p]	= b;
          this.state[type] = s;	// save state
          this.chat(`+${type}`, p, b, ...(a ? [a] : []));
        }
//      else if (this.rem.sign[p]?.length) this.inc(type, 'done'); else this.inc(type, 'known');

      this.rem[type][p] = [];
//      this.chg[type] = true;
      D(`${type}(ok)`, p);
    }

  Chest(d) { this.remember(d, 'chest', isChestyFn(d)) }
  Sign(d)
    {
      this.remember(d, 'sign', d =>
        {
          if (!isSign(d)) return;

          const t = d.signText.split('\n');
          const n = t[0].split(' ');

          if (this.inList(n.shift(), this._.botname))
            return [n.join(' '), t[0], t[1], t[2]];
        });
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
      const inf = {c,src,abort};
      const id = new Survey('run', inf);
      try {
        const r = await this.yielder(inf, await this.cmdload(src, c));
      } catch (e) {
        id.err(e);
        console.error(e);
        if (e.code !== 'ENOENT')
          src.tell(`#error: ${e}`);
        else
          src.tell(`#unknown command: ${c[0]}`);
      } finally {
        id.end();
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
      try {
        const fn	= vm.runInContext(`(async function*(src,arg0,_) {'use strict';\n${code}\n});`, ctx, {filename,lineOffset:-1,displayErrors:true});
        const it	= fn.call(ctx, src, cmd, a);		// this returns the iterator, but does not start it yet
        it.filename	= filename;
        return it;
      } catch (e) {
        console.error(e);
        throw e;
      }
    }

  async yielder(inf, iter)
    {
      const abort = inf.abort;
      let _, v, err;
      for (const iters = inf.iters = [iter]; iters.length; await Sleep(1))
        {
          if (iters.length > 20) throw 'stack overflow';
          const iter= iters[0];

          if (this !== this._.abi || abort.aborted) err = 1;
          try {
            iter.state	= 'yield';
            iter.err	= err;
            iter.v	= v;
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

            iter.state	= 'err';
            iter.err	= true;
            iter.v	= v;
            v		= cause;
            err	= true;
            iters.shift();
            continue;							// next iter
          }

          try {
            iter.state	= 'wait';
            iter._	= _;
            _		= await _;
            iter.state	= 'run';
            iter._	= _;

            v		= _.value;
            if (_.done)
              {
                iters.shift();						// iterator ended
                if (iters.length) continue;				// return value to previous iterator
              }

            if (v === void 0) continue;					// ignore empty yields

            if (isString(v))						// talk to the originator
              {
                inf.src.tell(v);
                v	= void 0;					// no reply
                continue;
              }
            if (!isArray(v))
              {
                inf.src.tell(toJ(v));
                v	= void 0;
                continue;
              }

            // split the command into arguments
            const c	= v.map(_ => isString(_) ? _.split(' ').filter(_ => _!='') : _).flat();
            v		= void 0;					// default no reply

            console.log('DO', iters.length, toJ(c.map(_ => (_ instanceof My) ? `${_}` : _)));

            // try to locate a local function here
            const c0	= c[0];
            const f	= `C${c0}`;
            if (f in this)
              {
                iters.unshift(this[f](c.slice(1), inf.src));		// push execution of local function
//                console.log('DO:', iters.length, f, c, v, _, err);
                continue;
              }
            if (c0)
              {
                try {
                  // TODO XXX TODO: Perhaps this is wrong.
                  // Perhaps we want to run the other script in OUR context, not in ITS context
                  // but leave this to the future
                  iters.unshift(await this.cmdload(inf.src, c))		// push execution of subcommand
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
  _conf(c)
    {
      let d	= this.state;
      for (const _ of c)
        for (const i of mkArr(_ ?? []).flat().join(':').split(':'))
          {
            if (i === void 0 || i === '') continue;
            if (!(i in d)) return;
            d	= d[i];
          }
      return d;
    }
  conf_n(a,n,b)	{ return (n|0) || n==='0' ? n|0 : this.confn(a,n,b) }
  confn(...c)
    {
      const _ = this._conf(c);
      if (!_) return;
      for (const x of Object.keys(_))
        if (x|0 || x==='0') return x|0;
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
  running(src)
    {
      src.tell(`#A ${this._.late.length}`);
      for (const x of this._.late.iter())
        src.tell(`#A ${toJ(x)}`);
      for (const _ of Survey.dump())
        src.tell(`#B ${_}`);
      return;
    }
  *Cstop(c,src)
    {
      this.B.pathfinder.stop();
      this._.run.add(() =>
        {
          CON('stop');
          for (;;)
            {
              const x = this._.late.next();
              if (!x) break;
              src.tell(`#stopped ${toJ(x)}`);
            }
        });
      return this._.late.length;
    }
  *Ctp(c)
    {
      const p = (yield* c[0].locate())._;
//      this.B.entity.position = p;		// funktioniert nicht!
      return this.B.chat(`/tp ${p.x|0} ${p.y|0} ${p.z|0}`)
    }
  async *Cwait(c)	{ await this.B.waitForTicks((c[0]|0)||1) }
  *Cautostart(c,src)	{ this.autostart(c.join(' ')) }
  *Crun(c,src)		{ this._.run.add(...this.runcmd(c, src)) }
  *Cin(c,src)		{ const _ = c.shift(); const n = this.conf_n('set', _); if (n>=0) this._.late.add(n, c, src); else return `no ${_}: ${c.join(' ')}` }
  *Csay(c)		{ this.chat(...c) }
  *Cequip([d,i])	{ return i ? this.B.equip((i|0)>0 ? (i|0) : i._, d) : this.B.unequip(d) }
  *Cattack(c)		{ return this.B.attack(c[0]._) }
  async *Cdig(c)
    {
      const b	= c[0];
      const ok	= this.B.canDigBlock(b._);
      if (!ok) return yield `#cannot dig ${b}`;
      return await this.B.dig(b._);
    }

  *Cwho(c,src)		{ return new Player(src._) }
  *Cplayer(c,src)	{ return new Player(c[0] ?? src._) }
  *Cpos(c,src)		{ return new Pos(...(c.length ? c : [this.B.entity.position])) }
  async *Clocate(c,src)	{ const p = yield* c[0].locate(this); return c.length === 1 ? p : new Pos(p.vec(...(c.slice(1)))) }
  *Cdist(c,src)		{ return this.B.entity.position.distanceTo((yield* c[0].locate())._) }
  *Cbot()		{ return new Player(this._.botname) }
  *Chand()		{ return new Item(this.B.heldItem) }
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
  *Centities(c)		// list all entities of a given match (like: {type:'hostile'})
    {
      const me	= this.B.entity;
      const match = this.matcher(c) // , _ => _.type !== 'player');

      const r = [];
      for (const [k,v] of Object.entries(this.B.entities))
        if (match(v))
          {
            if (!v) console.error('entities?', k,v);
            r.push(v);
          }
      return r.map(_ => new Entity(_));
    }
  *Cchest(c)
    {
      const type = c[0];
      const r = [];
      for (const [id,v] of Object.entries(this.state.chest))
        { console.error('chest', {id,v}, type, v===type);
        if (v === type)
          {
            const pos	= p2v(id);
            const block	= this.B.blockAt(pos);
            if (v !== isChestyFn(block)(block)) continue;
            r.push({block,dist:this.B.entity.position.distanceTo(pos)});
        }
        }
      console.error(r);
      return r.sort((a,b) => a.dist < b.dist).map(_ => new Block(_.block));
    }
  *Csign(c)
    {
      const type = c.shift();
      const find = _ => this.find_sign(type, (({text,pos}, d) => { if (patternMatch(text[3])(_)) return _ }));
      const findMatch =_ => { const t = find(_); return t.length ? t : notEmpty(this._.match(_).map(find).flat()) };
      const signs = !c.length ? this.find_sign(type) :
        first(c, _ =>
          {
            const t = findMatch(_);
            return t ?? notEmpty(this.findList(_).map(findMatch).flat());
          });

      // .id	this.state.sign[.id] (id is stringified position)
      // .text	texts (lines) of sign
      // .stat	sign status
      // .valid	sign loaded and correct
      // .pos	position of sign
      // .block	block of sign
      // .dist	distance to bot
      // .match	return of match() function or true

      if (signs?.length)
        return signs.map(_ => new Sign(_));
    }
  // Get the block at a given position
  // Options are the 2nd argument:
  // 6:		get the 6 adjancent blocks around the given block
  // 7:		as 6 but with block
  // 18:	get all surrounding blocks without the diagonals
  // 19:	as 18 but with the block
  // 26:	get all surrounding blocks
  // 27:	get the full cube
  async *Cblock(c)
    {
      const p	= yield* (c[0].locate ? c[0] : new Pos(...c[0])).locate();
//      console.error('Block', p, c[0].toString());
      if (c.length === 1) return new Block(this.B.blockAt(p.vec()));

      const delta = (...d) => d.map(_ => new Block(this.B.blockAt(p.vec(_.x, _.y, _.z))));
      if (c.length === 2)
        switch (c[1])
          {
          default: throw `Block ${c}???`;
          case 6:	return delta({x:-1},{y:-1},{z:-1},{x:1},{y:1},{z:1});
          case 7:	return delta({},{x:-1},{y:-1},{z:-1},{x:1},{y:1},{z:1});
          case 27: return delta(...([0,-1,1].map(x => [0,-1,1].map(z => [0,-1,1].map(y => ({x,y,z})))).flat(3)));
          }

       const x	= c[1]|0;
       const y	= c[2]|0;
       const z	= c[3]|0;
       const r	= [];
       for (let a=-x; a<=x; a++)
         for (let b=-y; b<=y; b++)
           for (let c=-z; c<=z; c++)
             r.push(new Block(this.B.blockAt(p.vec(a,c,b))));
        return r;
    }
//  async *Copenchest(c)	{ return new Container(await this.B.openChest(c[0]._)) }
//  async *Copenfurnace(c)	{ return new Container(await this.B.openFurnace(c[0]._)) }
//  async *Copen(c)	{ return new Container(await this.B.openContainer(c[0]._)) }
  async *Copen(c)	{ return new Container(await this.B.openBlock(c[0]._)) }
  async *Copene(c)	{ return new Container(await this.B.openEntity(c[0]._)) }
  async *Cclose(c)	{ return await c[0].close() }
  async *Cj(c)		{ return toJ(c) }
  // sadly Iterator.reduce() and Iterator.flatMap() are not available in my NodeJS
  *Chave(c)		{ return Array.from(this.items(c[0])).reduce((a,i) => a+this.B.inventory.count(i.type, i.meta), 0) }
  *Citem(c)		{ return c.map(_ => Array.from(this.items(_))).flat() }
  // take slot
  // take container item count
  *Ctake(a)		{ const x = a.shift(); return a.length ? x.take(...a) : this.B.putAway(x) }
  // slot slot: get Item in slot (or void 0 if none)
  *Cslot(c)		{ return (this.B.currentWindow || this.B.inventory).slots[c[0]] }
  async *Cput([w,i,n])	{ return await w.put(i, n) }
  // place at block p with the given vector, by default onto the block below
  async *Cplace([p,dir])
    {
      const d	= DIR(dir??'d');
      const l	= (yield* (p ?? new Pos(this.B.entity.position)).locate()).vec(d);
      const b	= this.B.blockAt(l);
      return await this.B.placeBlock(b, INV(d));
    }


  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Assorted helpers, may vanish
  ////////////////////////////////////////////////////////////////////////////////////////////////

  *items(i, count)
    {
      if (i instanceof Item) return yield i;
      const get = _ => { const i = new this.B.ITEM(_, count|0); const r = new Item(i); return r }
      if (i|0) return yield get(i|0);
      if (!isString(i)) throw `unknown item spec: ${i}`;
      const have = {};
      for (const _ of this._.match(i, 'items'))
        {
          const id = this.B.mcData.itemsByName[_].id;
          if (have[id]) continue;
          have[id] = true;
          yield get(id);
        }
      if (!Object.keys(have).length)
        throw `unknown item: ${i}`;
    }

  matcher(c, fn)
    {
      const m = [];
      if (fn)
        m.push(fn);
      const sic = f => m.push(f);
      const not = f => m.push(_ => !f(_));
      for (let neg = sic; c.length; )
        {
          const x = c.shift();
          // note that x has a NULL prototype, as it is from another context
          if (isArray(x))			this._.match(...x).forEach(n => neg(_ => _.name === n));
          else if ('object' === typeof x)	Object.entries(x).forEach(([k,v]) => neg(_ => _[k] === v));
          else if (isFunction(x))		neg(x)
          else if (isString(x))			neg(_ => _[x]);
          else neg = x ? sic : not;		// true or false, following must be true or false, default true
        }
      return x => m.every(_ => _(x));
    }


  // create match object for items and blocks
  // with wildcards '*' it creates a list of matching Minecraft blocks and items
  match(..._)
    {
      _ = _.flat().filter(_ => _ !== void 0);	// .filter() is a hack to filter out void arguments
      if (!_.length) return () => true;
      const m = OB();
      while (_.length)
        {
          const a = _.shift();
          if (a.includes('*'))
            {
              this._.match(a).forEach(b => _.push(b));
              continue;
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

  *_set(x,create)
    {
      const p	= [];
      let d	= this.state;
      let m	= 'set';
      if (x !== void 0)
        for (const n=x.split(':'); n.length; )
          {
            const _ = n.shift();
            if (_ === '') continue;		// hack, ignore empty : or last : (allows to remove on first level, too)
            if (!(m in d) && !create)
              {
                yield [p, d, m];
                return `#missing entry ${p}`;
              }

            d	= d[m] ??= {};
            m	= _;
            p.push(m);
          }
      yield [p, d, m];
      return yield* rec(d[m], '', '');

      function* rec(o,_,b)
        {
          const p	= _ ? `${b}${_}:` : b;
          const x	= [];
          for (const [k,v] of Object.entries(o))
            if (!Object.keys(v).length)
              x.push(k);
            else
              yield* rec(v,k, p);
          if (!x.length)
            return;
          if (p)
            yield [p].concat(x);
          return x.join(' ');
        }
    }
  async *Ccopy(c, src)
    {
      const dest	= c.shift();
      const tell	= !dest || dest === ':' ? src.tell : _ => this.B.whisper(dest, _);

      if (!c.length)
        c.push('');
      for (const a of c)
        {
          const r = this._set(a);
          r.next();
          for (const [x,...y] of r)
            {
              console.log('copy', x,y);
              await tell(`set ${a}:${x} +${y.join(' +')}`);
              await tell(`set ${a}:${x} +${y.join(' +')}`);
              await tell(`set ${a}:${x} +${y.join(' +')}`);
              await tell(`set ${a}:${x} +${y.join(' +')}`);
              await tell(`set ${a}:${x} +${y.join(' +')}`);
            }
        }
    }

  // set list[:sublist] [+-=]value
  *Cset(c)
    {
      const x		= c.shift();
      const r		= this._set(x, c.length);
      const n		= r.next();
      const [p,d,m]	= n.value;

      if (!c.length)
        {
          if (!(m in d))
            return this._.log('#missing entry', p);
          for (;;)
            {
              const x	= r.next();
              if (x.done)
                return x.value;		// return value
              yield x.value.join(' ');
            }
        }

      let v	= d[m] ?? {};
      const o	= toJ(v);
      while (c.length)
        {
          const [_,x]	= VAL(c.shift());
          switch (_)
            {
            case '-':	delete v[x];		break;
            case '=':	v	=   {[x]:{}};	break;
            case '+':	v[x]	??= {};		break;
            }
        }
      if (toJ(v) === o)
        return yield `# ${p} unchanged`;

      this.listcache = OB();	// clear cache

      d[m]		= v;
      this.state.set	= this.state.set;	// save state change
      return yield `# ${p} updated`;
    }

  // drop		drop all (default)
  // drop name..	drop all of the given names or displayName
  // This never drops what is set in item.X.keep
  async *Cdrop(c)
    {
      const test = this.match(c);
      const r = OB();
      for (const i of this.B.inventory.items())
        {
          if (this._.search('item', i.name,        'keep')) continue;
          if (this._.search('item', i.displayName, 'keep')) continue;
//          CON(i);
          if (!test(i.name) && !test(i.displayName)) continue;
          //yield `#dropping ${i.count} ${i.name} ${i.displayName}`;
          await this.B.tossStack(i);
          r[i.name] = (r[i.name]|0) + i.count;
        }
      const x = Object.entries(r).map(([a,b])=>`${a}=${b}`).join(' ');
      if (x)
        return `#drop ${x}`;
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

              const x = self.rem.sign[k];

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
      yield `#path move:${BOO(f.isMoving())} mine:${BOO(f.isMining())} build:${BOO(f.isBuilding())}`;
      yield `#path think:${f.thinkTimeout} tick:${f.tickTimeout} search:${f.searchRadius}`;
      yield `#food:${B.food|0} sat:${B.foodSaturation|0} oxy:${B.oxygenLevel|0} eat:${BOO(B.autoEat.enabled)}`;
      yield `#pos: ${POS(B.entity.position)} health:${B.health}`;
    }
  async *Ceat(c)
    {
      yield* this.get(c);
      try {
        await B.autoEat.eat();
      } catch (e) {
        yield `#eat fail (food=${B.food}): ${e}`;
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
              yield `#list ${k.substr(1)}`;
          return;
        }
      const l = c.shift();
      const f = `L${l}`;
      if (!(f in this))
        return yield `#unknown list: ${l}`;
      try {
        let n = 0;
        for await (const r of this[f](c))
          {
            n++;
            yield `# ${r}`;
          }
        yield `#(${n} ${l})`;
      } catch (e) {
        yield `#list ${l} error: ${e}`;
        console.error(e);
      }
    }
  *Llist(c)
    {
      if (c.length)
        for (const _ of c)
          yield toJ(Array.from(this.theList(_)));
      else
        yield toJ(Object.keys(this.state.set.list));
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
      for (const s of (this.B.currentWindow || this.B.inventory).slots)
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
  const state = (await _.state).set.conf?.web;
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

  log(..._)	{ if (!this.state.set?.conf?.quiet) console.log(..._) }
  get chat()	{ return (...a) => this.Chat(...a) }
  Chat(...s)
    {
//      DD('chat', s);
      const _ = s.map(_ => `${_}`).join(' ');
      this.log('SAY:', _);
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
      const mcData = this.B.mcData;
      if (!mcData)	return [];
      if (!what.length)	what	= ['items','blocks'];
      return this.#match[`${toJ(m)} ${toJ(what)}`] ??= (pattern =>
        {
          const o = OB();
          for (const _ of what)
            for (const a of Object.keys(mcData[`${_}ByName`]))
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
      Wrap(B, 'emit', LogOnce('emit'));		// DEBUG to see what emit() are available
      //B.settings.enableServerListing = false;		// does not work
      DEBUG.split(' ').forEach(_ => B.on(_, (...a) => this.log('D', _, ...(a.map(_ => DUMP(_, 2))))));

      //CURRENT.chat	= (..._) => this.Chat(..._);

      // keep (load) the state
      const State = require('./State.js');
      this._save = () => State.save();

      this.state	= State(this.botname);		// No load state on spawn, the last write might be delayed
      this._inited	= PO();

      // initialize Bot as soon as it is online the first time
      B.once('spawn', async () =>
        {
          DD('firstspawn', 'start');
//          B.loadPlugin(pathfinder.pathfinder);
//          B.loadPlugin(pvp.plugin);
          await (await IMPORTS)(B); //.then(_ => console.log(`${_.length} asynchronous plugin(s)`));

          B.mcData	= require('minecraft-data')(B.version);
          B.ITEM	= require('prismarine-item')(B.version);

          await this._inited.p;
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
      this.late	= new Q('L');

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

  // XXX TODO XXX refactor into cmd/

/* No more needed:
  M_startedAttacking() { this._attack = 1 }
  M_stoppedAttacking() { this._attack = 0 }
  M_attackedTarget()	{ this.log('attack', _) }
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
  M_soundEffectHeard(n,p,v,s)	{ this.log('ESND', n,p,v,s) }
  M_hardcodedSoundEffectHeard(i,c,p,v,s)	{ this.log('HSND', i,c,p,v,s) }
  M_time()			{ D('time') }				// each second
  M_physicsTick()		{ D('tick') }				// each tick (20 per second)
  M_blockPlaced(orig, now)	{ this.log('P', orig.name, now.name) }
  M_blockUpdate(orig, now)
    {
      if (isSign(now)   || isSign(orig))   this.abi.Sign(now);
      if (isChesty(now) || isChesty(orig)) this.abi.Chest(now);
      if (orig.name !== now.name) this.log('U', orig.name, now.name);
    }
//  M_entityGone(x)		{ this.log('G', this.ENTITY(x)) }
    M_entityDead(x)		{ this.log('D', this.ENTITY(x)) }

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
//      this.runner(this.src(), () => this.abi._attack(Object.keys(a)));
//    }
  // XXX TODO XXX make this generic to subscribe to certain messages with a timeout
  M_messagestr(str, who, data)
    {
      this.log('CHAT:', toJ(who), str);
      data?.json && this.abi.runwant(data.json.translate, () => MJ(data))
    }

  M_chunkColumnLoad(_)		{ this.chunk.add(_.x|0, _.z|0) }
  M_whisper(src, cmd)
    {
//      console.error('WHISPER', src, cmd);
      if (src === this.B.player.username) return;
      const c = cmd.split(' ').filter(_ => _);
      if (c[0] === '') return;
      if (c[0][0] === '#') return console.log(cmd);

      src = this.src(src);

      if (c[0][0] === '!')
        return this.abi.running(src);

      c[0] = c[0].toLowerCase();
      if (/[^a-z]/.test(c[0])) return src.tell(`#invalid command: ${c[0]}`);
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
      if (!state.chest)	state.chest	= {};
      if (!state.set)	state.set	= {};

      await this._save();

      this._inited.o(this.B);
      console.error('WAIT');
      await IMPORTS;	// make sure all plugins are loaded
      console.error('HERE');

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
          while (this.run.length>1) this.run.next()[1](); // ignore all this.run but the last queued one
          if (this.run.length)
            x[1] && x[1][1]();				// stop current this.run if anotherone waits
          else if (!this.run.active)
            {
              const _ = this.late.peek();
              if (_)
                {
                  const n = _[0];
                  if (!n)
                    {
                      this.late.next();
                      CON('LATE', _[1]);
                      this.run.active = true;	// HACK
                      this.run.add(...this.abi.runcmd(_[1], _[2]));
                    }
                  else if (n !== (_[0]=true))
                    {
                      CON('LATE:', n, _[1]);
                      setTimeout(() => _[0]=0, n);
                    }
                }
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

          if (this.state.set.conf?.verbose)
            X(`${x.map((_,i) => _ ? String.fromCodePoint(p+i)+r[i].debug : '').join('') || '@'}`);
          await Promise.any(a);
          p	= 162 - p;
        } while (this.abi === abi);
    }
  };

// XXX TODO XXX get rid of _PARM_
new Bot(_PARM_.NAME, _PARM_.HOST, _PARM_.PORT);

