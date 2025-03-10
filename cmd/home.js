// Send the bot home
// (and optionally say something)

if (_.length) yield ['act', _];
const p = yield ['sign home'];
if (!p) return yield 'cannot find sign home';
return yield ['Move', p];

