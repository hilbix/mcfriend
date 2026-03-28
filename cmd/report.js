// reporting system
//
// BOT: report [{cmd, pos}] text
//
// You:
// report
// report ON
// report OFF
// report BOT

this.reports	??= [];
this.reported	??= {};
this.enable	??= false;

if (_.length>1)
  {
    const o = 'object' === typeof _[0] ? _.shift() : {};
    _.unshift(PARENT);
    const j = _.map(_ => `${_}`).join(' ');
    const r = reported[j] ??= [0];
    if ((r[0]+=1) === 1)
      {
        reports.push(j);
        if (enable)
          yield ['act REPORT', _];
      }
    if (Object.keys(o).length)
      {
        const j = toJ(o);
        for (const t of (reported[j] ??= []))
          if (toJ(t) === j)
            return;
        reported[j].push(o);
      }
    return;
  }

function* jump(k)
{
  for (const x of reports)
    for (const y of reported[x])
      if (y.pos)
        return yield ['say /tp', src._, (yield ['locate', y.pos]).id];
  return yield ['act no reports with position'];
}

const a = _[0];
switch (a)
  {
  case 'ON':	enable	= true; return;
  case 'OFF':	enable	= false; return;
  case 'CLR':	reports = []; reported = {};
  case void 0:
    return yield ['act REPORT', enable ? 'ON' : 'OFF', this.reports.length];
  }

if (!reports.length)
  return yield ['act no reports'];

switch (a)
  {
  case 'j': return yield* jump();
  }

let n = (a|0) || 10;

for (const x of reports)
  {
    const r = reported[x];
    yield ['act', r.length, r[0], x];
    if (--n<0)
      break;
  }

