// AUTOSTART
//
// This runs when the bot joins

await sleep(1);

yield ['act AUTOSTART', _];
yield ['hide Error: destination full'];

yield yield ['stop'];
yield yield ['PUT'];
yield yield ['home'];
yield yield ['drop'];

// This is wrong.
//
// The right thing is a list of creatures to automatically attack with priority.
// Then register the list and trigger autoattack in case such a creature shows up.
if (yield ['set conf:stop'])
  yield 'autostart disabled (conf:stop)';
else
  for (const _ of 'attack take tree harvest'.split(' '))
    yield [`in auto:${_}:enabled attack`];

return 'AUTOSTART ok';

