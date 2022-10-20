#!/usr/bin/env node
/*!
**  HUDS -- Head-Up-Display Server (HUDS)
**  Copyright (c) 2020-2022 Dr. Ralf S. Engelschall <rse@engelschall.com>
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
const fs      = require("fs")
const yargs   = require("yargs")
const chalk   = require("chalk")
const moment  = require("moment")

/*  internal requirements  */
const HUDS    = require("./huds-server-api.js")
const my      = require("../package.json")

/*  keep global HUDS instance  */
let huds = null

/*  establísh asynchronous context  */
;(async () => {
    /*  parse command-line arguments  */
    const argv = yargs
        /* eslint indent: off */
        .usage("Usage: $0 " +
            "[-h|--help] [-V|--version] " +
            "[-l|--log-file <log-file>] [-v|--log-level <log-level>] " +
            "[-a <address>] [-p <port>] " +
            "[-U <username>] [-P <password>] " +
            "[-b <broker>] [-n <name>] [-r <topic>] [-s <topic>] " +
            "[-d <hud-id>:<hud-directory>[,<hud-config-file>[,<hud-config-file>[,...]]]]"
        )
        .help("h").alias("h", "help").default("h", false)
            .describe("h", "show usage help")
        .boolean("V").alias("V", "version").default("V", false)
            .describe("V", "show version information")
        .string("l").nargs("l", 1).alias("l", "log-file").default("l", "-")
            .describe("l", "file for verbose logging")
        .number("v").nargs("v", 1).alias("v", "log-level").default("v", 2)
            .describe("v", "level for verbose logging (0-3)")
        .string("a").nargs("a", 1).alias("a", "address").default("a", "127.0.0.1")
            .describe("a", "IP address of service")
        .number("p").nargs("p", 1).alias("p", "port").default("p", 9999)
            .describe("p", "TCP port of service")
        .string("U").nargs("U", 1).alias("U", "username").default("U", "")
            .describe("U", "authenticating username for service")
        .string("P").nargs("P", 1).alias("P", "password").default("P", "")
            .describe("P", "authenticating password for service")
        .string("b").nargs("b", 1).alias("b", "broker").default("b", "")
            .describe("b", "URL of MQTT broker")
        .string("n").nargs("n", 1).alias("n", "name").default("n", "")
            .describe("n", "name of MQTT peer at MQTT broker")
        .string("r").nargs("r", 1).alias("r", "topic-recv").default("r", "")
            .describe("r", "receive topic at MQTT broker")
        .string("s").nargs("s", 1).alias("s", "topic-send").default("s", "")
            .describe("s", "send topic at MQTT broker")
        .array("d").nargs("d", 1).alias("d", "define").default("d", [])
            .describe("d", "define HUD id:dir[,file[,...]]")
        .version(false)
        .strict()
        .showHelpOnFail(true)
        .demand(0)
        .parse(process.argv.slice(2))

    /*  short-circuit processing of "-V" (version) command-line option  */
    if (argv.version) {
        process.stderr.write(`${my.name} ${my.version} <${my.homepage}>\n`)
        process.stderr.write(`${my.description}\n`)
        process.stderr.write(`Copyright (c) 2020-2022 ${my.author.name} <${my.author.url}>\n`)
        process.stderr.write(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>\n`)
        process.exit(0)
    }

    /*  use last supplied option only  */
    const reduce = (id1, id2) => {
        if (typeof argv[id1] === "object" && argv[id1] instanceof Array) {
            argv[id1] = argv[id1][argv[id1].length - 1]
            argv[id2] = argv[id2][argv[id2].length - 1]
        }
    }
    reduce("l", "logFile")
    reduce("v", "logLevel")
    reduce("a", "address")
    reduce("p", "port")
    reduce("U", "username")
    reduce("P", "password")
    reduce("b", "broker")
    reduce("n", "name")
    reduce("r", "topicRecv")
    reduce("t", "topicSend")

    /*  sanity check usage  */
    if (argv.define.length === 0)
        throw new Error("no HUDs defined")

    /*  log messages  */
    const levels = [
        { name: "ERROR",   style: chalk.red.bold },
        { name: "WARNING", style: chalk.yellow.bold },
        { name: "INFO",    style: chalk.blue },
        { name: "DEBUG",   style: chalk.green }
    ]
    if (argv.logLevel >= levels.length)
        throw new Error("invalid maximum verbose level")
    let stream = null
    if (argv.logFile === "-")
        stream = process.stdout
    else if (argv.logFile !== "")
        stream = fs.createWriteStream(argv.logFile, { flags: "a", encoding: "utf8" })
    const log = (level, msg) => {
        if (level <= argv.logLevel) {
            const timestamp = moment().format("YYYY-MM-DD hh:mm:ss.SSS")
            let line = `[${timestamp}]: `
            if (stream.isTTY)
                line += `${levels[level].style("[" + levels[level].name + "]")}`
            else
                line += `[${levels[level].name}]`
            line += `: ${msg}\n`
            stream.write(line)
        }
    }

    /*  startup HUDS  */
    huds = new HUDS({
        address:   argv.address,
        port:      argv.port,
        broker:    argv.broker,
        name:      argv.name,
        topicRecv: argv.topicRecv,
        topicSend: argv.topicSend,
        username:  argv.username,
        password:  argv.password,
        define:    argv.define,
        log: (level, msg) => log(level, msg)
    })
    await huds.start()

    /*  graceful termination handling  */
    let terminating = false
    const terminate = async (signal) => {
        if (terminating)
            return
        terminating = true
        log(3, `received ${signal} signal -- shutting down`)

        /*  shutdown HUDS  */
        await huds.stop()
        huds = null

        log(3, "process exit")
        process.exit(0)
    }
    process.on("SIGINT",  () => terminate("INT"))
    process.on("SIGTERM", () => terminate("TERM"))
})().catch(async (err) => {
    /*  fatal error handling  */
    if (huds !== null) {
        await huds.stop()
        huds = null
    }
    process.stderr.write(`huds: ERROR: ${err.message}\n`)
    process.exit(1)
})

