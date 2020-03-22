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
    <div v-bind:style="style" class="progress-bar">
        <div class="svg" ref="svg">
        </div>
    </div>
</template>

<style lang="less" scoped>
.progress-bar {
    opacity: var(--opacity);
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
        opacity:     { type: Number, default: 1.0 },
        slots:       { type: Number, default: 10 },
        donecolorbg: { type: String, default: "" },
        donecolorfg: { type: String, default: "" },
        currcolorbg: { type: String, default: "" },
        currcolorfg: { type: String, default: "" },
        todocolorbg: { type: String, default: "" },
        todocolorfg: { type: String, default: "" }
    },
    data: () => ({
        pos: 0,
        config: huds.config()
    }),
    computed: {
        style: HUDS.vueprop2cssvar()
    },
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
            let W = el.clientWidth
            let H = el.clientHeight
            let svg = SVG().addTo(el).size(W, H)
            this.svg = svg
            this.box = []
            let b = 20
            let d = 4
            let w = Math.floor((W - b * 2) / this.slots) - d
            let h = H - b * 2
            for (let i = this.slots - 1; i >= 0; i--) {
                let x = i * (w + d)
                let y = 0
                let r = Math.floor(h * 0.15)
                let n = svg.nested().move(x, y).size(w + b * 2, h + b * 2)
                let g = n.group()
                let p = g.path().M(r, 0).L(w - r, 0)
                if (i === this.slots - 1)
                    p.Q(w, 0, w, r).L(w, h - r).Q(w, h, w - r, h)
                else
                    p.Q(w, r/4, w, r).L(w + r, h/2).L(w, h - r).Q(w, h - r/4, w - r, h)
                p.L(r, h)
                if (i === 0)
                    p.Q(0, h, 0, h - r).L(0, r).Q(0, 0, r, 0)
                else
                    p.Q(0, h, 0, h - r).L(r, h/2).L(0, r).Q(0, 0, r, 0)
                p.Z()
                let t = g.text((i + 1).toString())
                    .font({ family: "TypoPRO Fira Sans", size: h * 0.75, anchor: "middle" })
                p.move(b, b)
                t.move(b, b)
                t.center(b + w/2, b + h/2)
                this.box.unshift({ n, g, p, t })
            }
            this.updatex()
        },
        updatex () {
            let svg = this.svg
            for (let i = this.slots - 1; i >= 0; i--) {
                let { n, g, p, t } = this.box[i]
                if (i < this.pos) {
                    p.fill(this.donecolorbg)
                    t.fill(this.donecolorfg)
                        .font({ weight: "normal" })
                }
                else if (i === this.pos) {
                    n.front()
                    p.fill(this.currcolorbg)
                    t.fill(this.currcolorfg)
                        .font({ weight: 900 })
                    anime.timeline({
                        targets: g.node,
                        duration: 400,
                        autoplay: true,
                        direction: "normal",
                        easing: "easeInOutSine"
                    })
                    .add({ scaleX: 0.8, scaleY: 0.8, translateY: +12, translateX: +15, duration: 200 })
                    .add({ scaleX: 1.2, scaleY: 1.2, translateY:  -9, translateX: -15 })
                    .add({ scaleX: 1.0, scaleY: 1.0, translateY:   0, translateX:   0 })
                    .add({ scaleX: 1.1, scaleY: 1.1, translateY:  -3, translateX: -10 })
                    .add({ scaleX: 1.0, scaleY: 1.0, translateY:   0, translateX:   0, duration: 800 })
                    .finished.then(() => {})
                }
                else {
                    p.fill(this.todocolorbg)
                    t.fill(this.todocolorfg)
                        .font({ weight: "normal" })
                }
            }
        }
    }
}
</script>

