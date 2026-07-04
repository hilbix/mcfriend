// CACHE list
// CACHE get TAG what
// CACHE set TAG what data..
// CACHE del TAG wha
// CACHE clear

this.cache	??= {};

const	cmd	= _.shift();
const	tag	= _.shift();
let	id	= _.shift();

switch (cmd)
  {
  case 'list':	return cache;
  case 'clear':	return this.cache={};
  }

if (isMy(id))
  id = (yield ['locate', id]).id;

switch (cmd)
  {
  default:		throw `unknown ${cmd}`;
  case 'get':		return cache[tag]?.[id];
  case 'set':		(cache[tag] ??= {})[id] = _; return;
  case 'del':		delete cache[tag]?.[id]; return;
  }

