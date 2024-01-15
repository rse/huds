
# huds(8) -- Head-Up-Display Server (HUDS): Server API

## SYNOPSIS

```js
const HUDS = require("huds")

const huds = new HUDS({
    address:   "127.0.0.1",
    port:      9999,
    username:  "",
    password:  "",
    broker:    "mqtts://foo:bar@127.0.0.1:8883",
    name:      "trainer",
    topicRecv: "stream/trainer/sender",
    topicSend: "stream/trainer/receiver"
    defineConfig: [
        "analoglock:@analogclock,@analogclock/index-huds.yaml",
        "training:@huds-hud-training,@huds-hud-training/training.yaml"
    ],
    defineState: [],
    log: (level, msg) =>
        console.log(`[${level}] ${msg}\n`)
})
await huds.start()

[...]

await huds.stop()
```

## DESCRIPTION

This is the HUDS Server Application Programming Interface (API).

## HISTORY

HUDS was developed in March 2020 for being able
to easily create Head-Up-Displays (HUDs) for *OBS Studio*.

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

