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
        slots: {{ slots }}, pos: {{ pos }}
        <div class="two" ref="two">
        </div>
    </div>
</template>

<style scoped>
.progress-bar {
    color: red;
    border: 2px solid green;
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
        huds.bind("progress-bar", [ "event" ], (key, val) => {
            if (val === "prev" && this.pos > 0)
                this.pos--
            else if (val === "next" && this.pos < this.slots)
                this.pos++
        })
    },
    mounted () {
        let el = this.$refs.two
        var two = new Two({
            width: 200,
            height: 200
        }).appendTo(el)
        var circle = two.makeCircle(72, 100, 50)
        circle.fill = '#FF8000'
        circle.stroke = 'orangered'
        circle.linewidth = 5
        two.update()
    }
}
</script>

