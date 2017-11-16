# evillogger
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

nodejs winston based logger


Installation
------------
```
$ npm install evillogger
```


Usage
-----
```js
var log = require('evilloger')('myProcessName');

log.info('info !',{foo:'bar'});
log.warn('warn !!');
log.error(new Error('huhu'));

// will be shown only if DEBUG env var not empty
// or if you pass --debug as argument
log.debug('debug ...');
```

stdout
------
```console
λ node example\example1.js
11:08:28.480 |   myProcessName - info:  info ! { foo: 'bar' }
11:08:28.482 |   myProcessName - warn:  warn !!
11:08:28.483 |   myProcessName - error: Error: huhu
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