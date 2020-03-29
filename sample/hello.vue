
<template>
    <div v-bind:style="style" class="hello">
        {{ text }}
        </div>
    </div>
</template>

<style scoped>
.hello {
    position:         absolute;
    top:              100px;
    left:             200px;
    background-color: var(--background);
    color:            var(--foreground);
    padding:          10px;
    font-family:      sans-serif;
    font-size:        22pt;
}
</style>

<script>
module.exports = {
    name: "hello",
    props: {
        background: { type: String, default: "#f0f0f0"     },
        foreground: { type: String, default: "#666666"     },
        text:       { type: String, default: "Hello World" }
    },
    computed: {
        style: HUDS.vueprop2cssvar()
    },
    created () {
        huds.config2vueprop("hello", this)
        Mousetrap.bind("space", (e) => {
            huds.send(huds.id, "hello.event=bounce")
        })
        huds.bind("hello", [ "event" ], (key, val) => {
            if (val === "bounce")
                this.$emit("bounce")
        })
        this.$on("bounce", () => {
            anime.timeline({
                targets:   this.$el,
                duration:  400,
                autoplay:  true,
                direction: "normal",
                loop:      3,
                easing:    "easeInOutSine"
            })
            .add({ scaleX: 2.00, scaleY: 2.00 })
            .add({ scaleX: 1.00, scaleY: 1.00 })
        })
    }
}
</script>

