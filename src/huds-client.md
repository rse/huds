
# huds(3) -- Head-Up-Display Server (HUDS): Client API

## SYNOPSIS

-   `index.html`:

    ```html
    [...]
    <html>
        <head>
            <script type="text/javascript" src="huds"></script>
            [....]
        </head>
        <body>
            <div id="hello">
                <hello></hello>
            </div>
            <script>
                huds = new HUDS()
                huds.connect()
                Vue.use(httpVueLoader)
                vm = new Vue({ el: "#hello", components: { "hello": "url:hello.vue" }})
            </script>
        </body>
    </html>
    ```

-   `hello.vue`:

    ```js
    <script>
    module.exports = {
        name: "hello",
        [...]
        computed: {
            style: HUDS.vueprop2cssvar()
        },
        created () {
            huds.config2vueprop("hello", this)
            [...]
            Mousetrap.bind("space", (e) => {
                huds.send(huds.id, "hello.event=bounce")
            })
            huds.bind("hello", [ "event" ], (key, val) => {
                if (val === "bounce")
                    this.$emit("bounce")
            })
            [...]
        }
    }
    ```

## HISTORY

HUDS was developed in March 2020 for being able
to easily create Head-Up-Displays (HUDs) for *OBS Studio*.

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

