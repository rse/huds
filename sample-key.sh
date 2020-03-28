#!/bin/sh
##
##  uses:
##  Stream-Deck Key-Image Generator (SDKIG)
##  https://github.com/rse/sdkig/
##

sdkig -b 336699 -i couch                -I 99ccff -t "PAUSE"     -T ffffff -o sample-key-hud-banner-pause.png
sdkig -b bb0000 -i radiation-alt        -I ffc0c0 -t "RANT"      -T ffffff -o sample-key-hud-banner-rant.png
sdkig -b 339900 -i comments             -I c0ffc0 -t "Q&A"       -T ffffff -o sample-key-hud-banner-qna.png

sdkig -b 336699 -i list-alt             -I 90ccff -t "Agenda"    -T ffffff -o sample-key-hud-agenda.png

sdkig -b 336699 -i chevron-circle-left  -I 99ccff -t "Previous"  -T ffffff -o sample-key-hud-progress-prev.png
sdkig -b 336699 -i chevron-circle-right -I 99ccff -t "Next"      -T ffffff -o sample-key-hud-progress-next.png

sdkig -b ffffff -i images               -I 000000 -t "Studio"    -T 000000 -o sample-key-scene-studio-on.png
sdkig -b 000000 -i images               -I 999999 -t "Studio"    -T c0c0c0 -o sample-key-scene-studio-off.png
sdkig -b ffffff -i tablet               -I 000000 -t "Tablet"    -T 000000 -o sample-key-scene-tablet-on.png
sdkig -b 000000 -i tablet               -I 999999 -t "Tablet"    -T c0c0c0 -o sample-key-scene-tablet-off.png
sdkig -b ffffff -i laptop               -I 000000 -t "Notebook"  -T 000000 -o sample-key-scene-notebook-on.png
sdkig -b 000000 -i laptop               -I 999999 -t "Notebook"  -T c0c0c0 -o sample-key-scene-notebook-off.png
sdkig -b ffffff -i wifi                 -I 000000 -t "NDI"       -T 000000 -o sample-key-scene-ndi-on.png
sdkig -b 000000 -i wifi                 -I 999999 -t "NDI"       -T c0c0c0 -o sample-key-scene-ndi-off.png

sdkig -b ffffff -i tablet               -I 000000 -t "Tablet"    -T 000000 -o sample-key-source-tablet-on.png
sdkig -b 000000 -i tablet               -I 999999 -t "Tablet"    -T c0c0c0 -o sample-key-source-tablet-off.png
sdkig -b ffffff -i laptop               -I 000000 -t "Notebook"  -T 000000 -o sample-key-source-notebook-on.png
sdkig -b 000000 -i laptop               -I 999999 -t "Notebook"  -T c0c0c0 -o sample-key-source-notebook-off.png
sdkig -b ffffff -i wifi                 -I 000000 -t "NDI"       -T 000000 -o sample-key-source-ndi-on.png
sdkig -b 000000 -i wifi                 -I 999999 -t "NDI"       -T c0c0c0 -o sample-key-source-ndi-off.png

sdkig -b ff0000 -i dot-circle           -I ffffff -t "Record"    -T ffffff -o sample-key-record-on.png
sdkig -b 660000 -i dot-circle           -I ffffff -t "Record"    -T ffffff -o sample-key-record-off.png

