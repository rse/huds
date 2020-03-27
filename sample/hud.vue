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
    <div v-bind:style="style" class="hud">
        <title-bar ref="titleBar" class="title"
            v-bind:opacity="config.title.opacity"
            v-bind:background="config.title.background"
            v-bind:iconname="config.title.iconname"
            v-bind:iconcolor="config.title.iconcolor"
            v-bind:nametext="config.title.nametext"
            v-bind:namecolor="config.title.namecolor"
            v-bind:titletext="config.title.titletext"
            v-bind:titlecolor="config.title.titlecolor"
        ></title-bar>
        <progress-bar ref="progressBar" class="progress"
            v-bind:opacity="config.progress.opacity"
            v-bind:slots="config.progress.slots"
            v-bind:donecolorbg="config.progress.donecolorbg"
            v-bind:donecolorfg="config.progress.donecolorfg"
            v-bind:currcolorbg="config.progress.currcolorbg"
            v-bind:currcolorfg="config.progress.currcolorfg"
            v-bind:todocolorbg="config.progress.todocolorbg"
            v-bind:todocolorfg="config.progress.todocolorfg"
        ></progress-bar>
        <banner class="banner"
            v-bind:opacity="config.banner.opacity"
            v-bind:background="config.banner.background"
            v-for="banner in config.banner.banner"
            v-bind:ref="'banner-' + banner.name"
            v-bind:iconname="banner.iconname"
            v-bind:iconcolor="banner.iconcolor"
            v-bind:titletext="banner.titletext"
            v-bind:titlecolor="banner.titlecolor"
        ></banner>
        <logo class="logo"
            v-bind:opacity="config.logo.opacity"
            v-html="config.logo.svg"
        ></logo>
    </div>
</template>

<style lang="less" scoped>
body {
    background-color: var(--background);
}
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
        width: 30%;
    }
    > .progress {
        position: absolute;
        bottom: 10px;
        left: 10px;
        width: 70%;
        height: 100px;
    }
    > .logo {
        position: absolute;
        top: 30px;
        right: 30px;
        width: 150px;
        height: auto;
    }
}
</style>

<script>
module.exports = {
    name: "hud",
    data: () => ({
        event: "test",
        config: huds.config(),
        banner: null,
        logo: null
    }),
    computed: {
        style: () => {
            return {
                background: huds.options.debug ? "#999999" : "transparent"
            }
        }
    },
    components: {
        "banner":       "url:banner.vue",
        "title-bar":    "url:title-bar.vue",
        "progress-bar": "url:progress-bar.vue",
        "logo":         "url:logo.vue"
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
        let progress = false
        for (const banner of this.config.banner.banner) {
            Mousetrap.bind(banner.key, (e) => {
                huds.send(huds.id, `banner-${banner.name}.event=toggle`)
            })
            huds.bind(`banner-${banner.name}`, [ "event" ], (key, val) => {
                if (val === "toggle") {
                    if (progress)
                        return
                    let b = this.$refs[`banner-${banner.name}`][0]
                    if (this.banner === b) {
                        /*  disable ourself  */
                        progress = true
                        this.banner.$emit("toggle")
                        setTimeout(() => {
                            this.banner = null
                            progress = false
                        }, 1000)
                    }
                    else if (this.banner !== null) {
                        /*  disable foreign, then enable ourself  */
                        progress = true
                        this.banner.$emit("toggle")
                        setTimeout(() => {
                            b.$emit("toggle")
                            setTimeout(() => {
                                this.banner = b
                                progress = false
                            }, 1000)
                        }, 1000)
                    }
                    else {
                        /*  enable ourself  */
                        progress = true
                        b.$emit("toggle")
                        setTimeout(() => {
                            this.banner = b
                            progress = false
                        }, 1000)
                    }
                }
            })
        }
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

