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
    <div class="title-bar">
        <div class="bar" ref="bar">
            <div v-if="person" class="person">{{ person }}</div>
            <div class="title">{{ title }}</div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.title-bar {
    opacity: 0.8;
    .bar {
        margin: 20px;
        border-radius: 8px;
        padding: 4px;
        padding-left: 20px;
        background-color: #336699;
        .person {
            font-family: "TypoPRO Fira Sans";
            font-weight: normal;
            font-size: 14pt;
            color: #e0f0ff;
        }
        .title {
            font-family: "TypoPRO Fira Sans";
            font-weight: bold;
            font-size: 18pt;
            color: #f0f0f0;
        }
    }
}
</style>

<script>
module.exports = {
    name: "title-bar",
    props: {
        person: { type: String, default: "" },
        title:  { type: String, default: "" }
    },
    data: () => ({
    }),
    created () {
        this.$on("bounce", () => {
            let bar = this.$refs.bar
            anime.timeline({
                targets: bar,
                duration: 400,
                autoplay: true,
                direction: "normal",
                loop: 3,
                easing: "easeInOutSine"
            })
            .add({ scaleX: 1.10, scaleY: 1.20, translateY:  0, translateX:  0 })
            .add({ scaleX: 1.00, scaleY: 1.00, translateY:  0, translateX:  0 })
            .finished.then(() => {})
        })
    }
}
</script>

