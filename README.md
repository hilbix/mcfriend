> This is in its very early stages!  Do not expect too much!
>
> Not everything you see here is already implemented or working as advertized!

Currently I use a Vanilla Minecraft Server 1.20.4 which is not publicly open.

- with `online-mode=false`
- with [timber](https://www.planetminecraft.com/data-pack/timber-datapack/) installed
- with some additional modifications which are not in this repo yet
- and it is currently only meaningful for OPs of the server
- and it currently spams everything in the chat

> In future the `timber` databack will no more be needed I hope.
> Because of this it is not includeded, so you must download and install it yourself.

For Resources needed see below.


# MCfriend, your friendly Mincraft bot

This is a bot for a Vanilla Minecraft Server for Java Edition.

> To access the Server there are no modifications needed to the Vanilla Minecraft Client!

This is a way to automate tedious tasks in Minecraft like farming and looting.
And other things.

> This probably also runs on the Java Edition Minecraft Client if you open it to the LAN, too, but I am not sure.

This probably never supports Bedrock, sorry.

> Realms with Java Edition might work if you can install DataPacks.
> However as I do not have access to Realms (I think it is far too overpriced)
> I cannot test nor decribe it.


## Install

This is the current setup:

- Be sure to have NodeJS installed.
  - Currently you also need `npm`.
  - In future I want to get rid of `npm`, but this might become too difficult, we will see.
- In the Minecraft Server set `online-mode=false` in `server.properties`
  - Danger!  Servers with `online-mode=false` must not be accessible by the Internet, as anybody then can destroy your server.
  - Do not forget to restart the server after changing the setting
- The Server should listen on `127.0.0.1` and default port `25565`

> I use Debian Stable, so Node v18.19.0
>
> - If you need to change the name or parameters of the bot, see `bot.js` for now.
> - If you do not want `online-mode=false`, you need a Microsoft Account which has bought Minecraft and change the code to use that account and the Microsoft authentication scheme
> - Sorry, this all might be supported in future, but I cannot help you with this!  (Perhaps others can.  See FAQ.)

Then:

	git clone --recursive https://github.com/hilbix/mcfriend.git
	cd mcfriend
	npm install
	./bot.js [webport [serverport [serverip [webip]]]]

Note:

- Defaults are serverport `25565` and serverip `127.0.0.1`, where the bot expected the Server to listen
  - webport `8080` and webip `127.0.0.1`, where the prismarine-viewer of the bot listens
  - If you run the Server in a network namespace/schroot to shield it from the Internet, `bot.js` must run in the same namespace/schroot!
- `online-mode=false` in `server.properties` because passwords/logins are not implemented
- The username of the bot is named after the file
  - So above it is `bot`

Then initialize the bot on the Server Console:

	op bot
	tell bot op admin YourUsername
	tell bot say /trigger TimberToggle

- This all needs only to be done once
  - The bot must run as Server Admin to be able to use all commands
  - Also without Admin rights, the bot will be kicked from the server for spamming quite too often
- Above makes `YourUsername` (probably you) an Admin of the bot
  - The server console ist automatically always Admin, as long as it is still called `Server`


### install Datapacks

Following are needed on the Server currently.  Nothing needs to be installed on the clients, so a Vanilla client fully works.

Install [timber](https://www.planetminecraft.com/data-pack/timber-datapack/).

This is currently needed to allow the bot to chop down trees.

On the console enter:

	tell bot say /trigger TimberToggle

- This enables timber for the bot
  - In future the bot might take over what timber does, so we do no more need timber

Also install `datapacks/mcfriend` into `world/datapacks` like with this command (UNTESTED!):

	ln -s --relative datapacks/mcfriend ~/server/world/datapacks/

- This teleports all items which lay on the ground to an entity called `mcFriend`
  - This way you can put an Armor Standnamed named `mcFriend` (hint: Anvil) on top of a hopper to suck in all items
  - Note that a single Hopper usually is too slow, hence I use a bunch of Hopper Minecarts below the Armor Stand
  - These Hopper Minecarts are on a curved rail on top of a Hopper Minecart in the middle of 4 Hoppers enclosed by sand
  - So I can suck in 4 times the number of items this way and buffer a lot of items in the bunch of Hopper Minecarts
- This is because the bot breaks items in enormous numbers, so there must be something to pick them up, else they will vanish
- It is important to keep the Chunks loaded and active for this to work in all Worlds
- Either do not use the bot in other dimensions, so the Overworld is not unloaded
  - or use multiple named Armor Stands, so there always is one near you loaded and active
  - or you must run another bot near the Armor Stand to keep the item loaded and active
- In future there probably will be an autonomous collection bot doing all this


## Usage

To use the bot you need following:

- An unaltered vanilla Minecraft Server Java Edition
  - See Mojang.
  - Perhaps this works with altered Minecraft Servers, too, as only Vanilla compatibility is required
- A datapack which must be installed on the Minecracft Server
  - See `Install` above
- The NodeJS environment to run the bot code
  - See `Install` above
- A trainload of `npm` modules of others
  - See `Install` above
  - MineFlayer
  - PrismarineJS
  - and many many more
- Databacks
  - See `Install` above
- Running the bot's main script `bot.js`
  - which is in early Alpha stage

In future everything shall be assembled using only `git` for safety.
But for now this uses `npm`, so it is a bit dangerous as I am not able to verify that the code in the NPM-Registry is legit.

> `git` has the advantage, that (in contrast to `npm`) you can use it completely offline.
>
> Just do this to mirror it on a machine which can connect to the GitHub:
>
> ```
> mkdir "$HOME/git-mirror"
> cd "$HOME/git-mirror"
> git clone --mirror https://github.com/USER/REPO.git USER/REPO.git`
> ```
>
> Repeat the clone for each repository needed.
>
> Copy the `git-mirror` to your offline machine.  (Probably use a USB stick.)
>
> Then on the offline destination do:
>
> ```
> git config --global "url.$HOME/git-mirror/.insteadOf" https://github.com/
> ```
>
> Then the `Usage` below should work completely offline.  (In future, but not now.)


## Bot control and programming

- The bot is controlled by tells.
- Main programming is done with signs.
- And in future:
  - Books
  - and possibly loadable javascript modules

> Currently everything is hardcoded, in future this should become more customizable, but I cannot promise anything.

There are types of access control to the bot:

- A: admin  (Creative and bot Ops)
- B: user   (Survival)
- C: player (Adventure)
- D: guest  (Spectator)
- (future perhaps) E: not authenticated (Spectator)
- (future perhaps) F: Unknown (Spectator)

> Currently only A to C are implemented, D to F are currently just C for tells
> 
> Currently there is also no access control to signs, so anybody who is able to place or change signs is able to control the bot via signs.
>
> **Also many details below are not yet implmented!**

Block naming:

- Blocks and Items and entities are named by their `.name` and usually not by their `.displayName`
- Some internal routines might work with the `.displayName`, too.
  - But everything is case sensitive and probably language dependant then.
- There is a special bot internal empty namespace (so the name starts with `:`)
- If you leave the namespace away (no `:`), the bot first searches its internal namespace and then `minecraft:`
- The internal namespace supports block lists
  - These can have inclusions (name) and exclusions (!name)
  - Parsing lists is done step by step, so the first match wins
  - There is a hardcoded empty name (just `:`, nothing else) alias which matches anything (blocks, items, entities)

Lists are managed mainly with the `add` and `del` commands, see below.

	/tell bot add list NAME item..
	/tell bot del list NAME item..
	/tell bot set list NAME item..
	/tell bot list list NAME ..

To change the bots behavior you usually use the `set` command, see below.

	/tell bot set set NAME [value..]
	/tell bot list set [NAME..]


### Signs

The backside of a sign which contains a command to the bot is reserved for the bot.

Signs to program the bot have 4 lines at the front:

- line 1 is the name of the bot
  - optionally followed by a space and some `tag`
- line 2 is a command (see below)
- line 3 is an optional argument to the command
- line 4 is reserved for the bot itself
  - It carries state information to be read by the player

There can only be a single argument on signs.
This argument differs from command to command.  See below.

There are also regional signs where two signs define the region (cube or plane) to operate on.
To differentiate, use the same (optional) `tag` on both signs.


### Already working

- `sleep`
  - must be placed near/above the bed the bot shall use to sleep
  - the bot does not know where to sleep if this sign is missing
  - `autosleep` is currently enabled with `/tell bot autosleep`
  - `autosleep` is currently disabled with `/tell bot autosleep TEXT`

#### Partially implemented

- `tree`
  - between sign and tree there must be 1 empty block (for vines etc.)
  - this chops down and replants the tree (replant coming soon)
  - this needs the timber datapack being installed for now, because the bot only breaks a single block
  - you must give the bot a stone axe (in future it will fetch it from `get stone_axe` or `:axe` list)

#### Unsure if I ever get this working

- `door`
  - the bot does not break walls
  - must be placed above a door
  - bot can open the door to go through it
  - arg `closed`: tries to keep the door closed
  - if the bot cannot walk to the destination, it recursively tries all doors with a probably very stupid algorithm!

#### Planned (but not implemented)

- `get`
  - must be placed on a chest
  - arg: the block to fetch from the chest
- `empty`
  - must be placed on a chest
  - like `get`, but repeat until the chest is empty
  - arg missing: fetch anything in it
- `put`
  - must be placed on a chest
  - arg: block to put into the chest until chest is full
  - if missing, put anything in it
- `cache`
  - must be placed on a chest
  - same as `get` plus `put` together


### Tells

Common keywords used below:

- `PERM` can be `admin`, `user` or `player`
- `WHAT` can be `set` or `list`
- `LIST` can be `inv`, `op`, `set` or `sign`
- `NAME` is a single word
- `VAL` is a single word
- `VAL..` is a space separated list of values
- `TEXT` is a space separated list of words
  - multiple spaces are ignored and act as a single space
- `ENTITY` a minecraft entity `.name` or `.displayName`


#### A: Admin commands

- `add WHAT NAME [VAL..]` append VAL to NAME
  - NOT YET IMPLEMENTED
  - it is an error if VAL is already in NAME
- `del WHAT NAME [VAL..]` remove VAL from NAME
  - NOT YET IMPLEMENTED
  - it is an error if VAL is not in NAME
  - errors have no negative effect usually (they are only shown in the output)
- `ign MASK ENTITY`
  - temporary command, expected to change or vanish in future
  - ignore the given entity in certain aspects
  - MASK is an bitmask in decimal and undocumented, because it will vanish!
- `op PERM NAME`: set the op type of the given player NAME
  - To list them use `list op`
- `say TEXT`: let the bot speak something
  - Can be used to run server commands when something starts with `/`
- `set WHAT NAME [VAL..]`
  - NOT YET IMPLEMENTED
  - set (unconditionally change) a given parameter
- `unset`:
  - NOT YET IMPLEMENTED and may vanish


#### B: User commands

- `act` let the bot process all signs
  - temporary command, expected to change or vanish in future
- `come [LOC]` the bot moves near you or the given coordinates
- `drop` drop the given items or all
  - temporary command, expected to change or vanish in future
- `list LIST` give a list of the given LIST
  - if LIST is missing, possible values for LIST are output
  - Note that you only see settings which are `set` (or nonempty)
- `sleep` send the bot to sleep
  - see `autosleep`
  - if the bot cannot sleep, this sets the spawn point as usual
  - sleeping on a bed works even if the bed is behind a wall! (This bug is a feature.)
  - currently the bot does not find the way to the bed through doors


#### C: Player commands

- `eat ITEM` fetch food and eat
  - if ITEM is missing it uses some default food items
  - These are currently `cooked_chicken` and `bread` (both is easy to get)
  - Currently you cannot `set` the default food items
- `help TEXT` outputs possible commands
  - if TEXT is missing, possible values for TEXT are output
  - you only see commands you are allowed to use
  - there is no further deeper help for commands yet
  - many commands present a help if they are called without parameter
- `state` the bot tells its state


## Future (perhaps)

> Better skip this part and fast forward to "Resources needed"

This here is an unorganized scratchpad for things I want to remember for the future.

### Bot programming

#### Books

> (This is not yet implemented.)

By giving the bot a book, the bot learns the given tasks.
Each page is a single named task to process.

- The first line is the task's name which can then be used like a command or tell.
- Each other line then is a single command to process in sequence.
- After learing the commands, the bot automatically runs the command named after its name

There are following special tasks:

- `start` is executed after the bot starts into the game
  - for example after it was killed
- `default` runs if the bot has no more other tasks queued

Note that a task can only be queued once.
If a task is run which is interrupted, then the task continues from where it was interrupted.

Note that if you refer to a task or command, it is referenced in place.
Such that you can reassign or change the command.


#### Tells

- `stop` stops (aborts) the bot from what it is doing
- `halt` halts the bot, the bot then waits for the next command
- `continue` continues from where it was halted
- If the bot does not understand something it tells the status
- `bug` or `err`
  - the bot tells the last error encountered (usually sign failure)
- `do` bot continues its default work if it has nothing more to do
- `do command`
  - bot interrupts the current task, does the command, and then continues the interrupted task
- `stop`
  - bot stops
  - this also clears the command list
- `tp` the bot teleports to the player
- `tp pos` the bot teleports to the pos
- `follow` the player
  - bot walks to the position of the player and follows
- `lead` the player
  - the bot stops until the player comes near
  - then continues doing work as long as the player is near
- `then command`
  - add something to the task list
  - the previous task must be finished
- `do command`
  - interrupt the current task, do the command, then continue the task
- `forget task` removes a given task


#### Signs

- `trapdoor`
  - must be placed near the trapdoor
  - bot can open the trapdoor to fall through it
  - arg `closed`: tries to keep the trapdoor closed
  - if the bot cannot walk to the destination, it recursively tries all trapdoors with a probably very stupid algorithm!
- `fill`
  - look for a hole and fill it
  - give the block as option

Regional commands, there must be at least 2 signs just above diametral opposite edges of a cube.

- `place`
  - place the given block in this area
- `farm`
  - harvest the given plants (and replant them if needed)
  - this alternately places plants
- `break`
  - breaks all blocks in this area
  - you can add a block to break or not to break

#### Lists

- Lists refer to multiple items.
- Lists can refer to other lists, too.
- You can +item or -item
- Note that different bots can have different lists
- Use a book to program the bot


### Privileges

Not yet implemented.  In future this controls, which commands you can tell a robot.


### Standard library

T.B.D.

> Continue reading from here


## Resources needed

- The Mincraft Server should have at least 2 vCPU and 4 GB RAM
  - You can try with 2 GB, but I doubt this makes you happy
  - vCPU means threads, so a CPU with Hyperthreading counts as 2 vCPUs
- For bots you probably need 1 vCPU (combined) plus 1 GB (per bot) RAM
- The system itself shall have 1 vCPU and 1 GB left
- Combined this makes 4 vCPU and 6 GB RAM
  - This is exactly the VM paramters I test it with
  - It should run with 2 vCPU, but it is likely you will get some lag issues when the bot starts to spam commands to the server
  - May be that you can run on 4 GB RAM with 3 GB for the server and 1 GB shared for the bot+system
  - I would not even dare to try to run on only 2 GB RAM, but for a small single player test world this might be enough
  - If you use a Raspberry PI 5 for this, rather get one with 8 GB of RAM than one with only 4 GB or RAM
- You should not have less than 40 GB of disk space, better 60 GB or 80 GB if you are unable to extend it
  - 10 GB for `/`, 8 GB for `/var`, 2 GB for `/tmp`, and a `swap` partition of the size of RAM
  - If you have a separate `/boot` partition, use at least 1 GB, so you have enough room
  - Allow `/home` to be grown if you only start with 15 GB or less
  - Do not use a single partition setup, better use separate volumes
  - Rule of thumb:  When a parition fills above 70%, extend it
- On a Raspberry PI5 (with 8 GB):
  - This recommendation is based on what I think is appropriate, but I never did this myself!
  - Use at least a 32 GB SD card for the System which has a high TBW (Wear Leveling like the Samsung EVO cards).  Remember that access to the built in SD card slot is very slow!
  - Instead use a separate fast USB3 SSD or SD card for Minecraft.  External USB3 sticks usually break very soon, because they have a low or meaningless TBW.
  - For casual use I got good results with a genuine Samsung SD card with the original Samsung SD card reader bundle.  This is very fast, but I do not know if it runs stable enough.
  - Another way is an M2 SSD attached to the PI via USB3 or riser card, but I think this is a bit expensive.

Notes on the IO performance:

- The server has a low IO amount when it is idle
  - however it is constantly writing updates to disk
  - so it will wear out cheap USB/SD storage very fast
- When chunks are generated or areas are loaded, disk speed is crucial
  - When you explore new areas, the write speed can easily peak up to 10+ MB/s
  - When you teleport to existing areas, the read speed exceeds 40+ MB/s
- So USB2 speed is not enough, you need USB3 speed
  - Most USB3 sticks and USB3 card readers are real crap and do not reach this speed, even if advertised
- My recommention is that you should try genine Samsung flash storage devices and their readers
  - With these you usually can expect to reach at least half the speed that is advertised for real!
  - Remember that cooling SD/SSD is crucial
  - Hardware from good manufactureres usually slows down (a lot!) when it gets too hot
  - Hardware from bad/cheap/China manufacturers usually breaks or melts instead and might even burn down your house

Minecraft Network speed is moderate:

- This all is per player
- When idle
  - 16 KiB/s peak
   - 6 KiB/s average
- When exploring new areas
  - 3 MiB/s peak
  - 100 KiB/s average
- This is byte/second
  - Use factor 10 to calculate bit/s from this
  - There might be retransmissions and some other overhead
- Rule of thumb:
  - Do not use more than approx 50% of your line's average capacity
  - Peaks should not exceed 75% for a longer period of time
  - When it comes to network speed, a period of 1s already is long!  (So longer should not exceed 5s)
- Watch your ping
  - This is F3+3 in the Mincraft Client
  - Mine is 25 ms on average to my Server, which is 400km away.  I also use an `ssh` tunnel to my server.
  - A high ping usually means the connection to the server is too slow


## FAQ

WTF why?

- Because I am tired to rebuild everything when a new Minecraft Server comes out.
  - So in future the bot shall be able to rebuild everything for me
- This way I can concentrate on exploring the new world features
  - And do not need to do all the tedious preparation tasks myself

Second bot?

- The bot is named after the name of the executable.
- Make a copy of `bot.js`
  - `ln -s bot.js bot2.js`
- Then give the second bot an argument where to open the web control port:
  - `./bot2.js 8081`

Output?

- Currently the bot spams things to the Console, Chat and Tell.
  - Note it usually only chats when you use `tell bot` from the Server commandline
- Just ignore all this babble please
- Please do not count on that this will become better or more helpful in future.

Security

- Currently the bot is probably very insecure
  - So it probably can be used to destroy your server
  - This may change in a distant future, but has very low priority for me yet, sorry
  - This even may be true when you manage to run it with `online-mode=true`
- Be sure not to open a Vanilla server to the public when `online-mode=false`
  - Hence be sure that only you and your trusted friends can connect to your server!
  - `ssh -L 127.0.0.1:25565:127.0.0.1:25565 host` or the similar Putty tunnel is your friend for Linux based servers
  - On Windows probably use WSL
- Help (perhaps) welcome!
  - All players then spawn in Spectator mode
  - Unknown players must first register to the bot to get out of the Spectator mode
  - After authorization, the players will be put into the correct mode by the bot
  - Hopefully this can be archived with plain Vanilla without glitches

Signs?

- Signs are easy to use and are able to keep the bot state in-game.
  - So the bot does not keep states by itself, which might create asynchronicity issues
- Also if you reset your world or restore a backup of it, you do not need to worry much about bot states
  - The bot caches some information in the `.state.json`.  This will be automatically updated after you restore or change the world.
- However please keep in mind, there are some internal bot states which are saved into the `.state.json` file, like the `op` settings etc.
  - But hopefully this is what you want, because you certainly do not want old OPs to show up suddenly and unexpectedly.
- The internal state also contains what the bot has learned via books
  - (Note that books are not yet implemented)
  - Books are restored with the game, too, but this does not affect the state of the bot as long as the old books are not learned, too

Books?

- this is only some idea for a perhaps distant future
- If the bot learns a Written Book, it is imported into the internal state of the bot (and saved into the `.state.json` file)
- Therefor the book must be signed, such that the bot knows, if it is allowed to trust the book based on the player's name.
  - If the book contains a version, older versions cannot overwrite newer versions.
- You can obtain a copy of the book from the bot
  - This book then is not signed, so you can change it
- Note that the bot might get reset and forgets all books
  - Then it needs the old books to learn them again!
- At least this is the base idea.
  - There is no actual idea how a book then will look like

Help!

- Sorry, I probably cannot help you at all.
- But you can open an Issue on GitHub or send a PR.
  - Perhaps I listen.  But please do not count on that.
- Perhaps others can help you.
  - But do not count on that either, as probably you are the only one who knows about this here ;)
- Best probably is to ask on Reddit
  [`r/Minecraft`](https://www.reddit.com/r/Minecraft/) or
  [`r/MinecraftDe`](https://www.reddit.com/r/MinecraftDe/)

License?

- Free as free beer, free speech and free baby
