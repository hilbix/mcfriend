// Teleport somewhere and wait until you arrive

try {
  const p = yield ['locate', _];
  //yield ['act tp', _, p];
//  yield yield ['say /gamemode spectator'];
  yield yield ['tp', p];
  for (let i = 100; --i>=0; await sleep(10))
    {
      const d = yield ['dist', p];
      if (d<4)
        return;
    }
  
  yield ['act teleport to', p, 'failed', yield ['pos']];
} finally {
//  yield yield ['say /gamemode survival'];
}
