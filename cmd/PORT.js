// Enter nether
//
// Needs a sign 'portal' 'nether' etc
// returns nothing if ok, else failure cause (not yielded itself!)

const D	= { world:'overworld', nether:'the_nether' };
const E = { overworld:'the_nether', the_nether:'overworld' };
_[0]	= _.length ? D[_[0]] ?? _[0] : E[dimension];

yield ['CACHE set current dim', _];

if (dimension === _[0]) return;

yield ['verbose I am in', dimension, 'and go to', _];

const p	= yield ['sign portal', _];
if (!p)
  return ['act unknown', _];

for (const nether of p)
  {
    const b	= (yield ['block', nether, 6]).filter(_ => _.name === 'obsidian');
    if (b.length !== 1)
      {
        yield ['act invalid', nether, b];
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
        yield ['Move', l.pos(3,0,3)];
        yield yield ['wait', 10];
      }
    yield ['Move', l];
    // now check we are in nether
    yield ['wait', 200];	// this does not return as we get a new Spawn event
    return ['note entering', nether, 'failed'];
  }

return ['act no suitable portal found to', _];

function* scan(b, x,y,z, what)
{
  for (let t=b; (t=yield ['block', t.pos(x,y,z)])?.name === what; b=t);
  return b;
}

