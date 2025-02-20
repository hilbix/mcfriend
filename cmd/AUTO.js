// AUTOSTART
//
// This runs when the bot joins

await sleep(1);

yield ['act AUTOSTART', _];
yield ['hide Error: destination full'];

yield yield ['stop'];
yield yield ['home'];
yield yield ['drop'];

// This is wrong.
//
// The right thing is a list of creatures to automatically attack with priority.
// Then register the list and trigger autoattack in case such a creature shows up.
//for (const a of 
yield ['in auto:attack:enabled attack'];
yield ['in auto:take:enabled take'];
yield ['in auto:tree:enabled tree'];
yield ['in auto:harvest:enabled harvest'];

return 'AUTO ended';

