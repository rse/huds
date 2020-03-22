<!--
/*
**  HUDS ~~ Head-Up-Display Server (HUDS)
**  Copyright (c) 2020 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
-->

<template>
    <div class="hud">
        <i class="fa fa-eye"></i> Event: {{ event }}
        <title-bar ref="titleBar" class="title"
            person="Dr. Ralf S. Engelschall"
            title="Grundlagen der IT-Architektur"></title-bar>
        <progress-bar ref="progressBar" class="progress" slots="16"></progress-bar>
    </div>
</template>

<style lang="less" scoped>
.hud {
    width: 100vw;
    height: 100vh;
    position: relative;
    font-family: sans-serif;
    font-size: 22pt;
    > .title {
        position: absolute;
        right: 10px;
        bottom: 10px;
        width: calc(30%);
        opacity: 0.8;
    }
    > .progress {
        position: absolute;
        bottom: 10px;
        left: 10px;
        width: calc(70%);
        height: 100px;
        opacity: 0.8;
    }
}
</style>

<script>
module.exports = {
    name: "hud",
    data: () => ({
        event: "test"
    }),
    components: {
        "title-bar":    "url:title-bar.vue",
        "progress-bar": "url:progress-bar.vue"
    },
    created () {
        huds.on("receive", (message) => {
            if (message !== "")
                this.event = message
        })
        Mousetrap.bind("left", (e) => {
            huds.send(huds.id, "progress.event=prev")
        })
        Mousetrap.bind("right", (e) => {
            huds.send(huds.id, "progress.event=next")
        })
        Mousetrap.bind("space", (e) => {
            huds.send(huds.id, "title.event=bounce")
        })
        huds.bind("title", [ "event" ], (key, val) => {
            let tb = this.$refs.titleBar
            if (val === "bounce")
                tb.$emit("bounce")
        })
        huds.bind("progress", [ "event" ], (key, val) => {
            let pb = this.$refs.progressBar
            if (val === "prev" || val === "next")
                pb.$emit(val)
        })
    }
}
</script>

