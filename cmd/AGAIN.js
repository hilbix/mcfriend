// Do something again
//	what [value]
// if value 0 then stop the backoff

this.backoff = {};

const w	= _.shift();
if (!w) return;

const t = (yield [`set auto:${w}:wait`])|0;
console.error('AGAIN', t);
if (!t) return;

if (_.length)
  {
    console.error('backoff', _);
    backoff[w] = _[0]|0;
    return;
  }

const b	= (yield [`set auto:${w}:backoff`])|0;
const m	= (yield [`set auto:${w}:maxwait`])|0;

let d = backoff[w] ??= 0;
if (d>m)
  d	= m;
if (d<t)
  d	= t;
backoff[w] = d+b;

yield ['in', d, w];
return d

