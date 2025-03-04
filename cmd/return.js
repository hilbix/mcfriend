// BOT to BOT communication (Creturn)

const t = _.shift();
return yield ['say /tellraw', src._, toJ(`return ${t} ${toJ(yield _)}`)];

