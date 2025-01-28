// bug [message]

//try {
//} catch (cause) {
//  console.error('HERE', cause);
//  throw new Error('FAIL', {cause});
//}

//try {
//} catch(e) {
//  return ['x'];
//}
//

throw new Error(`BUG: ${_.join(' ')}`);

function* x()
{

console.log('AAAAAAAAAAAAAAAA');
console.log('AAAAAAAAAAAAAAAA');
console.log('AAAAAAAAAAAAAAAA');

}

try {
  yield* x();
} catch (e) {
  console.warn('----------------');
  console.error('AAAAAAAAAAAAAAAAAAAAAA', e);
  console.warn('----------------');
  throw e;
}

