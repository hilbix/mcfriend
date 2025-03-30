// Enter nether
//
// Needs a sign 'portal' 'nether' etc
// returns nothing if ok, else failure cause (not yielded itself!)

const D	= { world:'overworld', nether:'the_nether' };
const E = { overworld:'the_nether', the_nether:'overworld' };
_[0]	= _.length ? D[_[0]] ?? c[0] : E[dimension];
if (dimension === _[0]) return;

yield ['act I am in', dimension, 'and go to', _];

const p	= yield ['sign portal', _];
if (!p)
  return ['act unknown', _];

for (const nether of p)
  {
    const b	= (yield ['block', nether, 6]).filter(_ => _.name === 'obsidian');
    if (b.length !== 1)
      {
        yield ['act invalid', nether];
        continue;
      }
    // find lowest portal block
    const p	= (yield ['block', b, 6]).filter(_ => _.name === 'nether_portal');
    if (!p.length)
      {
        yield ['act offline portal', b];
        continue;
      }
    const l	= yield* scan(p[0], 0,-1,0, 'nether_portal');
    if ((yield ['dist', l]) < 3)
      {
        yield yield ['Move', l.pos(3,0,3)];
        yield yield ['wait', 10];
      }
    yield yield ['Move', l];
    // now check we are in nether
    yield ['wait', 200];	// this does not return as we get a new Spawn event
    return ['act entering', nether, 'failed'];
  }

return ['no suitable portal to', _, 'found'];

function* scan(b, x,y,z, what)
{
  let l	= b;
  for (let t; t=(yield ['block', l.pos(x,y,z)]) && t?.name === what; l=t);
  return l;
}

