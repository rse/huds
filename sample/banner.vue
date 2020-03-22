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
    <div v-if="enabled" class="banner" ref="banner">
        <span class="icon"><i class="fa fa-pause-circle"></i></span>
        <slot></slot>
    </div>
</template>

<style lang="less" scoped>
.banner {
    opacity: 0.6;
    font-family: "TypoPRO Fira Sans";
    font-weight: bold;
    font-size: 100pt;
    padding-top: 80px;
    background-color: #000000;
    color: #ffffff;
    text-align: center;
    height: 240px;
    width: 1200px;
    position: absolute;
    top: 600px;
    left: -220px;
    transform: rotate(-45deg);
    transform-origin: top left;
    .icon {
        color: #ff0000;
        padding-right: 20px;
    }
}
</style>

<script>
module.exports = {
    name: "banner",
    props: {
        text: { type: String, default: "" },
    },
    data: () => ({
        enabled: true
    }),
    created () {
        this.$on("toggle", () => {
            this.enabled = !this.enabled
            if (this.enabled) {
                let banner = this.$refs.banner
                console.log(banner)
                anime.timeline({
                    targets: banner,
                    duration: 400,
                    autoplay: true,
                    direction: "normal",
                    loop: 3,
                    easing: "easeInOutSine"
                })
                .add({ scaleX: 1.10, scaleY: 1.20, translateY:  0, translateX:  0 })
                .add({ scaleX: 1.00, scaleY: 1.00, translateY:  0, translateX:  0 })
            }
        })
    }
}
</script>

