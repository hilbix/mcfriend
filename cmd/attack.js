//

for (;; await sleep(700))
  {
    const x = yield ['Attack', _];
    if (x === void 0) continue;
    yield x;
    break;
  }

