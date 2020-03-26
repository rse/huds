/*
**  HUDS -- Head-Up-Display Server (HUDS)
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

const EventEmitter = require("eventemitter3")
const WebSocket    = require("reconnecting-websocket")

class HUDS extends EventEmitter {
    constructor () {
        /*  initialize EventEmitter  */
        super()

        /*  determine own URL  */
        let url = ""
        if (document.location.protocol === "http:")
            url += "ws:"
        else if (document.location.protocol === "https:")
            url += "wss:"
        url += "//"
        url += document.location.host
        url += document.location.pathname
        url += "event"
        this.url = url

        /*  determine options  */
        this.options = {}
        if (document.location.hash) {
            document.location.hash.replace(/^#/, "").split(/,/).forEach((param) => {
                const m = param.match(/^(.+?)=(.*)$/)
                if (m !== null) {
                    const [ , key, val ] = m
                    this.options[key] = val
                }
                else
                    this.options[param] = true
            })
        }

        /*  determine own HUD id  */
        const m = document.location.pathname.match(/([^/]+)\/$/)
        this.id = m[1]

        /*  start with no WebSocket connection  */
        this.ws = null

        /*  start with no configuration  */
        this.data = {}
    }

    /*  connect to server  */
    connect () {
        this.disconnect()
        this.emit("connect", this.url)
        this.ws = new WebSocket(this.url)
        this.ws.addEventListener("open", (event) => {
            this.emit("open", event)
        })
        this.ws.addEventListener("close", (event) => {
            this.emit("close", event)
        })
        this.ws.addEventListener("error", (event) => {
            this.emit("error", event)
        })
        this.ws.addEventListener("message", (event) => {
            if (event.data === "")
                return
            this.emit("receive", event.data)
        })
    }

    /*  disconnect from server  */
    disconnect () {
        this.emit("disconnect", this.url)
        if (this.ws !== null)
            this.ws.close()
    }

    /*  send an event to a HUD  */
    send (id, event) {
        if (this.ws === null)
            throw new Error("not connected")
        this.emit("send", `${id}=${event}`)
        this.ws.send(`${id}=${event}`)
    }

    /*  bind to a HUD event  */
    bind (comp, props, receiver) {
        this.on("receive", (message) => {
            const m = message.match(/^([^.]+)\.([^=]+)=(.*)$/)
            if (m !== null) {
                const [ , prefix, key, val ] = m
                if (prefix === comp && props.indexOf(key) >= 0)
                    receiver(key, val)
            }
        })
    }

    /*  set HUD configuration  */
    static config (config) {
        HUDS._config = config
    }

    /*  get HUD configuration  */
    config (options = {}) {
        options = Object.assign({}, { flat: false, sep: "." }, options)
        if (options.flat) {
            const result = {}
            const walk = (name, data) => {
                if (typeof data === "object" && data instanceof Array && data !== null)
                    for (let i = 0; i < data.length; i++)
                        walk(name.concat([ i ]), data[i])
                else if (typeof data === "object" && data !== null)
                    for (const key of Object.keys(data))
                        walk(name.concat([ key ]), data[key])
                else
                    result[name.join(options.sep)] = data
            }
            walk([], HUDS._config)
            return result
        }
        else
            return HUDS._config
    }

    /*  convert VueJS properties to CSS variables  */
    static vueprop2cssvar () {
        return function () {
            const css = {}
            for (const key of Object.keys(this.$props))
                css[`--${key}`] = this[key]
            return css
        }
    }
}

module.exports = HUDS

