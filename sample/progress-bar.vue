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
    <div v-resize @resize="onResize" class="progress-bar">
        <div class="svg" ref="svg">
        </div>
    </div>
</template>

<style lang="less" scoped>
.progress-bar {
    border: 2px solid red;
    .svg {
        width: 100%;
        height: 100%;
    }
}
</style>

<script>
module.exports = {
    name: "progress",
    props: {
        slots: { default: 10, type: Number }
    },
    data: () => ({
        pos: 0
    }),
    created () {
        this.$on("prev", () => {
            console.log("PREV")
            if (this.pos > 0)
                this.pos--
            this.updatex()
        })
        this.$on("next", () => {
            console.log("NEXT")
            if (this.pos < this.slots - 1)
                this.pos++
            this.updatex()
        })
    },
    mounted () {
        this.renderx()
    },
    methods: {
        renderx () {
            let el = this.$refs.svg
            let w = el.clientWidth
            let h = el.clientHeight
            let R = new Rune({
                container: el,
                width:  w,
                height: h
            })
            this.R = R
            let W = R.width
            let H = R.height
            this.box = []
            for (let i = this.slots - 1; i >= 0; i--) {
                let w = Math.floor(W / this.slots) - 0.1
                let h = H
                let x = i * w
                let y = 0
                let r = Math.floor(w * 0.20)
                let g = R.group()
                let p = R.path(0, 0)
                    .moveTo(x, y)
                    .lineTo(x + w - r, y)
                    .curveTo(x + w, y + r/4, x + w, y + r)
                    .lineTo(x + w + r, y + h/2)
                    .lineTo(x + w, y + h - r)
                    .curveTo(x + w, y + h - r/4, x + w - r, y + h)
                    .lineTo(x, y + h)
                    .lineTo(x, y)
                    .closePath()
                    .stroke(false)
                let s = p.copy()
                    .stroke(false)
                    .fill("rgba(0,0,0,0.1)")
                    .move(4, 0, true)
                let t = R.text(i.toString(), x + w/4, y + h - h/4)
                    .fontFamily("Arial")
                    .fontSize(h * 2/4)
                    .stroke(false)
                s.addTo(g)
                p.addTo(g)
                t.addTo(g)
                this.box.unshift({ g, s, p, t })
            }
            this.updatex()
            R.draw()
        },
        updatex () {
            let R = this.R
            for (let i = this.slots - 1; i >= 0; i--) {
                let { g, s, p, t } = this.box[i]
                if (i < this.pos) {
                    p.fill("#c0d0f0")
                    t.fill("#90a0e0")
                }
                else if (i === this.pos) {
                    p.fill("#6699cc")
                    t.fill("#ffffff")
                }
                else {
                    p.fill("#f0f0f0")
                    t.fill("#cccccc")
                }
            }
            R.draw()
        },
        onResize (e) {
            console.log("resize event", e.detail.width, e.detail.height)
        }
    }
}
</script>

