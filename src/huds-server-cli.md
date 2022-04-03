
# huds(8) -- Head-Up-Display Server (HUDS): Server CLI

## SYNOPSIS

`huds`
\[`-h`|`--help`\]
\[`-V`|`--version`\]
\[`-l`|`--log-file` *log-file*\]
\[`-v`|`--log-level` *log-level*\]
\[`-a`|`--address` *address*\]
\[`-p`|`--port` *port*\]
\[`-U`|`--username` *username*\]
\[`-P`|`--password` *password*\]
\[`-b`|`--broker` *mqtt-url*\]
\[`-n`|`--name` *mqtt-peer*\]
\[`-r`|`--topic-recv` *mqtt-topic*\]
\[`-s`|`--topic-send` *mqtt-topic*\]
\[`-d`|`--define` *hud-id*`:`*hud-directory*\[`,`*hud-config-file*\]\]

## DESCRIPTION

## OPTIONS

The following options exist:

-   \[`-h`|`--help`\]:
    Show program usage help.

-   \[`-V`|`--version`\]:
    Show program version information.

-   \[`-l`|`--log-file` *log-file*\]:
    File for verbose logging.

-   \[`-v`|`--log-level` *log-level*\]:
    Level for verbose logging (0-3).

-   \[`-a`|`--address` *address*\]:
    IP address of service.

-   \[`-p`|`--port` *port*\]:
    TCP port of service.

-   \[`-U`|`--username` *username*\]:
    Authenticating username for service.

-   \[`-P`|`--password` *password*\]:
    Authenticating password for service.

-   \[`-b`|`--broker` *mqtt-url*\]:
    URL of MQTT broker.

-   \[`-n`|`--name` *mqtt-peer-name*\]:
    name of MQTT peer at MQTT broker.

-   \[`-r`|`--topic-recv` *mqtt-topic*\]:
    receive topic at MQTT broker.

-   \[`-s`|`--topic-send` *mqtt-topic*\]:
    send topic at MQTT broker.

-   \[`-d`|`--define` *hud-id*`:`*hud-directory*\[`,`*hud-config-file*,\[...\]\]\]:
    Define a HUD under the unique identifier *hud-id*, with
    base directory *hud-directory* and zero or more
    (mixed together) YAML configuration files *hud-config-file*.

## EXAMPLE

```sh
$ git clone https://github.com/rse/huds-hud-hello
$ cd huds-hud-hello
$ huds -a 127.0.0.1 -p 9999 -U hello -P hello -d hello:.,hello.yaml
```

## HISTORY

HUDS was developed in March 2020 for being able
to easily create Head-Up-Displays (HUDs) for *OBS Studio*.

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

