
this.hist ??= [];

const cmd =_.map(_ => 'string' === typeof _ && _.length === 2 && _[0]==='$' ? hist[_[1]|0][0] : _);
hist.unshift([yield cmd, cmd]);
if (hist.length>10) hist.pop();
return [ 'act result:', toJ(hist[0][0]), 'cmd:', toJ(hist[0][1]) ];

