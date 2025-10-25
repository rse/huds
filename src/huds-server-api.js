/*
**  HUDS -- Head-Up-Display Server (HUDS)
**  Copyright (c) 2020-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

/*  external requirements  */
const path            = require("path")
const fs              = require("fs")
const HAPI            = require("@hapi/hapi")
const Inert           = require("@hapi/inert")
const HAPIAuthBasic   = require("@hapi/basic")
const HAPIWebSocket   = require("hapi-plugin-websocket")
const HAPITraffic     = require("hapi-plugin-traffic")
const HAPIHeader      = require("hapi-plugin-header")
const resolve         = require("resolve")
const jsYAML          = require("js-yaml")
const Latching        = require("latching")
const MQTT            = require("async-mqtt")
const mixinDeep       = require("mixin-deep")
const writeFileAtomic = require("write-file-atomic")
const my              = require("../package.json")

/*  encapsulate HUDS service  */
class HUDS {
    /*  establish object  */
    constructor (options = {}) {
        this.options = Object.assign({}, {
            address:      "127.0.0.1",
            port:         9999,
            username:     "",
            password:     "",
            broker:       "",
            name:         "",
            topicRecv:    "",
            topicSend:    "",
            defineConfig: [],
            defineState:  [],
            log:          null
        }, options)

        /*  initialize internal states  */
        this.latching = new Latching()
        this.HUD      = {}
        this.server   = null
        this.broker   = null
    }

    /*  internal logging function  */
    log (level, msg) {
        if (typeof this.options.log === "function")
            this.options.log(level, msg)
    }

