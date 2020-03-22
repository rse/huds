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
    <div class="progress-bar">
        <div class="svg" ref="svg">
        </div>
    </div>
</template>

<style lang="less" scoped>
.progress-bar {
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
            if (this.pos > 0)
                this.pos--
            this.updatex()
        })
        this.$on("next", () => {
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
                let w = Math.floor(W / this.slots) - 4
                let h = H
                let x = i * (w + 4)
                let y = 0
                let r = Math.floor(h * 0.15)
                let g = R.group()

                let p = R.path(0, 0)
                    .moveTo(x + r, y)
                    .lineTo(x + w - r, y)
                if (i === this.slots - 1)
                    p.curveTo(x + w, y, x + w, y + r)
                    .lineTo(x + w, y + h - r)
                    .curveTo(x + w, y + h, x + w - r, y + h)
                else
                    p.curveTo(x + w, y + r/4, x + w, y + r)
                    .lineTo(x + w + r, y + h/2)
                    .lineTo(x + w, y + h - r)
                    .curveTo(x + w, y + h - r/4, x + w - r, y + h)
                p.lineTo(x + r, y + h)
                if (i === 0)
                    p.curveTo(x, y + h, x, y + h - r)
                    .lineTo(x, y + r)
                    .curveTo(x, y, x + r, y)
                else
                    p.curveTo(x, y + h, x, y + h - r)
                    .lineTo(x + r, y + h/2)
                    .lineTo(x, y + r)
                    .curveTo(x, y, x + r, y)
                p.closePath()
                    .stroke(false)
                let s = p.copy()
                    .stroke(false)
                    .fill("rgba(0,0,0,0.1)")
                    .move(0, 0, true)
                let t = R.text(i.toString(), x + w/2, y + h - h/3)
                    .fontFamily("TypoPRO Fira Sans")
                    .fontSize(h * 2/4)
                    .textAlign("center")
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
                    p.fill("#6699cc")
                    t.fill("#f0f0ff")
                        .fontWeight("normal")
                }
                else if (i === this.pos) {
                    p.fill("#336699")
                    t.fill("#ffffff")
                        .fontWeight(900)
                        console.log(g)
                    /*
                    let x = { x: 0 }
                    anime({
                        targets: x,
                        x: [ 0, 1 ],
                        delay: 1000,
                        autoplay: true,
                        loop: false,
                        direction: "alternate",
                        easing: "easeInOutSine",
                        change: (anim) => {
                            console.log(x.x)
                            g.scale(1.01)
                            g.changed()
                            R.draw()
                        }
                    })
                    */
                }
                else {
                    p.fill("#f0f0f0")
                    t.fill("#cccccc")
                        .fontWeight("normal")
                }
            }
            R.draw()
        }
    }
}
</script>

