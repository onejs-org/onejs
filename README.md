## OneJS v3 [![Build Status](https://travis-ci.org/azer/onejs.png)](https://travis-ci.org/azer/onejs)

Bundles NodeJS modules/libraries for web browsers.

```bash
$ one index.js > browser.js
```

Or, from NodeJS:

```js
one('index.js').save('bundle.js')
```

See tests for more examples and documentation.

**[Looking for OneJS v2?](https://github.com/azer/onejs/tree/v2.5)**

![](https://dl.dropbox.com/s/r29fc29iip3mj8u/onejs.jpg)

#### What's New?

* Static analysis
* Core Builtins Like Browserify; https://github.com/azer/core-modules
* New CLI & JavaScript API

#### V2 Compatibility

* Multiple bundles, async require and in-manifest configurations haven't implemented yet.
* No more main modules. The specified entry module will be called by the bundle itself.

#### Projects Using V3

* [MultiplayerChess.com](http://multiplayerchess.com) ([Build](http://multiplayerchess.com/mpc.js))
* [FoxJS](http://github.com/azer/fox)  ([Build](https://github.com/azer/fox/blob/master/web/fox.js))
* [Ana Kaynak](http://anakaynak.com) ([Build](http://anakaynak.com/static/app/dist.js))

## Usage

### From Command-line

```
    USAGE

        onejs [entry] [options]

    ENTRY

       An entry might be any filename that's under an NPM package.

       Examples:

          onejs myapp/index.js
          cd myapp && onejs
          myapp test/index.js
          myapp lib/foo/bar.js

    OPTIONS
        -o      --target      Target file to save the build.

        -d      --debug       Enable SourceUrls and verbose mode.
        -g      --global      Expose a global require.
        -r      --require     Require given URI from the entry module. e.g -a .\/foo,underscore
        -i      --ignore      Ignore given modules or packages. e.g -i lib\/foo.js,underscore
        -n      --native      Forward builtins & unresolved modules to native/global require.

        -v      --version     Show version and exit.
        -h      --help        Show this help and exist.

    DEBUGGING

        Enable debugging by setting the environment variable "DEBUG" as following

        DEBUG=one:* onejs
```

### From JavaScript

```js
one('index.js').save('bundle.js')
```

All Available methods:

```js
one('index.js').debug().global().require('foobar').ignore('jquery').native().save('/tmp/foo.js')
```

See the command-line manual above for details.

## TODO

* -t --tie
* Async Require & Multiple Bundles
* Components/Assets

![](https://dl.dropboxusercontent.com/s/8d7jw10kjwveqs5/npmel_16.jpg)
