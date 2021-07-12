revolt-stack
============

CLI for working with the Revolt stack.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/revolt-stack.svg)](https://npmjs.org/package/revolt-stack)
[![Downloads/week](https://img.shields.io/npm/dw/revolt-stack.svg)](https://npmjs.org/package/revolt-stack)
[![License](https://img.shields.io/npm/l/revolt-stack.svg)](https://github.com/insertish/revolt-stack/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g revolt-stack
$ revolt COMMAND
running command...
$ revolt (-v|--version|version)
revolt-stack/0.1.1 linux-x64 node-v15.14.0
$ revolt --help [COMMAND]
USAGE
  $ revolt COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`revolt build [BASEFOLDER]`](#revolt-build-basefolder)
* [`revolt env [BASEFOLDER]`](#revolt-env-basefolder)
* [`revolt help [COMMAND]`](#revolt-help-command)
* [`revolt init [FOLDER]`](#revolt-init-folder)
* [`revolt run [BASEFOLDER]`](#revolt-run-basefolder)

## `revolt build [BASEFOLDER]`

Build Rust binaries and install Node dependencies.

```
USAGE
  $ revolt build [BASEFOLDER]

OPTIONS
  -r, --release  Tell Rust to create release build.

EXAMPLE
  $ revolt build
  Built projects and installed dependencies.
```

## `revolt env [BASEFOLDER]`

Configure shared environment file.

```
USAGE
  $ revolt env [BASEFOLDER]

OPTIONS
  -e, --empty  Create an empty environment file.

EXAMPLE
  $ revolt env
  Configured environment files.
```

## `revolt help [COMMAND]`

display help for revolt

```
USAGE
  $ revolt help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `revolt init [FOLDER]`

Setup a new Revolt stack in the current or given folder.

```
USAGE
  $ revolt init [FOLDER]

OPTIONS
  -f, --force

EXAMPLE
  $ revolt init
  Configured new Revolt stack.
```

## `revolt run [BASEFOLDER]`

Run full stack.

```
USAGE
  $ revolt run [BASEFOLDER]

OPTIONS
  -r, --release  Use release builds.
```
<!-- commandsstop -->
