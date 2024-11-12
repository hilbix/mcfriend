# Issues

## `prismarine-viewer`

How to build this myself?

- `npm i` fails after `git clone`
  - I tried to follow the CI rules, but this failed, too.

### `mineflayer-pathfinder`

I did not find out how to use this plugin correctly.
Often the bot gets stuck and nothing happens.
And then the bot suddenly crashes with `EPIPE`.

I did not find a way yet to fix this problem.

It might have to do with `prismarine-physics`, see:

- <https://github.com/PrismarineJS/prismarine-physics/issues/67#issuecomment-1788369907>

So the idea is to work around the pathing issues:

- stop the pathing if the bot stops moving
- teleporting it a bit to a better state (just some 0.2 or the middle of the current block or so)
- and split long paths into shorter paths

Also I need it to be able to use doors, fences, trapdoors, ladders, vines and the like.

