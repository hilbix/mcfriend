// find a safe spot
//
// Args: distance blocks..
//
// returns 3 values:
// block	nearest safe spot
// false	you do not need to move
// void 0	nothing found

// Multi dimensional array (with integer index)
class MultiDimArray extends Array
  {
  #map;

  constructor(map, ...iter)
    {
      super();
      this.#map	= map;
      this.append(...iter);
    }
  append(...arr)
    {
      for (const iter of arr)
        for (const _ of iter)
          this.add(_);
      return this;
    }
  add(...elems)
    {
      for (const e of elems)
        {
          const m = this.#map(e);
          if (m)
            this.set(e, ...m);
        }
      return this;
    }
  set(e, ...k)
    {
      if (!k.length)
        throw `no indexes: ${k}`;
      const _ = k.shift()|0;

      if (k.length)
        (this[_] ??= new MultiDimArray()).set(e, ...k);
      else if (_ in this)
        throw `already set: ${k}`;
      else
        this[_] = e;
      return this;
    }
  get(...k)
    {
      const x = k.shift()|0;
      if (!(x in this)) return;
      const v = this[x];
//      console.error('X', x);
      if (v === void 0) throw `internal-error ${x}: ${k}`;
      return k.length ? v.get(...k) : v;
    }
  *[Symbol.iterator]()
    {
//      console.error('ITER', this);
      for (const [k,v] of this.entries())
        yield v;
    }
  *keys()
    {
      for (const [k,v] of this.entries())
        yield k;
    }
  *entries()
    {
//      const f = Array.prototype.keys.call(this).next();
      const f = Array.prototype[Symbol.iterator].call(this).next();
//      console.error('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', f, this[f.value], f.value in this);
      for (const _ in this) //of Array.prototype[Symbol.iterator].call(this))
        {
          if (!(_ in this)) throw `WTF1? ${_}`;
          if (`${(_|0)}` !== _) throw `WTF2? ${_}`;
          const a = this[_];
          if (a instanceof MultiDimArray)
            for (const [k,v] of a.entries())
              yield [[_, ...k], v];
          else
            yield [[_], a];
        }
//      return this;
    }
  };

// where is it safe to stand?
// two air with 1 not dangerous block below
// with a distance of max 5
//

const unsafe = {lava:true, water:true};

const mypos = yield ['pos'];

const dist = (_.shift()|0) || 1;
for (const b of _.length ? _ : [mypos])
  {
    if (_.length && b.dist(mypos) <= dist) return false;
    let min;

    const a = yield ['block', b.pos(-dist, -dist-1, -dist), b.pos(+dist, +dist+1, +dist)];
    const c = new MultiDimArray(_ => { const v = _._vec; if (v) return [v.x, v.y, v.z] }).append(a());

    let candid;
    for (const [[x,y,z],v] of c.entries())
      {
//        console.error('L', x,y,z, v.id, b.pos());
        if (!v) throw `internal error ${[x,y,z]}`;
        if (!isAir(v)) continue;
        const d = c.get(x,y-1,z);
//        console.error('D', d?.id);

        if (!d || isAir(d) || unsafe[d.id]) continue;

        const e = d.dist(b);
        if (e < 1) continue;
        if (min && e > min) continue;

        candid	= v;
        min	= e;
      }
    console.error('CANDID', candid?.vec());
    if (candid)
      return candid;
  }

