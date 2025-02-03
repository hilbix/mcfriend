// AUTOSTART
//
// This runs when the bot joins

await sleep(1);

yield ['act AUTOSTART', _];

// This is wrong.
//
// The right thing is a list of creatures to automatically attack with priority.
// Then register the list and trigger autoattack in case such a creature shows up.
yield ['in auto:attack:enabled attack'];

return 'AUTO ended';

