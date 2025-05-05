// break needs 2 signs which define the area
//
// within the AREA the given blocks are broken
// Use the full area.
//
// Note:  This might break blocks the sign is on!

const keep = {lava:true, water:true};
const nix = { air:1, cobblestone_slab:1, cave_air:1, torch:1, wall_torch:1 };

const b = yield ['AREA break'];
if (!b) return 'act no area yet';

for (const a of b)
  {
    yield ['act breaking', a];
    const iter = yield ['block', a[0], a[1]];
    console.error('break.sh:', iter);
    yield yield ['DIG', iter, a[0].text[3]];
  }

