// setSign block N text
// N=0: last line of front
// N=1: first line of back
// N=4: last line of back

// .id        this.state.sign[.id] (id is stringified position)
// .text      texts (lines) of sign
// .stat      sign status
// .valid     sign loaded and correct
// .pos       position of sign
// .block     block of sign
// .dist      distance to bot
// .match     return of match() function or true

const sign	= _.shift();
const line	= _.shift();
const text	= _.join(' ');

console.error('setSign', sign.id, line, text);

if (!sign.id.endsWith('_sign'))	throw 'not a sign';
if (!sign.valid)		throw 'sign is not valid';
if (line<0 || line>4)		throw 'line must be 0 to 4';
  
const p = sign._.pos;

yield ['say /data modify block', p.x,p.y,p.z, `${line?'back':'front'}_text.messages[${(line || 4)-1}] set value ${toJ(toJ({text}))}`];

