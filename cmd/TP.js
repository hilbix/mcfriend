// Teleport somewhere and wait until you arrive

const p = yield ['locate', _];
//yield ['act tp', _, p];
yield yield ['tp', p];
for (let i = 100; --i>=0; await sleep(10))
  {
    const d = yield ['dist', p];
    if (d<4)
      return;
  }

yield ['act teleport to', p, 'failed', yield ['pos']];

