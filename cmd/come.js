//		run to you
// Player	run to the given player
// sign Sign	run to the given sign
// X Y Z	run to coordinates

const loc = yield [
  { 0: 'who'
  , 1: 'player'
  , 2: _[0] === 'sign' ? 'sign' : `wtf Please start sign search with "sign" and not`
  , 3: 'pos'
  }[_.length] ?? `wtf wrong number of arguments ${_.length}:`
  , _
  ];

const pos	= yield ['locate',loc];
const dist	= yield ['dist', pos];
if (3 > dist) return ['act I am only', Math.ceil(dist), 'blocks away at', pos];

return ['Move', pos.pos(0,0.6,0), 2];

