// BOT to BOT communication (Creturn)

const t	= _.shift();
const s	= toJ(yield _);
const l	= s.length;
const k	= 200;
for (let i=0; i<l; i+=k)
  yield ['say /tellraw', src._, toJ(`return ${t} ${l} ${i/k} ${s.substr(i,k)}`)];

