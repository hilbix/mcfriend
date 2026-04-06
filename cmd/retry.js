// retry [count] command

let r=3, err;
if (`${_[0]|0}` === `${_[0]}`)
  r = _.shift()|0;

while (--r>=0)
  {
    try {
      yield _;
      return 1;
    } catch (e) {
      console.error('retry', _, e);
      err = `${e}`;
      yield [ 'wait', 3 ];
    }
  }

yield ['act retry failed:', _, err];

