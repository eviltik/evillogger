# evillogger
![Node.js CI](https://github.com/eviltik/evillogger/workflows/Node.js%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/evillogger.svg)](https://badge.fury.io/js/evillogger)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![Dependency Status](https://david-dm.org/eviltik/evillogger.svg)](https://david-dm.org/eviltik/evillogger)

NodeJS logger for daemons. Evilcluster compatible.


Installation
------------
```
$ npm install evillogger
```


Usage
-----
```js
const log = require('evillogger')('myProcessName');
// or
//const log = require('evillogger')();
// or
//const log = require('evillogger')(options)
// spaces: number of spaces around namespace, default 30
// repl: add \r before any output, default false
// colorize: color or not color, default true
// file: output to file


log.info('info !',{foo:'bar'});
log.warn('warn !!');
log.error(new Error('huhu'));

// will be shown only if DEBUG env var not empty
// or if you pass --debug as argument
log.debug('debug ...');
```

Output (stdout)
---------------
```console
$ node example\example1.js
11:50:45.952  0 | myProcessName        | info:  info ! { foo: 'bar' }
11:50:45.952  0 | myProcessName        | warn:  warn !!
11:50:45.952  0 | myProcessName        | error: Error: huhu
    at Object.<anonymous> (D:\git\evillogger\example\example1.js:5:11)
    at Module._compile (module.js:635:30)
    at Object.Module._extensions..js (module.js:646:10)
    at Module.load (module.js:554:32)
    at tryModuleLoad (module.js:497:12)
    at Function.Module._load (module.js:489:3)
    at Function.Module.runMain (module.js:676:10)
    at startup (bootstrap_node.js:187:16)
    at bootstrap_node.js:608:3
```
