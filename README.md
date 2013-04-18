OneJS is a command-line utility for converting CommonJS packages to single, stand-alone JavaScript
files that can be run on web browsers.

```bash
$ one > browser.js
```

![](https://dl.dropbox.com/s/r29fc29iip3mj8u/onejs.jpg)

# DOCUMENTATION
* [Install](#install)
* [First Steps](#first-steps)
* [Advanced Usage](#advanced-usage)
    * [Saving Multiple Files & Async Loading](#multiple)
    * [Watching File Changes](#watching)
    * [Package Aliases](#alias)
    * [Accessing Global Browser Variables](#global-vars)
    * [Excluding Packages](#exclude)
    * [Filtering Modules](#filter)
    * [Customizing Global Name](#customize-name)
* [API Reference](#api)
    * [Command-Line API](#cli)
    * [NodeJS API](#nodejs)
    * [package.json](#packagejson)
* [Examples](#examples)
* [Troubleshooting](#troubleshooting)
* [Testing](#testing)

<a name="install"></a>
## Install
```bash
$ npm install -g one
```

<a name="first-steps"></a>
# First Steps

The quickest way of giving OneJS a try is to run "onejs build package.json" command in a project folder. It'll walk through all the directories, find
JavaScript files in the "lib" folder (if exists, and by considering .npmignore), and produce an output that can be run by any web browser and NodeJS, as well.

Bundle files produced by OneJS consist of a CommonJS implementation and the throughout package tree wrapped by [OneJS' templates](https://github.com/azer/onejs/tree/master/templates/dynamic).
And the produced output will be unobtrusive. Which means, your project will not conflict with any other JavaScript on the page that is embedded.

Once you produce the output, as you expect, it needs to be included by an HTML page, like the below example;

```bash
$ one build hello-world/package.json output.js
$ cat > index.html
<html>
    <script src="output.js"></script>
    <script>helloWorld();</script>
</html>
```

You may notice a function named `helloWorld` was called. That's what starts running your program by requiring the `main` module of the project.
Besides of that `helloWorld` refers to the main module, it also exports some utilities that can be useful. See following for an example;

```js
> helloWorld.require('./module');
[object ./module.js]
> helloWorld.require('dependency');
[object node_modules/dependency]
```

In addition to command-line API, there are two more ways to configure build options. You can have the configuration in a package.json manfest;

```json
{
    "name": "hello-world",
    "version": "1.0.0",
    "directories": {
        "lib": "lib"
    },
    "web": {
        "save": "bundle.js",
        "alias": {
            "crypto": "crypto-browserify"
        },
        "tie": {
            "jquery": "window.jQuery"
        }
    }
}
```

Or, you can write your own build script using OneJS' [chaining API](https://github.com/azer/onejs/blob/master/lib/chaining.js):

```js
// build.js
var one = require('../../../lib');

one('./package.json')
    .alias('crypto', 'crypto-browserify')
    .tie('pi', 'Math.PI')
    .tie('json', 'JSON')
    .exclude('underscore')
    .filter(/^build\.js$/)
    .filter(/^bundle\.js$/)
    .save('bundle.js');
```

<a name="advanced-usage"></a>
## Advanced Usage

<a name="multiple"></a>
### Saving Multiple Files & Async Loading

Specified dependencies (including their subdependencies) can be splitted to different files via `package.json` manifest.

```json
{
    "name": "hello-world",
    "version": "1.0.0",
    "dependencies": {
        "foo": "*",
        "bar": "*"
    },
    "web": {
        "save": {
            "hello-world": "hello-world.js",
            "bar": {
                "to": "bar.js",
                "url: "/js/bar.js"
            }
        }
    }
}
```

OneJS will be outputting an async require implementation to let you load splitted packages;

```js
// hello-world/index.js
var foo = require('foo');
    
require.async('bar', function(bar)){ // loads "/js/bar.js"
   console.log('dependencies are loaded!');     
   console.log(bar);
   // => [object bar]
});
```

<a name="watching"></a>
### Watching File Changes

OneJS doesn't have a watching utility since a built-in one becomes useless when you have other build steps.

Recommended way is to create a Makefile, and use the good tools such as [visionmedia/watch](https://github.com/visionmedia/watch)  to
, [isaacs/node-supervisor](https://github.com/isaacs/node-supervisor) build your project when there is a change. Following Makefile example watches files under /lib directory.

```make
SRC = $(wildcard lib/*/*.js)

build: $(SRC)
   @one build package.json bundle.js
```

Below command will be updating `bundle.js` when `lib/` has a change.

```bash
$ watch make
```

<a name="alias"></a>
### Package Aliases

Registers a new name for specified package. It can be configured via command-line, package.json and NodeJS APIs. 

```bash
$ one build package.json output.js --alias request:superagent,crypto:crypto-browserify
```

package.json
```json
{
    "name": "hello-world",
    "web": {
        "alias": {
            "crypto": "crypto-browserify"
        }
    }
}
```

NodeJS
```js
one('./package.json')
    .alias('crypto', 'crypto-browserify')
    .save('foo.js');
```

<a name="global-vars"></a>
### Accessing Global Browser Variables

OneJS doesn't stop you from accessing globals. However, you may want to use `require` for accessing some global variables, 
such as jQuery, for some purposes like keeping your source-code self documented. 

OneJS may tie some package names to global variables if demanded. And it can be configured via command-line, package.json and NodeJS APIs.

```bash
$ one build package.json output.js --tie jquery:jQuery,google:goog
```

package.json
```json
{
    "name": "hello-world",
    "web": {
        "tie": {
            "jquery": "jQuery",
            "google": "goog"
        }
    }
}
```

NodeJS
```js
one('./package.json')
    .tie('jquery', 'jQuery')
    .tie('google', 'goog')
    .save('foo.js');
```

<a name="exclude"></a>
### Excluding Packages

Excludes specified packages from your bundle.

```bash
$ one build package.json output.js --excude underscore
```

package.json
```json
{
    "name": "hello-world",
    "web": {
        "exclude": ["underscore"]
    }
}
```

NodeJS
```js
one('./package.json')
    .exclude('underscore')
    .save('foo.js');
```

<a name="filter"></a>
### Filtering Modules/Files

OneJS reads .npmignore to ignore anything not wanted to have in the bundle. In addition to .npmignore, you may also
define your own Regex filters to ignore files. This config is only provided for only NodeJS scripts.

```js
one('./package.json')
    .filter(/^build\.js$/)
    .filter(/^bundle\.js$/)
    .save('bundle.js');
```

<a name="add-deps"></a>
### Additional Dependencies

You may add some dependencies not defined in your package.json;

```js
one('./package.json')
   .dependency('request', '2.x')
   .dependency('async', '2.x')
   .save(function(error, bundle){
      
      bundle
      // => the source code
      
   })
```
<a name="dev-deps"></a>
### Enabling Development Dependencies

```js
one('./package.json')
   .devDependencies()
   .save('bundle.js')
```

<a name="customize-name"></a>
### Customizing Global Variable

OneJS defines the global variable that wraps the bundle by default. For example, a project named "hello-world" lies
under "helloWorld" object on the browsers.

To customize it, define "name" field on your package.json;

```json
{
    "name": "hello-world",
    "web": {
        "name": "HelloWorld"
    }
}
```

<a name="api"></a>
## API Reference
OneJS lets you pick any of the following ways to configure your build. 

<a name="packagejson"></a>
### package.json

```json
{
    "name": "hello-world",
    "version": "1.0.0",
    "directories": {
        "lib": "lib"
    },
    "web": {
        "name":"HelloWorld",
        "save": "bundle.js",
        "alias": {
            "crypto": "crypto-browserify"
        },
        "tie": {
            "jquery": "window.jQuery"
        }
    }
}
```

<a name="cli"></a>
### Command-Line

```bash
usage: onejs [action] [manifest] [options]

Transforms NodeJS packages into single, stand-alone JavaScript files that can be run at other platforms. See the documentation at http://github.com/azer/onejs for more information.

actions:
  build      <manifest> <target>          Generate a stand-alone JavaScript file from specified package. Write output to <target> if given any.
  server     <manifest> <port> <host>     Publish generated JavaScript file on web. Uses 127.0.0.1:1338 by default.

options:
  --debug                                 Enable SourceURLs.

  --alias <alias>:<package name>          Register an alias name for given package. e.g: request:superagent,crypto:crypto-browserify
  --tie <package name>:<global object>    Create package links to specified global variables. e.g; --tie dom:window.document,jquery:jQuery
  --exclude <package name>                Do not contain specified dependencies. e.g: --exclude underscore,request 
  --plain                                 Builds the package within a minimalistic template for the packages with single module and no dependencies.

  --quiet                                 Make console output less verbose.
  --verbose                               Tell what's going on by being verbose.
  --version                               Show version and exit.
  --help                                  Show help.
```

<a name="nodejs"></a>
### NodeJS

```js
// build.js
var one = require('../../../lib');

one('./package.json')
    .alias('crypto', 'crypto-browserify')
    .tie('pi', 'Math.PI')
    .tie('json', 'JSON')
    
    .include('optional-module.js')
    .dependency('optional-dependency', '2.x')
    .exclude('underscore')
    
    .filter(/^build\.js$/)
    .filter(/^bundle\.js$/)
    
    .devDependencies()
   
    .name('helloKitty')
    .save('bundle.js'); // or .save(function(error, bundle){  })
```


## Examples
// Following examples are out of date. Will be updated soon.

* [Fox](https://github.com/azer/fox/blob/master/lib/browser.js#L19)
* See the example project included in this repository
* MultiplayerChess.com ([Source Code](https://github.com/azer/multiplayerchess.com/tree/master/frontend) - [Output](http://multiplayerchess.com/mpc.js) )
* [ExpressJS built by OneJS](https://gist.github.com/2415048)
* [OneJS built by OneJS](https://gist.github.com/2998719)

# Troubleshooting

* The most common issue is to lack some dependencies. In that case, make sure that the missing dependency is located under `node_modules/` properly.
* Enabling verbose mode might be helpful: `onejs build package.json --verbose`
* See the content of `projectName.map` object if it contains the missing dependency

# TESTING

Run `npm test` for running all test modules. And run `make test module=?` for specific test modules;

```bash
> make test module=build
```
