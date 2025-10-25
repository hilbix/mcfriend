// JUMP block [babble..]
//
// Teleport calling player to block

const b = yield ['SPOT', 2, _[0]];
yield yield ['say /tp', src._, (yield ['locate', b || _[0]]).id];
return ['act to', _];

