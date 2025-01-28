// [range..]	output random from 0..range, can be given multiply

if (!_.length) _.push(100);
yield ['act random:', _.map(_ => Math.floor(Math.random() * _))];

