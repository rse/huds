/*
**  HUDS -- Head-Up-Display Server (HUDS)
**  Copyright (c) 2020-2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
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
const WebSocket    = require("@opensumi/reconnecting-websocket")
const micromatch   = require("micromatch")
const axios        = require("axios/dist/browser/axios.cjs")

class HUDS extends EventEmitter {
    constructor () {
        /*  initialize EventEmitter  */
        super()

        /*  determine own URL (for events via WebSockets)  */
        let url = ""
        if (document.location.protocol === "http:")
            url += "ws:"
        else if (document.location.protocol === "https:")
            url += "wss:"
        url += "//"
        url += document.location.host
        url += document.location.pathname
        url += "events"
        this.urlEvents = url

        /*  determine own URL (for states via REST)  */
        url = document.location.protocol
        url += "//"
        url += document.location.host
        url += document.location.pathname
        url += "state"
        this.urlState = url

        /*  determine own URL (for arbitrary access)  */
        url = document.location.protocol
        url += "//"
        url += document.location.host
        url += document.location.pathname
        this.urlPrefix = url

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
        this.emit("connect", this.urlEvents)
        this.ws = new WebSocket(this.urlEvents)
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
        this.emit("disconnect", this.urlEvents)
        if (this.ws !== null)
            this.ws.close()
    }

    /*  send an event to a HUD  */
    send (event, data = null, id = this.id) {
        if (this.ws === null)
            throw new Error("not connected")
        const message = JSON.stringify({ id, event, data })
        this.emit("send", message)
        this.ws.send(message)
    }

    /*  bind to a HUD event  */
    bind (pattern, receiver) {
        /*  sanity check and canonicalize arguments  */
        let patterns
        if (typeof pattern === "string")
            patterns = [ pattern ]
        else if (typeof pattern === "object" && pattern instanceof Array)
            patterns = pattern
        else
            throw new Error("invalid pattern argument")
        if (typeof receiver !== "function")
            throw new Error("invalid receiver argument")

        /*  react on received messages  */
        this.on("receive", (message) => {
            /*  parse event message  */
            let id, event, data
            try {
                const obj = JSON.parse(message)
                id    = obj.id
                event = obj.event
                data  = obj.data
            }
            catch (ex) {
                return
            }

            /*  filter event  */
            if (id !== this.id)
                return
            if (typeof event !== "string")
                return
            if (!micromatch.all(event, patterns))
                return

            /*  deliver event  */
            receiver(event, data)
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

    /*  convert HUDS config to VueJS properties  */
    config2vueprop (id, vue) {
        const config = this.config()
        if (typeof config[id] === "object") {
            for (const key of Object.keys(vue.$props)) {
                if (config[id][key] !== undefined)
                    vue[key] = config[id][key]
            }
        }
    }

    /*  convert VueJS properties to CSS variables  */
    static vueprop2cssvar (whitelist = null, blacklist = null) {
        return function () {
            const css = {}
            for (const key of Object.keys(this.$props)) {
                if ((whitelist === null && blacklist === null)
                    || (whitelist !== null && whitelist[key])
                    || (blacklist !== null && !blacklist[key])) {
                    css[`--${key}`] = this[key]
                }
            }
            return css
        }
    }

    /*  read state  */
    async stateRead () {
        const data = await axios({
            method:       "GET",
            url:          `${this.urlState}`,
            responseType: "json"
        }).then((response) => response.data).catch(() => null)
        return data
    }

    /*  write state  */
    async stateWrite (data) {
        await axios({
            method:       "POST",
            url:          `${this.urlState}`,
            headers: {
                "Content-Type": "application/json"
            },
            data
        }).catch(() => null)
    }

    /*  pass-through REST functionality  */
    async axios (options) {
        return axios({ ...options, url: `${this.urlPrefix}${options.url ?? ""}` })
    }
}

module.exports = HUDS

