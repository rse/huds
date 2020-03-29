
HUDS
====

**Head-Up-Display Server (HUDS)**

<p/>
<img src="https://nodei.co/npm/huds.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/huds.png" alt=""/>

Abstract
--------

HUDS is a small server providing a
Web service for serving one or more HTML Single-Page Applications (SPA)
which act as "Head-Up-Displays (HUD)" or "Overlays" in video
production scenarios. It is specially intended to be used with [OBS Studio](https://obsproject.com/)'s
[CEF](https://en.wikipedia.org/wiki/Chromium_Embedded_Framework)-based
[Browser Source](https://obsproject.com/wiki/Sources-Guide#browsersource)
and optionally the [Elgato Stream Deck](https://www.elgato.com/en/gaming/stream-deck)
remote control device and its [System:Website](https://help.elgato.com/hc/en-us/articles/360028234471-Elgato-Stream-Deck-System-Actions) function.

HUDS serves the static files of one or more HUD HTML5 SPAs, which
render the actual HUD display in OBS. It also provides a HUDS client API to
each HUD HTML5 SPA for establishing a WebSocket connection back to HUDS.
Over this WebSocket connection HUDS pushes events to each HUD which were
received by HUDS either via WebSocket connections or REST endpoints.
The REST endpoint is intended to be used by arbitrary Web clients to
send events to any HUD. Usually, this is used with the Stream Deck
System:Website plugin or with curl(1) on the command-line.

Installation
------------

Install Node.js and then install HUDS globally into your system with:

```
$ npm install -g huds
```

Example
-------

Run a minimalistic [Hello World sample HUD](./sample/) with:

```
$ git clone https://github.com/rse/huds/
$ huds -a 127.0.0.1 -p 9999 -U sample -P sample -d sample:huds/sample,huds/sample/sample.yaml
```

Usage
-----

HUDS provides the following command-line options:

-   `-h`, `--help`:<br/>
    show usage help

-   `-V`, `--version`:<br/>
    show version information")

        .string("l").nargs("l", 1).alias("l", "log-file").default("l", "-")
            .describe("l", "file for verbose logging")
        .number("v").nargs("v", 1).alias("v", "log-level").default("v", 3)
            .describe("v", "level for verbose logging (0-3)")
        .string("a").nargs("a", 1).alias("a", "address").default("a", "0.0.0.0")
            .describe("a", "IP address of service")
        .number("p").nargs("p", 1).alias("p", "port").default("p", 9090)
            .describe("p", "TCP port of service")
        .string("U").nargs("U", 1).alias("U", "username").default("U", "")
            .describe("U", "authenticating username for service")
        .string("P").nargs("P", 1).alias("P", "password").default("P", "")
            .describe("P", "authenticating password for service")
        .array("d").nargs("d", 1).alias("d", "define").default("d", [])
            .describe("d", "define HUD id:dir[,file]")

License
-------

Copyright &copy; 2020 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

