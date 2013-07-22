## OneJS v3 [![Build Status](https://travis-ci.org/azer/onejs.png)](https://travis-ci.org/azer/onejs)

Bundles NodeJS and Component modules for the web.

```bash
$ one index.js > browser.js
```

Or, from NodeJS:

```js
one('index.js').save('bundle.js')
```

See tests for more examples and documentation.

![](https://dl.dropbox.com/s/r29fc29iip3mj8u/onejs.jpg)

#### What's New?

* Static analysis
* Core Builtins Like Browserify; https://github.com/azer/core-modules
* Component Support
* New CLI & JavaScript API

#### V2 Compatibility

* Multiple bundles, async require and in-manifest configurations haven't implemented yet.
* No more main modules. The specified entry module will be called by the bundle itself.

#### Built with OneJS v3

* [MultiplayerChess.com](http://multiplayerchess.com) ([Build](http://multiplayerchess.com/mpc.js))
* [FoxJS](http://github.com/azer/fox)  ([Build](https://github.com/azer/fox/blob/master/web/fox.js))
* [7min.io](http://anakaynak.com) ([Build](http://7min.io/7min.js))

## Usage

### From Command-line

See [docs/man](https://github.com/azer/onejs/blob/master/docs/man)

### From JavaScript

```js
one('index.js').save('bundle.js')
```

All Available methods:

```js
one('index.js').debug().global().require('foobar').ignore('jquery').native().save('/tmp/foo.js')
```

See [docs/man](https://github.com/azer/onejs/blob/master/docs/man) the command-line manual above for details.

### Building Components

OneJS will also work with [Component](http://github.com/component/component) modules. You can pick any module from Component,
install in your project and bundle it the same way.

```bash
$ npm install
$ component install
$ onejs index.js -o dist.js
```

## TODO

* -t --tie
* Async Require & Multiple Bundles
