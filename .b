#!/bin/bash

while	printf '%(%Y%m%d-%H%M%S)T %d\n' -1 $? && { ! read -t1 x || [ x != "$x" ]; }
do
	run-until-change b.js globals.js State.js -- ./b.js #8081
done