    /*  start service  */
    async start () {
        /*  show startup message  */
        this.log(2, `starting Head-Up-Display Server (HUDS) ${my.version}`)

        /*  process HUD definitions  */
        const resolvePathname = async (pathname) => {
            let m
            let stat = null
            if ((m = pathname.match(/^@(.+)$/))) {
                try {
                    pathname = require.resolve(m[1])
                }
                catch (err) {
                    pathname = null
                }
            }
            if (pathname !== null)
                stat = await fs.promises.stat(pathname).catch(() => null)
            return { stat, pathname }
        }
        for (const spec of this.options.defineConfig) {
            /*  parse definition  */
            const m = spec.match(/^(.+?):(.+?)(?:,(.+))?$/)
            if (m === null)
                throw new Error(`invalid HUD id/directory/config combination "${spec}"`)
            const [ , id, dir, config ] = m
            if (this.HUD[id] !== undefined)
                throw new Error(`HUD "${id}" already defined`)

            /*  resolve file/directory  */
            let filename = null
            let { stat, pathname: dirResolved } = await resolvePathname(dir)
            if (stat === null)
                throw new Error(`HUD "${id}": base path "${dir}" not found`)
            if (stat.isFile()) {
                filename = path.basename(dir)
                const { stat: stat2, pathname: dirResolved2 } = await resolvePathname(path.dirname(dirResolved))
                stat = stat2
                dirResolved = dirResolved2
            }
            if (!stat.isDirectory())
                throw new Error(`HUD "${id}": base path "${dir}" not a directory`)
            this.log(2, `HUD definition: [${id}]: using base directory "${dirResolved}"`)

            /*  determine configuration data  */
            let data = {}
            if (config) {
                const configFiles = config.split(",")
                for (const configFile of configFiles) {
                    const { stat, pathname: configResolved } = await resolvePathname(configFile)
                    if (stat === null)
                        throw new Error(`HUD "${id}": config path "${configFile}" not found`)
                    if (!stat.isFile())
                        throw new Error(`HUD "${id}": config path "${configFile}" is not a file`)
                    this.log(2, `HUD definition: [${id}]: reading configuration file "${configResolved}"`)
                    const yaml = await fs.promises.readFile(configResolved, { encoding: "utf8" })
                    const obj = jsYAML.load(yaml)
                    data = mixinDeep(data, obj)
                }
            }

            /*  create HUD information  */
            this.HUD[id] = { dir: dirResolved, data }
            if (filename !== null)
                this.HUD[id].client = filename

            /*  optionally load additional HUD information  */
            const pkgFilename = path.resolve(path.join(dirResolved, "package.json"))
            stat = await fs.promises.stat(pkgFilename).catch(() => null)
            if (stat !== null && stat.isFile()) {
                const pkg = require(pkgFilename)
                if (typeof pkg.huds === "object") {
                    if (typeof pkg.huds.client === "string")
                        this.HUD[id].client = pkg.huds.client
                    if (typeof pkg.huds.server === "string") {
                        this.HUD[id].server = path.resolve(dirResolved, pkg.huds.server)
                        const plugin = require(this.HUD[id].server)
                        this.HUD[id].plugin = this.latching.use(plugin, {
                            log: (level, msg) => this.log(level, msg),
                            config: data
                        })
                    }
                }
            }
        }
        for (const spec of this.options.defineState) {
            /*  parse definition  */
            const m = spec.match(/^(.+?):(.+?)$/)
            if (m === null)
                throw new Error(`invalid HUD id/state combination "${spec}"`)
            const [ , id, state ] = m
            if (this.HUD[id] === undefined)
                throw new Error(`HUD "${id}" not already defined`)
            this.HUD[id].state = state
        }

        /*  establish REST server  */
        this.log(2, `listening to REST/Websocket service http://${this.options.address}:${this.options.port}`)
        this.server = HAPI.server({
            host:  this.options.address,
            port:  this.options.port,
            debug: false
        })

        /*  register HAPI plugins  */
        await this.server.register({ plugin: Inert })
        await this.server.register({ plugin: HAPIWebSocket })
        await this.server.register({ plugin: HAPIAuthBasic })
        await this.server.register({ plugin: HAPITraffic })
        await this.server.register({ plugin: HAPIHeader, options: { Server: `${my.name}/${my.version}` } })
        this.latching.hook("hapi:server", "none", this.server)

        /*  provide client IP address  */
        this.server.ext("onRequest", async (request, h) => {
            let clientAddress = "<unknown>"
            if (request.headers["x-forwarded-for"])
                clientAddress = request.headers["x-forwarded-for"]
                    .replace(/^(\S+)(?:,\s*\S+)*$/, "$1")
            else
                clientAddress = request.info.remoteAddress
            request.app.clientAddress = clientAddress
            this.latching.hook("hapi:on-request", "none", request, h)
            return h.continue
        })

        /*  log all requests  */
        this.server.events.on("response", (request) => {
            const traffic = request.traffic()
            let protocol = `HTTP/${request.raw.req.httpVersion}`
            const ws = request.websocket()
            if (ws.mode === "websocket") {
                const wsVersion = ws.ws.protocolVersion || request.headers["sec-websocket-version"] || "13?"
                protocol = `WebSocket/${wsVersion}+${protocol}`
            }
            const msg =
                "remote="   + request.app.clientAddress + ", " +
                "method="   + request.method.toUpperCase() + ", " +
                "url="      + request.url.pathname + ", " +
                "protocol=" + protocol + ", " +
                "response=" + (request.response ? request.response.statusCode : "<unknown>") + ", " +
                "recv="     + traffic.recvPayload + "/" + traffic.recvRaw + ", " +
                "sent="     + traffic.sentPayload + "/" + traffic.sentRaw + ", " +
                "duration=" + traffic.timeDuration
            this.log(2, `HAPI: request: ${msg}`)
            this.latching.hook("hapi:on-response", "none", request)
        })
        this.server.events.on({ name: "request", channels: [ "error" ] }, (request, event, tags) => {
            if (event.error instanceof Error)
                this.log(1, `HAPI: request-error: ${event.error.message}`)
            else
                this.log(1, `HAPI: request-error: ${event.error}`)
            this.latching.hook("hapi:on-request-error", "none", request)
        })
        this.server.events.on("log", (event, tags) => {
            if (tags.error) {
                const err = event.error
                if (err instanceof Error)
                    this.log(1, `HAPI: log: ${err.message}`)
                else
                    this.log(1, `HAPI: log: ${err}`)
            }
            this.latching.hook("hapi:on-log", "none", event, tags)
        })

        /*  register Basic authentication strategy  */
        const requireAuth = (this.options.username !== "" && this.options.password !== "")
        this.server.auth.strategy("basic", "basic", {
            validate: async (request, username, password, h) => {
                let isValid     = false
                let credentials = null
                if (username === this.options.username && password === this.options.password) {
                    isValid = true
                    credentials = { username }
                }
                const response = { isValid, credentials }
                this.latching.hook("hapi:validate", "none", response)
                return response
            }
        })

        /*  serve index endpoint  */
        this.server.route({
            method:   "GET",
            path:     "/",
            options: {
                auth: requireAuth ? { mode: "required", strategy: "basic" } : false
            },
            handler: async (req, h) => {
                let data =
                    `<!DOCTYPE html>
                     <html>
                         <head>
                             <title>HUDS</title>
                             <meta charset="utf-8">
                             <meta name="viewport" content="width=device-width, initial-scale=1.0">
                             <link rel="icon" href="data:image/x-icon;base64,AAABAAEAAQEAAAEAGAAsAAAAFgAAACgAAAABAAAAAgAAAAEAGAAAAAAACAAAACgAAAAoAAAAAAAAAAAAAADwgEEAAAAAAA==">
                         </head>
                         <body>
                             <ul>
                             ${/* eslint indent: off */ Object.keys(this.HUD).map((name) => {
                                 return `<li>HUD <a href="${name}/">${name}</a></li>`
                             }).join("\n")}
                             </ul>
                         </body>
                     </html>`
                data = this.latching.hook("hapi:serve-index", "pass", data)
                return h.response(data).code(200)
            }
        })

        /*  serve the static HUD files  */
        this.server.route({
            method:  "GET",
            path:    "/{id}/{file*}",
            options: {
                auth: requireAuth ? { mode: "required", strategy: "basic" } : false
            },
            handler: async (req, h) => {
                const id = req.params.id
                let file = req.params.file
                this.log(3, `HAPI: receive: remote=${req.info.remoteAddress}, id=${id}, file="${file}"`)
                if (this.HUD[id] === undefined)
                    return h.response().code(404)

                /*  handle special files  */
                if (file === "huds")
                    return h.file(path.join(__dirname, "../dst/huds-client.js"), { confine: false })
                if (file === "")
                    file = this.HUD[id].client ? this.HUD[id].client : "index.html"

                /*  allow hooks to serve file  */
                if (this.latching.hook("hapi:serve-static", "or", false, req, h, id, file))
                    return

                /*  serve file from NPM package or from the HUD directory  */
                let m
                if ((m = file.match(/^@(.+)$/))) {
                    file = m[1]

                    /*  try to serve file from NPM package, relative to HUD directory
                        (this is the standard case)  */
                    let resolved = await new Promise((promiseResolve) => {
                        resolve(file, { basedir: this.HUD[id].dir }, (err, res) => {
                            if (err) promiseResolve(null)
                            else     promiseResolve(res)
                        })
                    })
                    if (resolved === null) {
                        /*  try to serve file from NPM package, relative to HUDS perspective
                            (this is necessary if a HUD is installed with its own dependencies side-by-side)  */
                        try {
                            resolved = require.resolve(file)
                        }
                        catch (err) {
                            resolved = null
                        }
                    }
                    if (resolved === null)
                        return h.response().code(404)
                    const stat = await fs.promises.stat(resolved).catch(() => null)
                    if (stat === null)
                        return h.response().code(404)
                    if (!stat.isFile())
                        return h.response().code(404)
                    return h.file(resolved, { confine: false })
                }
                else {
                    /*  serve file from HUD directory  */
                    file = path.join(this.HUD[id].dir, file)
                    const stat = await fs.promises.stat(file).catch(() => null)
                    if (stat === null)
                        return h.response().code(404)
                    if (!stat.isFile())
                        return h.response().code(404)
                    file = path.resolve(file)
                    return h.file(file, { confine: this.HUD[id].dir })
                }
            }
        })

        /*  establish MQTT connection  */
        this.broker = null
        if (this.options.broker !== "" && (this.options.topicRecv !== "" || this.options.topicSend !== "")) {
            this.log(2, `connecting to MQTT broker ${this.options.broker}`)
            this.broker = await MQTT.connectAsync(this.options.broker, { rejectUnauthorized: false })
            this.latching.hook("mqtt:broker", "none", this.broker)
        }

        /*  state store  */
        const peers = {}

        /*  store MQTT send channel as a peer  */
        if (this.options.topicSend !== "" && this.options.name !== "")
            peers[this.options.name] = [ { mqtt: this.broker } ]

        /*  state fan-out  */
        const fanout = (source, target, event, data) => {
            this.log(3, `EVENT: emit: source-hud=${source}, target-hud=${target}, event=${event} data=${JSON.stringify(data)}`)
            const object = { id: target, event, data }
            this.latching.hook("fanout", "none", object, source, target, event, data)
            const message = JSON.stringify(object)
            if (peers[target] !== undefined) {
                peers[target].forEach((peer) => {
                    if (peer.ws) {
                        this.log(3, `WebSocket: send: remote=${peer.req.connection.remoteAddress}, message="${message}"`)
                        peer.ws.send(message)
                    }
                    else if (peer.mqtt) {
                        this.log(3, `MQTT: send: remote=${this.options.name}, message="${message}"`)
                        peer.mqtt.publish(this.options.topicSend, message, { qos: 2 })
                    }
                })
            }
        }

        /*  receive messages from MQTT topic  */
        if (this.options.broker !== "" && this.options.topicRecv !== "") {
            this.log(2, `subscribing to MQTT receive-topic "${this.options.topicRecv}"`)
            await this.broker.subscribe(this.options.topicRecv)
            this.broker.on("message", (topic, message) => {
                this.log(3, `MQTT: receive: topic="${topic}" message="${message}"`)
                this.latching.hook("mqtt:message", "none", topic, message)
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
                if (this.HUD[id] === undefined)
                    return
                const peer = this.options.name !== "" ? this.options.name : id
                fanout(peer, id, event, data)
            })
        }

        /*  serve client API library  */
        this.server.route({
            method:   "GET",
            path:     "/{id}/huds",
            options: {
                auth: requireAuth ? { mode: "required", strategy: "basic" } : false,
                cache: { expiresIn: 0, privacy: "private" }
            },
            handler: async (req, h) => {
                const id = req.params.id
                if (this.HUD[id] === undefined)
                    return h.response().code(404)
                const lib = await fs.promises.readFile(path.join(__dirname, "../dst/huds-client.js"), { encoding: "utf8" })
                const cfg = `HUDS.config(${JSON.stringify(this.HUD[id].data)})`
                let js = `${lib};\n${cfg};\n`
                js = this.latching.hook("serve-huds", "pass", js, req, h)
                return h.response(js).type("text/javascript").code(200)
            }
        })

        /*  provide exclusive WebSocket route  */
        this.server.route({
            method:  "POST",
            path:    "/{id}/events",
            options: {
                auth:    requireAuth ? { mode: "required", strategy: "basic" } : false,
                payload: { parse: false },
                plugins: {
                    websocket: {
                        only: true,
                        autoping: 30 * 1000,
                        connect: ({ req, ws }) => {
                            const id = req.url.replace(/^\/([^/]+)\/events$/, "$1")
                            if (this.HUD[id] === undefined) {
                                this.log(3, `WebSocket: connect: remote=${req.connection.remoteAddress}, hud=${id}, error="invalid-hud-id"`)
                                ws.close(1003, "invalid HUD id")
                            }
                            else {
                                this.latching.hook("websocket:connect", "none", req, ws, id)
                                if (peers[id] === undefined)
                                    peers[id] = []
                                peers[id].push({ req, ws })
                                this.log(3, `WebSocket: connect: remote=${req.connection.remoteAddress}, hud=${id}`)
                            }
                        },
                        disconnect: ({ req, ws }) => {
                            const id = req.url.replace(/^\/([^/]+)\/events$/, "$1")
                            if (this.HUD[id] === undefined)
                                this.log(3, `WebSocket: disconnect: remote=${req.connection.remoteAddress}, hud=${id}, error="invalid-hud-id"`)
                            else {
                                this.latching.hook("websocket:disconnect", "none", req, ws, id)
                                if (peers[id] !== undefined) {
                                    peers[id] = peers[id].filter((x) => x.ws !== ws)
                                    if (peers[id].length === 0)
                                        delete peers[id]
                                }
                                this.log(3, `WebSocket: disconnect: remote=${req.connection.remoteAddress}, hud=${id}`)
                            }
                        }
                    }
                }
            },
            handler: (req, h) => {
                /*  treat incoming messages as commands, too  */
                const id = req.params.id
                const message = req.payload.toString()
                this.latching.hook("websocket:message", "none", req, h, id, message)
                this.log(3, `WebSocket: receive: remote=${req.info.remoteAddress}, hud=${id}, message=${message}`)
                if (this.HUD[id] === undefined)
                    return h.response("invalid HUD id").code(404)
                let target, event, data
                try {
                    const obj = JSON.parse(message)
                    target = obj.id
                    event  = obj.event
                    data   = obj.data
                }
                catch (ex) {
                    return h.response("invalid HUD event message").code(400)
                }
                if (this.HUD[target] === undefined && peers[target] === undefined)
                    return h.response("invalid HUD target id").code(404)
                fanout(id, target, event, data)
                return h.response().code(201)
            }
        })

        /*  serve command endpoint  */
        this.server.route({
            method:   "GET",
            path:     "/{id}/event/{event}",
            options: {
                auth: requireAuth ? { mode: "required", strategy: "basic" } : false
            },
            handler: async (req, h) => {
                const id = req.params.id
                const event = req.params.event
                let data = req.query.data !== undefined ? req.query.data : "null"
                this.latching.hook("hapi:event", "none", req, h, id, event, data)
                this.log(3, `HAPI: GET: receive: remote=${req.info.remoteAddress}, hud=${id}, event=${event} data=${data}`)
                if (this.HUD[id] === undefined)
                    return h.response("invalid HUD id").code(404)
                try {
                    data = JSON.parse(data)
                }
                catch (ex) {
                    return h.response("invalid HUD event data").code(400)
                }
                fanout(id, id, event, data)
                return h.response().code(201)
            }
        })

        /*  serve command endpoint  */
        this.server.route({
            method:   "POST",
            path:     "/{id}/event/{event}",
            options: {
                auth: requireAuth ? { mode: "required", strategy: "basic" } : false,
                payload: { parse: false }
            },
            handler: async (req, h) => {
                const id = req.params.id
                const event = req.params.event
                let data = req.payload.toString()
                this.latching.hook("hapi:event", "none", req, h, id, event, data)
                this.log(3, `HAPI: POST: receive: remote=${req.info.remoteAddress}, hud=${id}, event=${event} data=${data}`)
                if (this.HUD[id] === undefined)
                    return h.response("invalid HUD id").code(404)
                try {
                    data = JSON.parse(data)
                }
                catch (ex) {
                    return h.response("invalid HUD event data").code(400)
                }
                fanout(id, id, event, data)
                return h.response().code(201)
            }
        })

        /*  serve data persistence endpoints  */
        this.server.route({
            method:  "GET",
            path:    "/{id}/state",
            options: {
                auth: requireAuth ? { mode: "required", strategy: "basic" } : false
            },
            handler: async (req, h) => {
                const id = req.params.id
                this.log(3, `HAPI: receive: remote=${req.info.remoteAddress}, id=${id}, state: read"`)
                if (this.HUD[id] === undefined)
                    return h.response("invalid HUD id").code(404)
                let data = {}
                if (this.HUD[id].state !== undefined) {
                    const stat = await fs.promises.stat(this.HUD[id].state).catch(() => null)
                    if (stat !== null && stat.isFile())  {
                        const yaml = await fs.promises.readFile(this.HUD[id].state, { encoding: "utf8" })
                        data = jsYAML.load(yaml)
                    }
                }
                return h.response(data).code(200)
            }
        })
        this.server.route({
            method:  "POST",
            path:    "/{id}/state",
            options: {
                auth: requireAuth ? { mode: "required", strategy: "basic" } : false,
                payload: { parse: true }
            },
            handler: async (req, h) => {
                const id = req.params.id
                this.log(3, `HAPI: receive: remote=${req.info.remoteAddress}, id=${id}, state: write"`)
                if (this.HUD[id] === undefined)
                    return h.response("invalid HUD id").code(404)
                if (this.HUD[id].state === undefined)
                    return h.response("no persistent HUDS state").code(503)
                const data = req.payload
                const yaml = jsYAML.dump(data, {})
                await writeFileAtomic(this.HUD[id].state, yaml, { encoding: "utf8" })
                return h.response().code(204)
            }
        })

        /*  start REST server  */
        await this.server.start()
    }

    /*  stop service  */
    async stop () {
        /*  show shutdown message  */
        this.log(2, `stopping Head-Up-Display Server (HUDS) ${my.version}`)

        /*  unlatching HUDS plugins  */
        this.log(3, "unlatching plugins")
        try {
            for (const id of Object.keys(this.HUD)) {
                if (this.HUD[id].plugin !== undefined) {
                    this.latching.unuse(this.HUD[id].plugin)
                    delete this.HUD[id].plugin
                }
            }
        }
        catch (ex) {
            /*  intentionally just ignore  */
        }

        /*  stopping HAPI service  */
        if (this.server !== null) {
            this.log(3, "stopping HAPI service")
            await this.server.stop().catch(() => {})
            this.server = null
        }

        /*  stopping MQTT service  */
        if (this.broker !== null) {
            this.log(3, "stopping MQTT service")
            await this.broker.end().catch(() => {})
            this.broker = null
        }
    }
}

/*  export HUDS service  */
module.exports = HUDS

