> This starts to work as intended.  Currently it still is a bit chaotic.
>
> Not everything you see here is already implemented or working as advertized!  
> Also it might be that features will change drastically.

Currently I use a Vanilla Minecraft Server 1.20.4 which is not publicly open.

- with `online-mode=false`
- with [timber](https://www.planetminecraft.com/data-pack/timber-datapack/) installed
- with some additional modifications which are not in this repo yet
- and it is currently only meaningful for OPs of the server
- and it currently spams everything in the chat

> In future the `timber` databack will no more be needed I hope.
> Because of this it is not includeded, so you must download and install it yourself.
>
> You need `timber` for `cmd/tree.js` to properly function

For Resources needed see below.

**Current state:**

- As mineflayer-pathfinder often hangs, I decided to not use it currently.
  Instead the bots teleport to the location.  This is imperfect, but works reliably.

- Many features are missing for now!  There is no security builtin, so the bots must run as `op`
   and you are able to destroy your server by sending commands to the bot.

- `cmd/harvest.js`: Farming Crops, Potato, Carrot, Beetroot
- `cmd/seed.js`: Seeding (planting) Crops, Potato, Carrot, Beetroot
- `cmd/chop.js`: Sugarcane, Bamboo
- `cmd/tree.js`: Chop down trees (needs `timber`)
- `cmd/take.js`: Loot items from chests, barrels and furnaces
- `cmd/put.js`: Put (sort!) items into chests and barrels
- `cmd/attack.js`:  Mobs are hardcoded in the script
  - And the bot frequently dies

- Sleeping works with the old `bot.js`
  - I only use the old one for sleeping and nothing else
  - The new `b.js` has no sleeping implemented (yet)

- Only the Overworld is supported.
  - The bots work in the Nether, too
  - The bots do not know how to enter the Nether
  - You need to teleport the bots to you


**Run the bot**

To connect the bot named `b` to Mincraft server running on `127.0.0.1:25565`:

	./b.js

Be sure to use `op b` to op the bot, else it will not work.

> To run it with a different name (here: `c`):
>
> `./b.js 0 0 0 0 c`
>
> **NOTE THAT THIS WILL CHANGE IN FUTURE!**
>
> Alternatively create a softlink and run the link:
>
> `ln -s b.js c.js`


**Sign navigation**

> The Bot is named `bot` in this example

- Create a sign with following 3 lines:
  - `bot` (this must be the topmost!)
  - `note` (this must be the second line)
  - `home` (this must be the third line)
  - (the fouth line is ignored)
  - (the backside of the sign is ignored)
- Then issue following command to teleport to the sign:
  - `/tell bot to home`
  - See `cmd/to.js`
- Create a second sign nerby with following 2 lines:
  - `bot`
  - `home`
- Then following command teleports the Bot to the sign:
  - `/tell bot home`
  - See `cmd/home.js`


**Example sorting:**

> The Bot is named `bot` in this example

- Build a first chest and put a sign on the chest with following lines
  - `bot` (this must be on the first line of the sign)
  - `take` (this must be the second line of the sign)
- Build a second chest with following sign on it
  - `bot`
  - `store`
  - `cobblestone`
- Build a third chest with following sign on it
  - `bot`
  - `put`
  - `MISC`

Now fill the first chest with some items, and some Cobblestone.  Then issue following command:

- `/tell bot take`
  - Pulls the items from the first chest
- `/tell bot list inv`
  - Lists the inventory of the bot
- `/tell bot put`
  - Sorts the items into the two other chests
  - Cobblestone goes into the second
  - Everything else goes into the third

To automate this (see `cmd/AUTO.js`):

- `/tell bot set auto:take:enabled =20`
  - runs `take` 20s after bot connected
- `/tell bot set auto:take:wait =60`
  - repeats `take` after 60s
- Similar to take:
  - `harvest`
  - `chop`
  - `attack`
  - `tree`
- Note that `attack` and `tree` also have `auto:tree:backoff`
  - This increases the waiting time if nothing is to do
  - See `cmd/AGAIN.js`

More controls:

- `/tell bot set conf quiet`
  - Makes the bot less chatty
- `/tell bot set conf verbose`
  - Adds some more diagnosic
- `/tell bot set auto -tree`
  - Removes all `auto:tree` settings

Lists:

- You can use lists to replace something with more entries
  - Recommended: Name lists `ALL_UPPERCASE`
- You can use `*` as an allquantor (there is only this!) for matching
- `/tell bot set list` lists all known lists
  - Initially there are none
- `/tell bot set list:BOTS a b c`
  - Adds entries `a`, `b` and `c` to the list
- `/tell bot set list:BOTS -a +b =c`
  - removes `a` from the list
  - adds `b` to the list
  - replaces the contents of the list with `c`
  - So afterwards the list only contains `c`
- Matching like `cobble*` is matched agains Minecraft names (mcData)
  - Also matches itself
- Lists can include lists
  - You cannot use matching for include lists
- Lists can exclude things with a preceeding `!`
  - `/tell bot list:COBBLES !cobblestone cobble*`
  - Matches all items/blocks starting with `cobble*`, except for `cobblestone` itself
- Lists can be hierarchial like `list:BOTS:overworld` and `lists:BOTS:nether`
  - They are referred to by `BOTS:overworld` and `BOTS:nether`
- To copy settings from one bot to another:
  - `/tell bot copy otherbot`
  - This copies all settings (see `/tell bot set`) to `otherbot`
  - Note that you can restrict what to export like `/tell bot copy otherbot conf:web`

> With a list like `BOTS` you can for example name the first line of a sign with `BOTS` instead of `bot`
>
> Then you can add and remove the names of the bots which shall use the sign.
>
> Or you can use it on the third line of a sign to specify more than one item (as signes are very limited in space)


**Example auto looting:**

- Name an Armorstand `mcFriend`
- Put the Armorstand on top of a hopper which goes into a chest
  - The chest should have a `take` sign, for the bots to understand where to fetch things
- Add `datapack/mcfriend` to `mincraft/world/datapacks/mcfriend/`
- You should see `mcFriend extension loaded` when starting the server
- This extension teleports all loose items to the Armorstand
  - such that the hopper catches them

**Web (mineflayer-viewer)**

- `/tell bot set conf:web:host =127.0.0.1`
  - This is the default
- `/tell bot set conf:web:port =8080`
  - This is the default
- `/tell bot set conf:web enabled`
  - This is needed to enable the web
- `/tell bot set conf:web -enabled`
  - Disable web again (does not touch host/port)
- `/tell bot set conf -web`
  - Disable web and remove all web setting
- `/tell bot set : -conf`
  - Remove all `conf` settings
  - Bot crashes, but recovers when run again


**Run the old bot for autosleeping**

> Note that the web port can be enabled in the code, search for `WEBPORT`

This connects the bot named `bot2` on Mincraft server `127.0.0.1:25565`:

	./bot.js '' '' '' '' bot2

Then

	/tell bot2 autosleep

In the game there must be a bed with a sign nearby which has on the front

- `bot2` on the first line
- `sleep` on the second line

The bot will walk to the bed and when night or thunderstorm comes it will fall asleep.

> Note that the bot can do much more than sleep, but I only use it for this purpose now.
> As soon as the new bot `b.js` works with sleeping, too, it will replace the old `bot.js` completely!


------------------------------------------------------------

> Following is old and need an overhaul
>
> **FOLLOWING IS NOT UP TO DATE AND POSSIBLY WRONG IN MANY WAYS!**

------------------------------------------------------------

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

- This all needs only to be done once (per bot)
  - The bot must run as Admin for the Minecraft Server to be able to use all Minecraft commands
  - Also without Minecraft Admin rights, the bot will be kicked from the server for spamming quite too often
  - The bot itslf should runs fine as unprivileged or restricted user, though, it only needs to be able to use all cheat codes for Minecraft
- Above makes `YourUsername` (probably you) an Admin of the bot
  - The server console ist automatically always Admin, as long as it is still called `Server`


### install Datapacks

Following additional things are needed on the Server currently.

> Nothing needs to be installed on the Minecraft Clients, so a Vanilla Clients fully work.

Install [timber](https://www.planetminecraft.com/data-pack/timber-datapack/).

> This is currently needed to allow the bot to chop down trees with a single hit.

On the console enter:

	tell bot say /trigger TimberToggle

- This enables timber for the bot
  - In future the bot might take over what timber does, so we do no more need timber

Also install `datapacks/mcfriend` into the Server's `world/datapacks/` like with this command:

	ln -s --relative datapacks/mcfriend ~/server/world/datapacks/

- The datapack currently is untested
  - It is a stripped down version of some other datapack which is not designed to be usable by others
- This teleports all items which lay on the ground to an entity called `mcFriend`
  - This way you can put an Armor Stand named `mcFriend` (hint: see Anvil) on top of a hopper to suck in all items
  - Note that a single Hopper usually is too slow, hence I use a bunch of Hopper Minecarts below the Armor Stand
  - These Hopper Minecarts are on a curved rail on top of a Hopper Minecart in the middle of 4 Hoppers enclosed by sand
  - So I can suck in 4 times the number of items this way and buffer a lot of items in the bunch of Hopper Minecarts
- This is needed, because the bot breaks items in enormous numbers, so there must be something to pick them up, else they will vanish
  - Note that the bot currently does not do this.  This is done by my undisclosed datapack, though, which will be replaced by the bot.
- It is important to keep the Chunks loaded and active for this to work in all Worlds
- Either do not use the bot in other dimensions, so the Overworld is not unloaded
  - or use multiple named Armor Stands, so there always is one near you loaded and active
  - or you must run another bot near the Armor Stand to keep the item loaded and active
- In future there probably will be an autonomous collection bot doing all this


## Usage

To use the bot you need following:

- An unaltered Vanilla Minecraft Server Java Edition
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
- Possibly in future:
  - Books
  - Javascript modules
  - Other scripts


### Commands

Commands are sent via tells and are handled by scripts and JavaScript modules which are executed on demand, see COMMANDS.md


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


### Lists

List management is implemented via Commands which use the API (see API.md) to mange the lists like this:

	/tell bot add NAME item..
	/tell bot del NAME item..
	/tell bot set NAME item..
	/tell bot list NAME ..

The first letter of `NAME` defines the type of lists:

- `i` are item lists, so every entry is an item/block etc., see Naming below
- `s` are settings which you can use to control the bot's behavior via certain values
  - Often this is just some value not a real list


### Naming

- Blocks and Items and entities are named by their `.name` and usually not by their `.displayName`
- Some internal routines might work with the `.displayName`, too.
  - But everything is case sensitive and probably language dependant then.
- There is a special bot internal empty namespace (so the name starts with `:`)
- If you leave the namespace away (no `:`), the bot first searches its internal namespace and then `minecraft:`
- The internal namespace supports lists
  - These can have inclusions (name) and exclusions (!name)
  - Parsing lists is done step by step, so the first match wins
  - There is a hardcoded empty name (just `:`, nothing else) alias which matches anything (blocks, items, entities)


### Books

> Books are not yet implemented

See BOOKS.md


### Privileges

Not yet implemented.  In future this controls, which commands you can tell a robot.


## Resources needed

- The Mincraft Server should have at least 2 vCPU and 4 GB RAM
  - You can try with 2 GB, but I doubt this keeps you happy
  - vCPU means threads, so a CPU with Hyperthreading counts as 2 vCPUs
- For bots you probably need 1 vCPU (combined) plus 1 GB (per bot) RAM
  - currenyly bots have a high CPU load when started, in future I'd like to reduce this
- The system itself shall have 1 vCPU and 1 GB left
- Combined this makes 4 vCPU and 6 GB RAM
  - My test VM has exactly this parameters
  - It should run with 2 vCPU, but it is likely you will get some lag issues when the bot starts to spam commands to the server
  - May be that you can run on 4 GB RAM with 3 GB for the server and 1 GB shared for the bot+system
  - I would not even dare to try to run on only 2 GB RAM, but for a small single player test world this might be enough
  - If you use a Raspberry PI 5 for this, rather get one with 8 GB of RAM than one with only 4 GB of RAM
- You should not have less than 40 GB of disk space, better 60 GB or 80 GB if you are unable to extend it on demand
  - 10 GB for `/`, 8 GB for `/var`, 2 GB for `/tmp`, and a `swap` partition of the size of RAM
  - If you have a separate `/boot` partition, use at least 1 GB, so you have enough room for future kernel variants
  - Allow `/home` to grow if you only start with 15 GB or less
  - Do not use a single partition setup, better use separate volumes
  - Rule of thumb:  When a parition fills above 70%, extend it
- On a Raspberry PI5 (with 8 GB):
  - This recommendation is based on what I think is appropriate, but I never did this myself!
  - Use at least a 32 GB SD card for the System which has a high TBW (Wear Leveling like the Samsung EVO cards).  Remember that access to the built in SD card slot is very slow!
  - Instead use a separate fast USB3 SSD or SD card for Minecraft.  External USB3 sticks usually break very soon, because they have a low or meaningless TBW.
  - For casual use I got good results with a genuine Samsung SD card with the original Samsung SD card reader bundle.  This is very fast, but I do not know if it runs stable enough.
  - Another way is an M2 SSD attached to the PI via USB3 or riser card, but I think this is a bit expensive.
  - BTW, ZFS runs fine on PIs, and is self healing in mirrored setups.

Notes on the IO performance:

- The Server has a low IO amount when it is idle
  - however it is constantly writing data to disk
  - so it will wear out cheap USB/SD storage very fast
- When chunks are generated or areas are loaded, disk speed is crucial
  - When you explore new areas, the write speed can easily peak up to 10+ MB/s
  - When you teleport to existing areas, the read speed exceeds 40+ MB/s
- So USB2 speed is not enough, you need real(!) USB3 speed
  - Most USB3 sticks and USB3 card readers are crap and do not reach this speed, even if advertised
- My recommention is that you should try genine Samsung flash storage devices and readers bundles from Samsung
  - With these you usually can expect to reach at least half the speed that is advertised for real!
  - Remember that cooling SD/SSD is crucial
  - Hardware from good manufactureres usually slows down (a lot!) when it gets too hot
  - Hardware from bad/cheap/China manufacturers usually breaks or melts instead and might even burn down your house

Minecraft Network speed is moderate:

- Following is per player
- When idle
  - 16 KiB/s peak
   - 6 KiB/s average
- When exploring new areas
  - 3-4 MiB/s peak
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
  - Mine is 25 ms on average to my Server, which is 400km away.  I also use an `ssh` tunnel to my Server.
  - A high ping usually means the connection to or from the Server is slow and probably too overloaded (too few Bandwidth)


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
  - as this has very low priority at my side

Security

- Currently the bot is probably very insecure
  - So it probably can be used to destroy your server if others gain access to the bot
  - This may change in a distant future, but has very low priority for me yet, sorry
  - This even may be true when you manage to run it with `online-mode=true`
- Be sure not to open a Minecraft Server to the public when `online-mode=false`
  - Hence be sure that only you and your trusted friends can connect to your Server!
  - Use `ssh -L 127.0.0.1:25565:127.0.0.1:25565 host` or a similar Putty tunnel
  - On Windows probably use WSL to run the server
- Help to implement Security (perhaps) welcome!
  - The idea is that all players first spawn in Spectator mode
  - Unknown players must first register to the bot to get out of the Spectator mode
  - After authorization, the players will be put into the correct mode (Adventure, Survival, Creative) by the bot
  - Hopefully this can be archived with plain Vanilla without glitches

Signs?

- Signs are easy to use and are able to keep the bot state in-game.
  - So the bot does not keep states by itself, which might create asynchronicity issues
  - Signs also allow bots (in future) to cooperate
- Also if you reset your world or restore a backup of it, you do not need to worry much about bot states
  - The bot caches some information in the `.state.json`.  This will be automatically updated after you restore or change the world.
- However please keep in mind, there are some internal bot states which are saved into the `.state.json` file, like the `op` settings etc.
  - But hopefully this is what you want, because you certainly do not want old OPs to show up suddenly and unexpectedly.
- The internal state will also contain what the bot has learned via books
  - (Note that books are not yet implemented)
  - Books are restored with the game, too, but this does not affect the state of the bot as long as the old books are not re-learned

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

