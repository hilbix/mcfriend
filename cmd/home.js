// Send the bot home
// (and optionally say something)

if (_.length) yield ['act', _];
return yield ['Move', yield ['sign home']];

