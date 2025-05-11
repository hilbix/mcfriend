// find a safe spot
//
// Args: distance blocks..
//
// returns 3 values:
// block	nearest safe spot
// false	you do not need to move
// void 0	nothing found

// 1 breathable and you cannot stand on it
// 2 breathable and you perhaps can stand on it (depending on block state)
// 3 breathable and you can stand on it
// 4 non-breathable you can stand on
// 5 non-breathable you perhaps can stand on (depending on block state)
// 6 non-breathable you cannot stand on

const K =
  { air				: 1
  , cave_air			: 1
  , bubble_column		: 1
  , chest			: 2
  , barrel			: 2
  , lectern			: 1
  , torch			: 1
  , wall_torch			: 1
  , lantern			: 1
  , soul_torch			: 1
  , end_rod			: 2
  , flower_pot			: 1
  , scaffolding			: 2
  , oak_sign			: 1
  , spruce_sign			: 1
  , birch_sign			: 1
  , jungle_sign			: 1
  , acacia_sign			: 1
  , dark_oak_sign		: 1
  , mangrove_sign		: 1
  , cherry_sign			: 1
  , bamboo_sign			: 1
  , crimson_sign		: 1
  , warped_sign			: 1
  , oak_hanging_sign		: 1
  , spruce_hanging_sign		: 1
  , birch_hanging_sign		: 1
  , jungle_hanging_sign		: 1
  , acacia_hanging_sign		: 1
  , dark_oak_hanging_sign	: 1
  , mangrove_hanging_sign	: 1
  , cherry_hanging_sign		: 1
  , bamboo_hanging_sign		: 1
  , crimson_hanging_sign	: 1
  , warped_hanging_sign		: 1
  , grass			: 1
  , fern			: 1
  , dead_bush			: 1
  , dandelion			: 1
  , poppy			: 1
  , blue_orchid			: 1
  , allium			: 1
  , azure_bluet			: 1
  , red_tulip			: 1
  , orange_tulip		: 1
  , white_tulip			: 1
  , pink_tulip			: 1
  , oxeye_daisy			: 1
  , cornflower			: 1
  , lily_of_the_valley		: 1
  , wither_rose			: 1
  , sunflower			: 1
  , lilac			: 1
  , rose_bush			: 1
  , peony			: 1
  , mushroom			: 1
  , crimson_fungus		: 1
  , warped_fungus		: 1
  , sea_pickle			: 1
  , sea_grass			: 1
  , tall_sea_grass		: 1
  , short_grass			: 1
  , glow_lichen			: 1
  , oak_leaves			: 1
  , birch_leaves		: 1

  , brown_mushroom		: 1
  , vine			: 1
  , jungle_wall_sign		: 1
  , redstone_wire		: 1
  , repeater			: 1
  , comparator			: 1
  , redstone_wall_torch		: 1
  , lever			: 1
  , rail			: 1
  , powered_rail		: 1
  , cobweb			: 1
  , oak_fence			: 1
  , bamboo			: 1
  , jungle_leaves		: 1
  , spruce_fence		: 1
  , cocoa			: 1
  , lightning_rod		: 1
  , fire			: 6
  , red_mushroom		: 1
  , ladder			: 2
  , nether_portal		: 1

// UNKLAR

  , glowstone			: 4
  , cauldron			: 5
  , ancient_debris		: 4

  , diorite_slab		: 4
  , nether_gold_ore		: 4
  , nether_quartz_ore		: 4
  , blackstone_slab 		: 4
  , hopper			: 4
  , redstone_lamp		: 4
  , dispenser			: 4
  , dropper			: 4
  , jukebox			: 4
  , cobblestone_wall		: 4
  , farmland			: 4
  , composter			: 4

  ,  seagrass: 1,
  tall_seagrass: 1,
  tall_grass: 1, 
  acacia_leaves: 1,                                                                                                                                                                                                                                           
  acacia_log: 4                                                                                                                                                                                                                                               
  , sugar_cane			: 1
  , raw_copper_block		: 4


// UNKLAR end
  , jungle_trapdoor		: 3
  , amethyst_cluster		: 4
  , budding_amethyst		: 4

  , oak_planks			: 4
  , deepslate_coal_ore		: 4
  , emerald_ore			: 4
  , coarse_dirt 		: 4

  , jungle_log			: 4

  , dirt			: 4
  , grass_block			: 4
  , tuff			: 4
  , coal_ore			: 4
  , cobblestone_slab		: 4

  , gravel			: 5
  , sand			: 5

  , water			: 6

  , cobblestone			: 4
  , clay			: 4

  , deepslate_diamond_ore	: 4
  , deepslate_gold_ore		: 4
  , deepslate_redstone_ore	: 4
  , deepslate_copper_ore	: 4
  , deepslate_lapis_ore		: 4
  , deepslate_iron_ore		: 4

  , infested_deepslate		: 4
  , infested_stone		: 4

  , smooth_basalt		: 4
  , calcite			: 4

  , diamond_ore			: 4
  , gold_ore			: 4
  , redstone_ore		: 4
  , copper_ore			: 4
  , lapis_ore			: 4
  , iron_ore			: 4

  , birch_log			: 4
  , oak_log			: 4

  , stone			: 4
  , granite			: 4
  , polished_granite		: 4
  , diorite			: 4
  , polished_diorite		: 4
  , andesite			: 4
  , polished_andesite		: 4
  , deepslate			: 4
  , cobbled_deepslate		: 4
  , polished_deepslate		: 4
  , bedrock			: 4
  , obsidian			: 4
  , end_stone			: 4
  , netherrack			: 4
  , lava			: 6
  , magma_block			: 5
  , crying_obsidian		: 4
  , nether_bricks		: 4
  , red_nether_bricks		: 4
  , blackstone			: 4
  , basalt			: 4
  , packed_mud			: 4
  , mud_bricks			: 4
  , bricks			: 4
  , stone_bricks		: 4
  , mossy_stone_bricks		: 4
  , cracked_stone_bricks	: 4
  , chiseled_stone_bricks	: 4
  , iron_block			: 4
  , gold_block			: 4
  , diamond_block		: 4
  , emerald_block		: 4
  , netherite_block		: 4
  , copper_block		: 4
  , amethyst_block		: 4
  , lapis_block			: 4
  , redstone_block		: 4
  , coal_block			: 4
  , glass			: 4
  , tinted_glass		: 4
  , ice				: 4
  , blue_ice			: 4
  , packed_ice			: 4
  , frosted_ice			: 4
  , snow_block			: 5
  , honey_block			: 4
  , slime_block			: 4

  , bookshelf			: 4
  , crafting_table		: 4
  , furnace			: 4
  , blast_furnace		: 4
  , smoker			: 4
  , loom			: 4
  , cartography_table		: 4
  , fletching_table		: 4
  , smithing_table		: 4
  , stonecutter			: 4

  , anvil			: 4
  , chipped_anvil		: 4
  , damaged_anvil		: 4

  , enchanting_table		: 4

  , grindstone			: 4
  , barrier			: 4
  };

