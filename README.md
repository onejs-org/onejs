OneJS is a command-line utility for converting CommonJS packages to single, stand-alone JavaScript
files that can be run on other JavaScript platforms such as web browsers, unity, silkjs etc.

# Motivation
* **Reusability** OneJS aims to let developers run NodeJS modules and packages on all environments able to execute JavaScript.
* **Elegant Modularization** OneJS lets web projects benefit from CommonJS, an excellent proposal that gives us a very well designed way to structure JavaScript source codes.
* **NPM** It eventually makes it possible for web projects to use NPM. Which is a great tool that makes controlling dependencies even fun!
* **No Spaghetti Code** No awkward headers, no framework-specific definitions which become deprecated in a few years.
* **Reliable code generation** OneJS doesn't change your source code. It only generates a container environment that simply emulates NodeJS environment.
* **Unobtrusive Code** The source code OneJS generates wraps projects into a single, isolated JS object.

### Examples
* See the example project included in this repository
* See MultiplayerChess.com's source code. 

# Install
```bash
$ npm install one
```

* Tip: Pass -g parameter to install it globally. *

# Running Example Project
Building the test project is easiest way to give OneJS a test-drive. 

```bash
$ git clone git@github.com:azer/onejs.git
$ cd onejs
$ ./bin/onejs server example-project/package.json
```

The last command above will build the source code and start serving it with a debug page, at localhost:1338.
You can simply go to that URL and inspect the content of "exampleProject" object. The whole source code with 
dependencies (if exists) is wrapped by it. It also provides an external API for the possible clients, containing some methods 
such as require, main, stdin, stdout, stderror. 

```javascript
> exampleProject.require('dependency'), exampleProject.require('./b');
> exampleProject.lib.process.stdout.write("Hello World");
> exampleProject.stdout();
"Hello World"
```

# First Steps
FIXME

# API Reference
FIXME
