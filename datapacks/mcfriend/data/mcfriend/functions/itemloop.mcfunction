execute as @e[type=minecraft:item,limit=60] run tp @s @e[name="mcFriend",limit=1]
schedule function mcfriend:itemloop 3s