const unk = {};

// Is a block breathable?
const isBreath	= _ =>
  {
//    if (isAir(_)) return true;
//    if (_.name.endsWith('sign')) return true;
//    if (_.name.endsWith('torch')) return true;
//    if (_.name.endsWith('sapling')) return true;

    const k = K[_.name];
    if (k !== void 0) return k < 4;

    console.error('unknown block', _.name);
    unk[_.name] = 1;
    return false;
  };

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

const unsafe	= {lava:true, water:true};
const mypos	= yield ['pos'];

const dist = (_.shift()|0) || 2;
for (const b of _.length ? _ : [mypos])
  {
    if (_.length && b.dist(mypos) <= dist) return false;
    let min;

    const a = yield ['block', b.pos(-dist, -dist-1, -dist), b.pos(+dist, +dist+1, +dist)];
    const aa = [];
    for await (const _ of a())
      if (_.dist(mypos)>1)		// must not be our current position
        aa.push(_);
    const c = new MultiDimArray(_ => { const v = _._vec; if (v) return [v.x, v.y, v.z] }).append(aa);

    let candid;
    for (const [[x,y,z],v] of c.entries())
      {
//        console.error('L', x,y,z, v.id, b.pos());
        if (!v) throw `internal error ${[x,y,z]}`;
        if (!isBreath(v)) continue;
        const d = c.get(x,y-1,z);
//        console.error('D', d?.id);

        if (!d || isAir(d) || unsafe[d.id]) continue;

        const e = d.dist(b);
        if (e < 0.1) continue;
        if (min && e > min) continue;

        candid	= v;
        min	= e;
      }
    console.error('CANDID', candid?.vec(), unk);
    if (candid)
      return candid;
  }

