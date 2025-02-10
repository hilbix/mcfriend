// CACHE clear
// CACHE get TAG what
// CACHE set TAG what
// CACHE del TAG what

this.cache	??= {};

const cmd	= _.shift();
const tag	= _.shift();

switch (cmd)
  {
  case 'list':	return cache;
  case 'clear':	return cache={};
  }

const id = (yield ['locate', _]).id;

//yield ['act CACHE', tag, id, cache[id]?.[tag]];

switch (cmd)
  {
  default:		throw `unknown ${cmd}`;
  case 'get':		return cache[tag]?.[id];
  case 'set':		(cache[tag] ??= {})[id] = true; return;
  case 'del':		delete cache[tag]?.[id]; return;
  }

