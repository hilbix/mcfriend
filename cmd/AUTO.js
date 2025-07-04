// AUTOSTART
//
// This runs when the bot joins

yield ['wait 20'];

//yield ['act AUTOSTART', _];
yield ['hide Error: destination full'];

yield yield ['stop'];

// enter the right dimension
if (yield ['CACHE get current dim'])
  yield ['CACHE del current dim'];
else
  {
    yield yield ['home'];
    for (const dim = (yield [`set conf:bot:${ME}:dim`]); dim && (yield ['PORT', dim]); yield ['wait 100']);
  }

yield yield ['PUT'];
yield yield ['home'];
yield yield ['drop'];

// This is wrong.
//
// The right thing is a list of creatures to automatically attack with priority.
// Then register the list and trigger autoattack in case such a creature shows up.
if (yield ['set conf:stop'])
  yield 'AUTOSTART disabled (conf:stop)';
else
  { // old
    for (const _ of (yield ['set auto:'])?.split(' ') ?? [])
      if ((yield [`set auto:${_}:bot:${ME}`]) && !(yield [`set auto:${_}:stop`]))
        yield [`in auto:${_}:start ${_}`];
    for (const _ of (yield [`set bot:${ME}:auto:`])?.split(' ') ?? [])
      if (!(yield [`set auto:${_}:stop`]))
        yield [`in auto:${_}:start ${_}`];
  }

return 'AUTOSTART ok';

