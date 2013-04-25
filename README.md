## OneJS

Bundles NodeJS modules/libraries for web browsers.

```bash
$ one index.js > browser.js
```

Or, from NodeJS:

```js
one('index.js').save('bundle.js')
```

See tests for more examples and documentation.

## What's New?

* Static analysis
* New CLI & JavaScript API

## Manual

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

        -d      --debug       Enable SourceUrls and verbose mode.
        -o      --target      Target file to save the build.

        -g      --global      Expose a global require.
        -r      --require     Require given URI from the entry module. e.g -a .\/foo,underscore
        -t      --tie         Register a global variable as package. e.g -t math=Math,pi=Math.PI
        -i      --ignore      Ignore given modules or packages. e.g -i lib\/foo.js,underscore

        -v      --version     Show version and exit.
        -h      --help        Show this help and exist.

    DEBUGGING

        Enable debugging by setting the environment variable "DEBUG" as following

        DEBUG=one:* onejs
```

![](https://dl.dropboxusercontent.com/s/8d7jw10kjwveqs5/npmel_16.jpg)
