// reporting system
//
// BOT: report WHAT report
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
    const j = _.map(_ => `${_}`).join(' ');
    if (1 === (reported[j] = 1+(reported[j]|0)))
      {
        reports.push(j);
        if (enable)
          yield ['act REPORT', _];
      }
    return;
  }

switch (_[0])
  {
  case 'ON':	enable	= true; return;
  case 'OFF':	enable	= false; return;
  case 'CLR':	reports = []; reported = {};
  case void 0:
    return yield ['act REPORT', enable ? 'ON' : 'OFF', this.reports.length];
  }

if (!reports.length)
  return yield ['act no reports'];

let n = (_[0]|0) || 10;

for (const x of reports)
  {
    yield ['act REPORT', ME, x];
    if (--n<0)
      break;
  }

